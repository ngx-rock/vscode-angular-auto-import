/**
 * Angular Indexer Service
 * Responsible for indexing Angular components, directives, and pipes.
 * @module
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  type ArrayLiteralExpression,
  type ClassDeclaration,
  type Decorator,
  type LiteralTypeNode,
  type ObjectLiteralExpression,
  Project,
  type PropertyAssignment,
  type SourceFile,
  SyntaxKind,
  type TypeChecker,
  type TypeReferenceNode,
} from "ts-morph";
import * as vscode from "vscode";
import { logger } from "../logger";
import { AngularElementData, type ComponentInfo, type FileElementsInfo } from "../types";
import {
  type AngularDependency,
  createElementComparator,
  findAngularDependencies,
  getLibraryEntryPoints,
  isStandalone,
  parseAngularSelector,
} from "../utils";

/**
 * Represents a node in a Trie data structure for storing selectors.
 * @internal
 */
class TrieNode {
  public children: Map<string, TrieNode> = new Map();
  public elements: AngularElementData[] = [];
}

/**
 * A Trie-based data structure for efficient searching of Angular selectors.
 * @internal
 */
class SelectorTrie {
  private root: TrieNode = new TrieNode();

  public insert(selector: string, elementData: AngularElementData): void {
    let currentNode = this.root;
    for (const char of selector) {
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, new TrieNode());
      }
      const nextNode = currentNode.children.get(char);
      if (!nextNode) {
        throw new Error("Unexpected missing node in trie insertion");
      }
      currentNode = nextNode;
    }
    // Avoid adding duplicate elements for the same selector
    if (!currentNode.elements.some((el) => el.name === elementData.name && el.path === elementData.path)) {
      currentNode.elements.push(elementData);
    }
  }

  public searchWithSelectors(prefix: string): { selector: string; element: AngularElementData }[] {
    let currentNode = this.root;
    for (const char of prefix) {
      if (!currentNode.children.has(char)) {
        return [];
      }
      const nextNode = currentNode.children.get(char);
      if (!nextNode) {
        return [];
      }
      currentNode = nextNode;
    }
    // We found the node for the prefix. Now collect everything underneath it.
    // The collector needs the prefix to build the full selectors.
    return this.collectAllElementsWithSelectors(currentNode, prefix);
  }

  public find(selector: string): AngularElementData | undefined {
    let currentNode = this.root;
    for (const char of selector) {
      if (!currentNode.children.has(char)) {
        return undefined;
      }
      const nextNode = currentNode.children.get(char);
      if (!nextNode) {
        return undefined;
      }
      currentNode = nextNode;
    }
    // No elements recorded for this selector
    if (currentNode.elements.length === 0) {
      return undefined;
    }

    // Fast-path if there is a single candidate
    if (currentNode.elements.length === 1) {
      return currentNode.elements[0];
    }

    // Heuristics for choosing the best candidate when multiple elements share the selector.

    // 1. Prefer elements whose *original* selector list contains the searched selector exactly.
    const exactMatches = currentNode.elements.filter((el) => {
      return el.originalSelector
        .split(",")
        .map((s) => s.trim())
        .some((part) => part === selector);
    });

    const candidatePool = exactMatches.length > 0 ? exactMatches : currentNode.elements;

    // 2. Sort candidates to apply additional preferences:
    //    a) Prefer components over directives over pipes.
    //    b) Prefer shorter original selector strings (less specific, e.g., no attribute constraints).
    //    c) Deterministic fallback – alphabetical by class name.
    // Sort using shared element comparator (without PascalCase matching for backward compatibility)
    candidatePool.sort(createElementComparator());

    return candidatePool[0];
  }

  public findAll(selector: string): AngularElementData[] {
    let currentNode = this.root;
    for (const char of selector) {
      if (!currentNode.children.has(char)) {
        return [];
      }
      const nextNode = currentNode.children.get(char);
      if (!nextNode) {
        return [];
      }
      currentNode = nextNode;
    }
    return currentNode.elements;
  }

  public getAllSelectors(): string[] {
    const selectors: string[] = [];
    this.collectSelectors(this.root, "", selectors);
    return selectors;
  }

  private collectSelectors(node: TrieNode, prefix: string, selectors: string[]): void {
    if (node.elements.length > 0) {
      selectors.push(prefix);
    }
    for (const [char, childNode] of node.children.entries()) {
      this.collectSelectors(childNode, prefix + char, selectors);
    }
  }

  public remove(selector: string, elementPath: string, elementName?: string): void {
    let currentNode = this.root;
    for (const char of selector) {
      if (!currentNode.children.has(char)) {
        return; // Selector doesn't exist
      }
      const nextNode = currentNode.children.get(char);
      if (!nextNode) {
        return; // Selector doesn't exist
      }
      currentNode = nextNode;
    }
    // Remove the element if it matches the path and optionally the name
    currentNode.elements = currentNode.elements.filter((el) => {
      const isPathMatch = path.resolve(el.path) === path.resolve(elementPath);
      if (!isPathMatch) {
        return true; // Path doesn't match, keep it.
      }
      // Path matches. If elementName is provided, we must also match its name to remove.
      if (elementName) {
        return el.name !== elementName; // Keep if name is different.
      }
      // Path matches and no name provided, means we remove all elements from this path for the given selector.
      return false;
    });
  }

  public getAllElements(): AngularElementData[] {
    return this.collectAllElements(this.root);
  }

  private collectAllElements(node: TrieNode): AngularElementData[] {
    let results: AngularElementData[] = [...node.elements];
    for (const childNode of node.children.values()) {
      results = results.concat(this.collectAllElements(childNode));
    }
    return results;
  }

  private collectAllElementsWithSelectors(
    node: TrieNode,
    currentSelector: string
  ): { selector: string; element: AngularElementData }[] {
    const results: { selector: string; element: AngularElementData }[] = [];

    if (node.elements.length > 0) {
      for (const element of node.elements) {
        results.push({ selector: currentSelector, element });
      }
    }

    for (const [char, childNode] of node.children.entries()) {
      results.push(...this.collectAllElementsWithSelectors(childNode, currentSelector + char));
    }

    return results;
  }

  public clear(): void {
    this.root = new TrieNode();
  }

  public get size(): number {
    return this.getAllSelectors().length;
  }
}

/**
 * Helper function to safely remove source files from ts-morph project
 * @param project - The ts-morph Project instance
 * @param context - Context string for logging purposes
 */
function removeAllSourceFiles(project: Project, context: string): void {
  project.getSourceFiles().forEach((sf) => {
    try {
      // Check if the sourceFile is still valid before removing
      sf.getFilePath(); // This will throw if the node is forgotten
      project.removeSourceFile(sf);
    } catch {
      // If the sourceFile node is already forgotten, skip it
      logger.debug(`SourceFile node already forgotten during ${context}, skipping removal`);
    }
  });
}

/**
 * Helper function to parse ɵmod property from Angular module classes
 * @param classDecl - The class declaration to parse
 * @returns The exports tuple if found, null otherwise
 */
function parseModDefinition(classDecl: ClassDeclaration): import("ts-morph").TupleTypeNode | null {
  const modDef = classDecl.getStaticProperty("ɵmod");
  if (!modDef?.isKind(SyntaxKind.PropertyDeclaration)) {
    return null;
  }

  const typeNode = modDef.getTypeNode();
  if (!typeNode?.isKind(SyntaxKind.TypeReference)) {
    return null;
  }

  const typeRef = typeNode as TypeReferenceNode;
  const typeArgs = typeRef.getTypeArguments();

  if (typeArgs.length <= 3 || !typeArgs[3].isKind(SyntaxKind.TupleType)) {
    return null;
  }

  return typeArgs[3].asKindOrThrow(SyntaxKind.TupleType);
}

/**
 * The main class responsible for indexing Angular elements in a project.
 */
export class AngularIndexer {
  /**
   * The ts-morph project instance.
   */
  project: Project;
  private fileCache: Map<string, FileElementsInfo> = new Map();
  private readonly selectorTrie: SelectorTrie = new SelectorTrie();

  private projectModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }> = new Map();
  /**
   * Index of external modules and their exported entities.
   * Key: module name (e.g., "MatTableModule")
   * Value: Set of exported entity names (e.g., Set(["MatTable", "MatHeaderCell", ...]))
   */
  private readonly externalModuleExportsIndex: Map<string, Set<string>> = new Map();
  /**
   * The file watcher for the project.
   */
  public fileWatcher: vscode.FileSystemWatcher | null = null;
  private projectRootPath: string = "";
  private isIndexing: boolean = false;

  /**
   * The cache key for the file cache in the workspace state.
   */
  public workspaceFileCacheKey: string = "";
  /**
   * The cache key for the selector index in the workspace state.
   */
  public workspaceIndexCacheKey: string = "";
  /**
   * The cache key for the module map in the workspace state.
   */
  public workspaceModulesCacheKey: string = "";
  /**
   * The cache key for the external modules exports index in the workspace state.
   */
  public workspaceExternalModulesExportsCacheKey: string = "";

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: false, // Keep this as false for real file system interaction
      skipAddingFilesFromTsConfig: true,
      // Consider adding compilerOptions from tsconfig if available for more accurate parsing,
      // but this might slow down initialization. For now, default is fine.
    });
  }

  /**
   * Clears all in-memory state (file cache, selector trie, module maps)
   * @internal
   */
  private clearInMemoryState(): void {
    this.fileCache.clear();
    this.selectorTrie.clear();
    this.projectModuleMap.clear();
    this.externalModuleExportsIndex.clear();
  }

  /**
   * Sets the root path of the project to be indexed.
   * @param projectPath The absolute path to the project root.
   */
  public setProjectRoot(projectPath: string) {
    this.projectRootPath = projectPath;
    // Re-creating the project instance is a simple approach.
    // If performance becomes an issue, the instance could be reused,
    // but we would need to ensure its file system view is kept consistent.
    this.project = new Project({
      useInMemoryFileSystem: false,
      skipAddingFilesFromTsConfig: true,
    });

    const projectHash = this.generateHash(projectPath).replace(/[^a-zA-Z0-9_]/g, "");
    this.workspaceFileCacheKey = `angularFileCache_${projectHash}`;
    this.workspaceIndexCacheKey = `angularSelectorToDataIndex_${projectHash}`;
    this.workspaceModulesCacheKey = `angularModulesCache_${projectHash}`;
    this.workspaceExternalModulesExportsCacheKey = `angularExternalModulesExports_${projectHash}`;
    logger.info(
      `AngularIndexer: Project root set to ${projectPath}. Cache keys: ${this.workspaceFileCacheKey}, ${this.workspaceIndexCacheKey}, ${this.workspaceModulesCacheKey}, ${this.workspaceExternalModulesExportsCacheKey}`
    );
  }

  /**
   * Initializes the file watcher for the project to keep the index up-to-date.
   * @param context The extension context.
   */
  initializeWatcher(context: vscode.ExtensionContext) {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
    if (!this.projectRootPath) {
      logger.error("AngularIndexer: Cannot initialize watcher, projectRootPath not set.");
      return;
    }

    const pattern = new vscode.RelativePattern(this.projectRootPath, "**/*.ts");
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.fileWatcher.onDidCreate(async (uri) => {
      logger.info(`Watcher (${path.basename(this.projectRootPath)}): File created: ${uri.fsPath}`);
      await this.updateFileIndex(uri.fsPath, context);
    });

    this.fileWatcher.onDidChange(async (uri) => {
      logger.info(`Watcher (${path.basename(this.projectRootPath)}): File changed: ${uri.fsPath}`);
      await this.updateFileIndex(uri.fsPath, context);
    });

    this.fileWatcher.onDidDelete(async (uri) => {
      logger.info(`Watcher (${path.basename(this.projectRootPath)}): File deleted: ${uri.fsPath}`);
      await this.removeFromIndex(uri.fsPath, context);
      // Also remove from ts-morph project
      const sourceFile = this.project.getSourceFile(uri.fsPath);
      if (sourceFile) {
        this.project.removeSourceFile(sourceFile);
      }
    });

    context.subscriptions.push(this.fileWatcher);
    logger.info(`AngularIndexer: File watcher initialized for ${this.projectRootPath} with pattern ${pattern.pattern}`);
  }

  /**
   * Generates a hash for a given string.
   * @param content The string to hash.
   * @returns The hash of the string.
   * @internal
   */
  private generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Parses a TypeScript file to find Angular elements.
   * @param filePath The path to the file.
   * @param content The content of the file.
   * @returns An array of `ComponentInfo` objects.
   * @internal
   */
  private parseAngularElementsWithTsMorph(filePath: string, content: string): ComponentInfo[] {
    if (!this.projectRootPath) {
      logger.error("AngularIndexer.parseAngularElementsWithTsMorph: projectRootPath is not set.");
      return this.getFallbackResult(filePath, content);
    }

    try {
      const sourceFile = this.getOrCreateSourceFile(filePath, content);
      const elements = this.extractElementsFromSourceFile(sourceFile, filePath, content);
      return this.applyFallbackIfNeeded(elements, filePath, content);
    } catch (error) {
      logger.error(`ts-morph parsing error for ${filePath} in project ${this.projectRootPath}:`, error as Error);
      return this.getFallbackResult(filePath, content);
    }
  }

  /**
   * Gets fallback result using regex parsing.
   */
  private getFallbackResult(filePath: string, content: string): ComponentInfo[] {
    const fallbackResult = this.parseAngularElementWithRegex(filePath, content);
    return fallbackResult ? [fallbackResult] : [];
  }

  /**
   * Gets or creates a source file for the given path and content.
   */
  private getOrCreateSourceFile(filePath: string, content: string): SourceFile {
    let sourceFile = this.project.getSourceFile(filePath);

    if (sourceFile) {
      sourceFile = this.updateExistingSourceFile(sourceFile, filePath, content);
    } else {
      sourceFile = this.project.createSourceFile(filePath, content, {
        overwrite: true,
      });
    }

    return sourceFile;
  }

  /**
   * Updates an existing source file or recreates it if forgotten.
   */
  private updateExistingSourceFile(sourceFile: SourceFile, filePath: string, content: string): SourceFile {
    try {
      sourceFile.getFilePath(); // This will throw if the node is forgotten
      sourceFile.replaceWithText(content);
      return sourceFile;
    } catch {
      logger.warn(`SourceFile node forgotten for ${filePath}, recreating...`);
      this.project.removeSourceFile(sourceFile);
      return this.project.createSourceFile(filePath, content, {
        overwrite: true,
      });
    }
  }

  /**
   * Extracts Angular elements from a source file.
   */
  private extractElementsFromSourceFile(sourceFile: SourceFile, filePath: string, content: string): ComponentInfo[] {
    const elements: ComponentInfo[] = [];
    const classes = sourceFile.getClasses();

    for (const classDeclaration of classes) {
      try {
        const elementInfo = this.extractAngularElementInfo(classDeclaration, filePath, content);
        if (elementInfo) {
          elements.push(elementInfo);
        }
      } catch (classError) {
        logger.warn(`Error processing class in ${filePath}: ${(classError as Error).message}`);
      }
    }

    return elements;
  }

  /**
   * Applies fallback parsing if no elements were found.
   */
  private applyFallbackIfNeeded(elements: ComponentInfo[], filePath: string, content: string): ComponentInfo[] {
    if (elements.length === 0) {
      const fallbackResult = this.parseAngularElementWithRegex(filePath, content);
      if (fallbackResult) {
        elements.push(fallbackResult);
      }
    }
    return elements;
  }

  /**
   * Extracts information about an Angular element from a class declaration.
   * @param classDeclaration The class declaration to extract information from.
   * @param filePath The path to the file.
   * @param fileContent The content of the file.
   * @returns A `ComponentInfo` object or `null` if the class is not an Angular element.
   * @internal
   */
  private extractAngularElementInfo(
    classDeclaration: ClassDeclaration,
    filePath: string,
    fileContent: string
  ): ComponentInfo | null {
    if (!classDeclaration.isExported()) {
      return null;
    }

    const className = classDeclaration.getName();
    if (!className) {
      return null;
    }

    const decorators = classDeclaration.getDecorators();
    for (const decorator of decorators) {
      const decoratorName = decorator.getName();
      let elementType: "component" | "directive" | "pipe" | null = null;
      let selector: string | undefined;
      const isStandaloneElement = isStandalone(classDeclaration);

      switch (decoratorName) {
        case "Component": {
          elementType = "component";
          const componentData = this.extractComponentDecoratorData(decorator);
          selector = componentData.selector;
          break;
        }
        case "Directive": {
          elementType = "directive";
          const directiveData = this.extractDirectiveDecoratorData(decorator);
          selector = directiveData.selector;
          break;
        }
        case "Pipe": {
          elementType = "pipe";
          const pipeData = this.extractPipeDecoratorData(decorator);
          selector = pipeData.name;
          break;
        }
      }

      if (elementType && selector) {
        return {
          path: path.relative(this.projectRootPath, filePath),
          name: className,
          selector,
          lastModified: fs.statSync(filePath).mtime.getTime(), // Ok, but content hash is better
          hash: this.generateHash(fileContent), // Use content for hash
          type: elementType,
          isStandalone: isStandaloneElement,
        };
      }
    }
    return null;
  }

  /**
   * Extracts the selector property from a decorator's argument object.
   * @param decorator The decorator to extract the selector from.
   * @param errorContext Context string for error logging (e.g., "component", "directive").
   * @returns The selector string or undefined.
   * @internal
   */
  private extractSelectorFromDecorator(decorator: Decorator, errorContext: string): string | undefined {
    try {
      const args = decorator.getArguments();
      if (args.length > 0 && args[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
        const objectLiteral = args[0] as ObjectLiteralExpression;

        const selectorProperty = objectLiteral.getProperty("selector");
        if (selectorProperty?.isKind(SyntaxKind.PropertyAssignment)) {
          const initializer = selectorProperty.getInitializer();
          if (initializer?.isKind(SyntaxKind.StringLiteral)) {
            return initializer.getLiteralText();
          }
        }
      }
    } catch (error) {
      logger.error(`Error extracting ${errorContext} selector from decorator:`, error as Error);
    }
    return undefined;
  }

  /**
   * Extracts the selector from a `@Component` decorator.
   * @param decorator The decorator to extract information from.
   * @returns An object containing the selector.
   * @internal
   */
  private extractComponentDecoratorData(decorator: Decorator): { selector?: string } {
    return { selector: this.extractSelectorFromDecorator(decorator, "component") };
  }

  /**
   * Extracts the selector from a `@Directive` decorator.
   * @param decorator The decorator to extract information from.
   * @returns An object containing the selector.
   * @internal
   */
  private extractDirectiveDecoratorData(decorator: Decorator): { selector?: string } {
    return { selector: this.extractSelectorFromDecorator(decorator, "directive") };
  }

  /**
   * Extracts the name from a `@Pipe` decorator.
   * @param decorator The decorator to extract information from.
   * @returns An object containing the name.
   * @internal
   */
  private extractPipeDecoratorData(decorator: Decorator): { name?: string } {
    let name: string | undefined;

    try {
      const args = decorator.getArguments();
      if (args.length > 0 && args[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
        const objectLiteral = args[0] as ObjectLiteralExpression;

        const nameProperty = objectLiteral.getProperty("name");
        if (nameProperty?.isKind(SyntaxKind.PropertyAssignment)) {
          const initializer = nameProperty.getInitializer();
          if (initializer?.isKind(SyntaxKind.StringLiteral)) {
            name = initializer.getLiteralText();
          }
        }
      }
    } catch (error) {
      logger.error("Error extracting pipe name from decorator:", error as Error);
    }

    return { name };
  }

  /**
   * Parses a TypeScript file using regex to find Angular elements. This is a fallback for when ts-morph fails.
   * @param filePath The path to the file.
   * @param content The content of the file.
   * @returns A `ComponentInfo` object or `null` if no element is found.
   * @internal
   */
  private parseAngularElementWithRegex(filePath: string, content: string): ComponentInfo | null {
    // This is a fallback, ensure it's robust enough or log clearly when it's used.
    // Note: This regex approach only finds the first element, unlike the ts-morph approach
    if (!this.projectRootPath) {
      logger.warn(
        "AngularIndexer.parseAngularElementWithRegex: projectRootPath is not set. Regex parsing might be unreliable."
      );
      // Allow to proceed but with caution
    }

    const selectorRegex = /selector:\s*['"]([^'"]*)['"]/;
    const pipeNameRegex = /name:\s*['"]([^'"]*)['"]/;
    const classNameRegex = /export\s+class\s+(\w+)/;
    const decoratorRegex = /@(Component|Directive|Pipe)\s*\(/;

    const decoratorMatch = decoratorRegex.exec(content);
    if (!decoratorMatch) {
      return null;
    }

    const decoratorType = decoratorMatch[1].toLowerCase() as "component" | "directive" | "pipe";

    const classNameMatch = classNameRegex.exec(content);
    if (!classNameMatch?.[1]) {
      return null;
    }

    let selector: string | undefined;
    if (decoratorType === "pipe") {
      selector = pipeNameRegex.exec(content)?.[1];
    } else {
      selector = selectorRegex.exec(content)?.[1];
    }

    if (selector) {
      return {
        path: this.projectRootPath ? path.relative(this.projectRootPath, filePath) : filePath,
        name: classNameMatch[1],
        selector,
        lastModified: fs.statSync(filePath).mtime.getTime(),
        hash: this.generateHash(content),
        type: decoratorType,
        isStandalone: false, // Fallback parser cannot determine this, default to false.
      };
    }
    return null;
  }

  /**
   * Updates the index for a single file.
   * @param filePath The path to the file.
   * @param context The extension context.
   * @internal
   */
  private async updateFileIndex(
    filePath: string,
    context: vscode.ExtensionContext,
    isExternal: boolean = false
  ): Promise<void> {
    try {
      if (!this.validateFileForIndexing(filePath)) {
        return;
      }

      const { content, hash, lastModified, cachedFile } = this.readFileAndGetMetadata(filePath);

      if (this.isFileUpToDate(cachedFile, lastModified, hash)) {
        this.updateCacheTimestamp(filePath, cachedFile, lastModified);
        return;
      }

      await this.removeOldSelectorsFromIndex(cachedFile);
      const parsedElements = this.parseAngularElementsWithTsMorph(filePath, content);

      if (parsedElements.length > 0) {
        await this.processAndIndexElements(filePath, parsedElements, lastModified, hash, isExternal);
      } else {
        await this.handleNoElementsFound(filePath);
      }

      await this.saveIndexToWorkspace(context);
    } catch (error) {
      logger.error(`Error updating index for ${filePath} in project ${this.projectRootPath}:`, error as Error);
    }
  }

  private validateFileForIndexing(filePath: string): boolean {
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found, cannot update index: ${filePath} for project ${this.projectRootPath}`);
      return false;
    }
    if (!this.projectRootPath) {
      logger.error(`AngularIndexer.updateFileIndex: projectRootPath not set for ${filePath}. Aborting update.`);
      return false;
    }
    if (!filePath.startsWith(this.projectRootPath)) {
      logger.warn(
        `AngularIndexer.updateFileIndex: File ${filePath} is outside of project root ${this.projectRootPath}. Skipping.`
      );
      return false;
    }
    return true;
  }

  private readFileAndGetMetadata(filePath: string): {
    content: string;
    hash: string;
    lastModified: number;
    cachedFile: FileElementsInfo | undefined;
  } {
    const stats = fs.statSync(filePath);
    const lastModified = stats.mtime.getTime();
    const cachedFile = this.fileCache.get(filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const hash = this.generateHash(content);

    return { content, hash, lastModified, cachedFile };
  }

  private isFileUpToDate(cachedFile: FileElementsInfo | undefined, lastModified: number, hash: string): boolean {
    return cachedFile !== undefined && cachedFile.lastModified >= lastModified && cachedFile.hash === hash;
  }

  private updateCacheTimestamp(filePath: string, cachedFile: FileElementsInfo | undefined, lastModified: number): void {
    if (cachedFile && cachedFile.lastModified < lastModified) {
      const updatedCache: FileElementsInfo = {
        ...cachedFile,
        lastModified: lastModified,
      };
      this.fileCache.set(filePath, updatedCache);
    }
  }

  private async removeOldSelectorsFromIndex(cachedFile: FileElementsInfo | undefined): Promise<void> {
    if (!cachedFile) {
      return;
    }

    for (const oldElement of cachedFile.elements) {
      const individualSelectors = await parseAngularSelector(oldElement.selector);
      for (const selector of individualSelectors) {
        this.selectorTrie.remove(selector, cachedFile.filePath, oldElement.name);
      }
    }
  }

  private async processAndIndexElements(
    filePath: string,
    parsedElements: ComponentInfo[],
    lastModified: number,
    hash: string,
    isExternal: boolean
  ): Promise<void> {
    const fileElementsInfo: FileElementsInfo = {
      filePath: filePath,
      lastModified: lastModified,
      hash: hash,
      elements: parsedElements,
    };
    this.fileCache.set(filePath, fileElementsInfo);

    for (const parsed of parsedElements) {
      await this.indexSingleElement(parsed, isExternal);
    }
  }

  private async indexSingleElement(parsed: ComponentInfo, isExternal: boolean): Promise<void> {
    const individualSelectors = await parseAngularSelector(parsed.selector);
    const { importPath, importName, moduleToImport } = this.resolveElementImportInfo(parsed);

    const elementData = new AngularElementData({
      path: importPath,
      name: importName,
      type: parsed.type,
      originalSelector: parsed.selector,
      selectors: individualSelectors,
      isStandalone: parsed.isStandalone,
      isExternal,
      exportingModuleName: moduleToImport,
    });

    for (const selector of individualSelectors) {
      this.selectorTrie.insert(selector, elementData);
      logger.info(`Updated index for ${this.projectRootPath}: ${selector} (${parsed.type}) -> ${parsed.path}`);
    }
  }

  private resolveElementImportInfo(parsed: ComponentInfo): {
    importPath: string;
    importName: string;
    moduleToImport: string | undefined;
  } {
    let importPath = parsed.path;
    let importName = parsed.name;
    let moduleToImport: string | undefined;

    if (!parsed.isStandalone) {
      const moduleInfo = this.projectModuleMap.get(parsed.name);
      if (moduleInfo) {
        importPath = moduleInfo.importPath;
        importName = moduleInfo.moduleName;
        moduleToImport = moduleInfo.moduleName;
      }
    }

    return { importPath, importName, moduleToImport };
  }

  /**
   * Safely removes a source file from the ts-morph project.
   * @param filePath The path to the file to remove.
   * @internal
   */
  private removeSourceFileFromProject(filePath: string): void {
    try {
      const sourceFile = this.project.getSourceFile(filePath);
      if (sourceFile) {
        sourceFile.getFilePath();
        this.project.removeSourceFile(sourceFile);
      }
    } catch {
      logger.warn(`SourceFile node already forgotten for ${filePath}, skipping removal`);
    }
  }

  private async handleNoElementsFound(filePath: string): Promise<void> {
    this.fileCache.delete(filePath);
    this.removeSourceFileFromProject(filePath);
    logger.info(`No Angular elements found in ${filePath} for ${this.projectRootPath}`);
  }

  /**
   * Removes a file from the index.
   * @param filePath The path to the file.
   * @param context The extension context.
   * @internal
   */
  private async removeFromIndex(filePath: string, context: vscode.ExtensionContext): Promise<void> {
    // Remove from file cache
    const fileInfo = this.fileCache.get(filePath);
    if (fileInfo) {
      for (const element of fileInfo.elements) {
        const individualSelectors = await parseAngularSelector(element.selector);
        for (const selector of individualSelectors) {
          this.selectorTrie.remove(selector, filePath, element.name);
          logger.info(`Removed from index for ${this.projectRootPath}: ${selector} from ${filePath}`);
        }
      }
      this.fileCache.delete(filePath);
    }

    // Remove from ts-morph project with error handling
    this.removeSourceFileFromProject(filePath);

    if (fileInfo) {
      await this.saveIndexToWorkspace(context);
    }
  }

  /**
   * Generates a full index of the project.
   * @param context The extension context.
   * @returns A map of selectors to `AngularElementData` objects.
   */
  async generateFullIndex(
    context: vscode.ExtensionContext,
    progress?: vscode.Progress<{ message?: string; increment?: number }>
  ): Promise<Map<string, AngularElementData>> {
    if (this.isIndexing) {
      logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): Already indexing, skipping...`);
      return new Map(this.selectorTrie.getAllElements().map((e) => [e.originalSelector, e]));
    }

    const timerName = `generateFullIndex:${path.basename(this.projectRootPath)}`;
    logger.startTimer(timerName);

    // Log initial memory usage
    const initialMemory = logger.getPerformanceMetrics();
    logger.info(`Starting full index - Memory: ${Math.round(initialMemory.memoryUsage.heapUsed / 1024 / 1024)}MB`);

    this.isIndexing = true;
    try {
      logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): Starting full index generation...`);
      if (!this.projectRootPath) {
        logger.error("AngularIndexer.generateFullIndex: projectRootPath not set. Aborting.");
        return new Map();
      }

      // Clear existing ts-morph project files before full scan to avoid stale data
      removeAllSourceFiles(this.project, "full index");
      this.clearInMemoryState();

      progress?.report({ message: "Discovering project files..." });
      const allFileUris = await vscode.workspace.findFiles(
        new vscode.RelativePattern(this.projectRootPath, "**/*.ts"),
        "**/{.git,dist,out,e2e,bazel-out,.*,*.spec.ts,*.test.ts}"
      );

      const projectTsFiles: vscode.Uri[] = [];
      const nodeModulesFiles: vscode.Uri[] = [];
      const nodeModulesPath = path.join(this.projectRootPath, "node_modules");

      for (const file of allFileUris) {
        if (file.fsPath.includes(nodeModulesPath)) {
          nodeModulesFiles.push(file);
        } else {
          projectTsFiles.push(file);
        }
      }

      logger.info(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Found ${
          projectTsFiles.length
        } project files and ${nodeModulesFiles.length} node_modules files.`
      );

      progress?.report({ message: "Indexing external libraries..." });
      const pkg = await findAngularDependencies(this.projectRootPath);
      await this._indexNodeModulesFromUris(nodeModulesFiles, pkg, context);

      progress?.report({ message: "Filtering project files..." });
      const candidateFiles = await this._filterRelevantFiles(projectTsFiles);

      const moduleFiles = candidateFiles.filter((uri) => uri.fsPath.endsWith(".module.ts"));
      const componentFiles = candidateFiles.filter((uri) => !uri.fsPath.endsWith(".module.ts"));

      logger.info(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Found ${
          candidateFiles.length
        } potential Angular files (${moduleFiles.length} modules, ${componentFiles.length} components/directives/pipes).`
      );

      progress?.report({ message: "Indexing project modules..." });
      await this.indexProjectModules(moduleFiles);

      progress?.report({ message: "Indexing project components..." });
      const batchSize = 20; // Process in batches
      for (let i = 0; i < componentFiles.length; i += batchSize) {
        const batch = componentFiles.slice(i, i + batchSize);
        // Sequentially process files in a batch to avoid overwhelming ts-morph or fs
        for (const file of batch) {
          await this.updateFileIndex(file.fsPath, context);
        }
        logger.info(
          `AngularIndexer (${path.basename(this.projectRootPath)}): Indexed component batch ${
            Math.floor(i / batchSize) + 1
          }/${Math.ceil(componentFiles.length / batchSize)}`
        );
      }

      const totalElements = this.selectorTrie.getAllElements().length;
      logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): Indexed ${totalElements} elements.`);

      await this.indexNodeModules(context, progress);

      await this.saveIndexToWorkspace(context);

      // Log final memory usage and performance metrics
      const finalMemory = logger.getPerformanceMetrics();
      const memoryDelta = finalMemory.memoryUsage.heapUsed - initialMemory.memoryUsage.heapUsed;
      logger.info(
        `Full index completed - Memory: ${Math.round(finalMemory.memoryUsage.heapUsed / 1024 / 1024)}MB (Δ${memoryDelta > 0 ? "+" : ""}${Math.round(memoryDelta / 1024 / 1024)}MB)`
      );

      return new Map(this.selectorTrie.getAllElements().map((e) => [e.originalSelector, e]));
    } finally {
      this.isIndexing = false;
      logger.stopTimer(timerName);
    }
  }

  private async _indexNodeModulesFromUris(
    uris: vscode.Uri[],
    dependencies: AngularDependency[],
    context: vscode.ExtensionContext
  ): Promise<void> {
    const timerName = `indexNodeModulesFromUris:${path.basename(this.projectRootPath)}`;
    logger.startTimer(timerName);
    logger.info(`[NodeModules] Starting scan of ${uris.length} files from node_modules...`);

    try {
      const dependencySet = new Set(dependencies.map((d) => d.name));

      const filesByPackage = new Map<string, vscode.Uri[]>();
      for (const uri of uris) {
        const pkgNameResult = this._getNpmPackageName(uri.fsPath);
        if (pkgNameResult) {
          const [pkgName] = pkgNameResult;
          if (dependencySet.has(pkgName)) {
            if (!filesByPackage.has(pkgName)) {
              filesByPackage.set(pkgName, []);
            }
            filesByPackage.get(pkgName)?.push(uri);
          }
        }
      }

      for (const [, files] of filesByPackage) {
        for (const file of files) {
          await this.updateFileIndex(file.fsPath, context, true);
        }
      }
    } catch (error) {
      logger.error("[NodeModules] Error scanning node_modules:", error as Error);
    }

    logger.stopTimer(timerName);
  }

  /**
   * Quickly filters a list of files to find ones that likely contain Angular declarations.
   * @param uris An array of file URIs to filter.
   * @returns A promise that resolves to a filtered array of file URIs.
   * @internal
   */
  private async _filterRelevantFiles(uris: vscode.Uri[]): Promise<vscode.Uri[]> {
    const angularDecoratorRegex = /@(Component|Directive|Pipe|NgModule)\s*\(/;
    const promises = uris.map(async (uri) => {
      try {
        const content = await vscode.workspace.fs.readFile(uri);
        if (angularDecoratorRegex.test(content.toString())) {
          return uri;
        }
      } catch (error) {
        logger.error(`Could not read file ${uri.fsPath} during filtering:`, error as Error);
      }
      return null;
    });

    const results = await Promise.all(promises);
    return results.filter((uri): uri is vscode.Uri => uri !== null);
  }

  /**
   * Finds the package name from a file path.
   * @param filePath The full path to the file.
   * @returns A tuple of [packageName, isDevDependency] or undefined if not a node_modules file.
   * @internal
   */
  private _getNpmPackageName(filePath: string): [string, boolean] | undefined {
    const nodeModulesPath = path.join(this.projectRootPath, "node_modules");
    if (!filePath.startsWith(nodeModulesPath)) {
      return undefined;
    }

    const relativePath = path.relative(nodeModulesPath, filePath);
    const parts = relativePath.split(path.sep);

    // Find the package name, which is the last part of the path
    const packageName = parts[parts.length - 1];

    // Determine if it's a dev dependency
    const isDev = packageName.startsWith("@"); // Common pattern for scoped packages
    if (isDev) {
      return [packageName.slice(1), true];
    }
    return [packageName, false];
  }

  /**
   * Loads the index from the workspace state.
   * @param context The extension context.
   * @returns `true` if the index was loaded successfully, `false` otherwise.
   */
  async loadFromWorkspace(context: vscode.ExtensionContext): Promise<boolean> {
    if (!this.projectRootPath || !this.workspaceFileCacheKey || !this.workspaceIndexCacheKey) {
      logger.error("AngularIndexer.loadFromWorkspace: projectRootPath or cache keys not set. Cannot load.");
      return false;
    }

    try {
      const workspaceData = this.retrieveWorkspaceData(context);
      if (!workspaceData.storedCache || !workspaceData.storedIndex) {
        logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): No valid cache found in workspace.`);
        return false;
      }

      await this.loadCacheData(workspaceData);
      this.loadModuleData(workspaceData);
      this.loadExternalModuleExports(workspaceData);

      logger.info(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Loaded ${
          this.selectorTrie.size
        } elements from workspace cache.`
      );
      return true;
    } catch (error) {
      logger.error(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Error loading index from workspace:`,
        error as Error
      );
      logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): No valid cache found in workspace.`);
      return false;
    }
  }

  private retrieveWorkspaceData(context: vscode.ExtensionContext) {
    return {
      storedCache: context.workspaceState.get<Record<string, FileElementsInfo | ComponentInfo>>(
        this.workspaceFileCacheKey
      ),
      storedIndex: context.workspaceState.get<Record<string, AngularElementData>>(this.workspaceIndexCacheKey),
      storedModules: context.workspaceState.get<
        Record<string, { moduleName: string; importPath: string; exportCount?: number }>
      >(this.workspaceModulesCacheKey),
      storedExternalModulesExports: context.workspaceState.get<Record<string, string[]>>(
        this.workspaceExternalModulesExportsCacheKey
      ),
    };
  }

  private async loadCacheData(workspaceData: {
    storedCache: Record<string, FileElementsInfo | ComponentInfo> | undefined;
    storedIndex: Record<string, AngularElementData> | undefined;
    storedModules?: Record<string, { moduleName: string; importPath: string; exportCount?: number }>;
    storedExternalModulesExports?: Record<string, string[]>;
  }): Promise<void> {
    if (!workspaceData.storedCache || !workspaceData.storedIndex) {
      return;
    }

    // Convert old ComponentInfo format to new FileElementsInfo format if needed
    this.fileCache = this.convertCacheFormat(workspaceData.storedCache);

    // Load index data
    this.selectorTrie.clear();
    this.externalModuleExportsIndex.clear();

    for (const [key, value] of Object.entries(workspaceData.storedIndex)) {
      await this.loadIndexElement(key, value);
    }
  }

  private convertCacheFormat(
    storedCache: Record<string, FileElementsInfo | ComponentInfo>
  ): Map<string, FileElementsInfo> {
    const convertedCache = new Map<string, FileElementsInfo>();

    for (const [filePath, cacheEntry] of Object.entries(storedCache)) {
      if ("elements" in cacheEntry) {
        // New format - already FileElementsInfo
        convertedCache.set(filePath, cacheEntry as FileElementsInfo);
      } else {
        // Old format - convert ComponentInfo to FileElementsInfo
        const componentInfo = cacheEntry as ComponentInfo;
        const fileElementsInfo: FileElementsInfo = {
          filePath: filePath,
          lastModified: componentInfo.lastModified,
          hash: componentInfo.hash,
          elements: [componentInfo],
        };
        convertedCache.set(filePath, fileElementsInfo);
      }
    }

    return convertedCache;
  }

  private async loadIndexElement(key: string, value: AngularElementData): Promise<void> {
    const elementData = new AngularElementData({
      path: value.path,
      name: value.name,
      type: value.type,
      originalSelector: value.originalSelector || key,
      selectors: await parseAngularSelector(value.originalSelector || key),
      isStandalone: value.isStandalone,
      isExternal: value.isExternal ?? value.path.includes("node_modules"), // Use cached isExternal, fallback for old cache
      exportingModuleName: value.exportingModuleName,
    });

    // Index under all its selectors
    for (const selector of elementData.selectors) {
      this.selectorTrie.insert(selector, elementData);
    }
  }

  private loadModuleData(workspaceData: {
    storedModules?: Record<string, { moduleName: string; importPath: string; exportCount?: number }>;
  }): void {
    if (workspaceData.storedModules) {
      const moduleMapEntries: [string, { moduleName: string; importPath: string; exportCount: number }][] =
        Object.entries(workspaceData.storedModules).map(([key, value]) => {
          // Handle old cache format gracefully by providing a default exportCount.
          const entry = {
            moduleName: value.moduleName,
            importPath: value.importPath,
            exportCount: value.exportCount ?? 10, // Default to a neutral number for old caches
          };
          return [key, entry];
        });
      this.projectModuleMap = new Map(moduleMapEntries);
    }
  }

  private loadExternalModuleExports(workspaceData: { storedExternalModulesExports?: Record<string, string[]> }): void {
    if (!workspaceData.storedExternalModulesExports) {
      return;
    }

    // Convert stored string arrays back to Sets
    this.externalModuleExportsIndex.clear();
    for (const [moduleName, exports] of Object.entries(workspaceData.storedExternalModulesExports)) {
      this.externalModuleExportsIndex.set(moduleName, new Set(exports));
    }
  }

  /**
   * Saves the index to the workspace state.
   * @param context The extension context.
   * @internal
   */
  private async saveIndexToWorkspace(context: vscode.ExtensionContext): Promise<void> {
    if (!this.projectRootPath || !this.workspaceFileCacheKey || !this.workspaceIndexCacheKey) {
      logger.error("AngularIndexer.saveIndexToWorkspace: projectRootPath or cache keys not set. Cannot save.");
      return;
    }
    try {
      await context.workspaceState.update(this.workspaceFileCacheKey, Object.fromEntries(this.fileCache));

      const serializableTrie = Object.fromEntries(
        this.selectorTrie.getAllElements().map((el) => [el.originalSelector, el])
      );

      await context.workspaceState.update(this.workspaceIndexCacheKey, serializableTrie);
      await context.workspaceState.update(this.workspaceModulesCacheKey, Object.fromEntries(this.projectModuleMap));

      // Serialize external modules exports (convert Sets to arrays)
      const serializableExternalModules = Object.fromEntries(
        Array.from(this.externalModuleExportsIndex.entries()).map(([moduleName, exportsSet]) => [
          moduleName,
          Array.from(exportsSet),
        ])
      );
      await context.workspaceState.update(this.workspaceExternalModulesExportsCacheKey, serializableExternalModules);
    } catch (error) {
      logger.error(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Error saving index to workspace:`,
        error as Error
      );
    }
  }

  /**
   * Clears the index from memory and the workspace state.
   * @param context The extension context.
   */
  public async clearCache(context: vscode.ExtensionContext): Promise<void> {
    if (
      !this.projectRootPath ||
      !this.workspaceFileCacheKey ||
      !this.workspaceIndexCacheKey ||
      !this.workspaceModulesCacheKey ||
      !this.workspaceExternalModulesExportsCacheKey
    ) {
      logger.error("AngularIndexer.clearCache: projectRootPath or cache keys not set. Cannot clear cache.");
      return;
    }
    try {
      // Clear in-memory state
      this.clearInMemoryState();
      removeAllSourceFiles(this.project, "clearCache");

      // Clear persisted state
      await context.workspaceState.update(this.workspaceFileCacheKey, undefined);
      await context.workspaceState.update(this.workspaceIndexCacheKey, undefined);
      await context.workspaceState.update(this.workspaceModulesCacheKey, undefined);
      await context.workspaceState.update(this.workspaceExternalModulesExportsCacheKey, undefined);

      logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): All caches cleared.`);
    } catch (error) {
      logger.error(`AngularIndexer (${path.basename(this.projectRootPath)}): Error clearing cache:`, error as Error);
    }
  }

  /**
   * Gets all elements for a given selector.
   * @param selector The selector to search for.
   * @returns An array of `AngularElementData` objects.
   */
  getElements(selector: string): AngularElementData[] {
    if (typeof selector !== "string" || !selector) {
      return [];
    }
    return this.selectorTrie.findAll(selector);
  }

  /**
   * Gets all exported entities from an external module.
   * @param moduleName The name of the external module (e.g., "MatTableModule").
   * @returns A Set of exported entity names or undefined if module not found.
   */
  getExternalModuleExports(moduleName: string): Set<string> | undefined {
    if (typeof moduleName !== "string" || !moduleName) {
      return undefined;
    }
    return this.externalModuleExportsIndex.get(moduleName);
  }

  /**
   * Indexes all Angular libraries in `node_modules`.
   * @param context The extension context.
   * @param progress Optional progress reporter to use instead of creating a new one.
   */
  public async indexNodeModules(
    context: vscode.ExtensionContext,
    progress?: vscode.Progress<{ message?: string; increment?: number }>
  ): Promise<void> {
    const timerName = `indexNodeModules:${path.basename(this.projectRootPath)}`;
    logger.startTimer(timerName);

    // Log initial memory before node_modules indexing
    const initialMemory = logger.getPerformanceMetrics();
    logger.info(
      `Starting node_modules index - Memory: ${Math.round(initialMemory.memoryUsage.heapUsed / 1024 / 1024)}MB`
    );

    const indexingLogic = async (progressReporter: vscode.Progress<{ message?: string; increment?: number }>) => {
      try {
        if (!this.projectRootPath) {
          logger.error("AngularIndexer.indexNodeModules: projectRootPath not set.");
          return;
        }
        progressReporter.report({ message: "Finding Angular libraries..." });
        const angularDeps = await findAngularDependencies(this.projectRootPath);
        logger.debug(`[indexNodeModules] Found ${angularDeps.length} Angular dependencies.`);

        const totalDeps = angularDeps.length;
        let processedCount = 0;

        for (const dep of angularDeps) {
          processedCount++;
          progressReporter.report({
            message: `Processing ${dep.name}... (${processedCount}/${totalDeps})`,
            increment: (1 / totalDeps) * 100,
          });

          const entryPoints = await getLibraryEntryPoints(dep);
          if (entryPoints.size === 0) {
            continue;
          }

          logger.info(`📚 Indexing library: ${dep.name} (${entryPoints.size} entry points)`);
          await this._indexLibrary(entryPoints);
        }
        await this.saveIndexToWorkspace(context);

        // Log final memory usage after node_modules indexing
        const finalMemory = logger.getPerformanceMetrics();
        const memoryDelta = finalMemory.memoryUsage.heapUsed - initialMemory.memoryUsage.heapUsed;
        logger.info(
          `Node modules index completed - Memory: ${Math.round(
            finalMemory.memoryUsage.heapUsed / 1024 / 1024
          )}MB (Δ${memoryDelta > 0 ? "+" : ""}${Math.round(memoryDelta / 1024 / 1024)}MB)`
        );

        logger.debug(`[indexNodeModules] Finished indexing ${processedCount} libraries.`);
      } catch (error) {
        logger.error("[indexNodeModules] Error during node_modules indexing:", error as Error);
      } finally {
        logger.stopTimer(timerName);
      }
    };

    if (progress) {
      await indexingLogic(progress);
    } else {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Angular Auto-Import: Indexing libraries from node_modules...`,
          cancellable: false,
        },
        indexingLogic
      );
    }
  }

  /**
   * Indexes a library from its entry points.
   * @param entryPoints A map of import paths to file paths.
   * @internal
   */
  private async _indexLibrary(entryPoints: Map<string, string>): Promise<void> {
    const libraryFiles = this.loadLibrarySourceFiles(entryPoints);

    if (libraryFiles.length === 0) {
      return;
    }

    const typeChecker = this.project.getTypeChecker();
    const allLibraryClasses = this.collectAllLibraryClasses(libraryFiles);
    const componentToModuleMap = this.buildLibraryComponentToModuleMap(libraryFiles, allLibraryClasses, typeChecker);

    await this.indexLibraryDeclarations(libraryFiles, componentToModuleMap);
  }

  private loadLibrarySourceFiles(
    entryPoints: Map<string, string>
  ): Array<{ importPath: string; sourceFile: SourceFile }> {
    const libraryFiles: { importPath: string; sourceFile: SourceFile }[] = [];

    for (const [importPath, filePath] of entryPoints.entries()) {
      try {
        const sourceFile = this.project.addSourceFileAtPathIfExists(filePath);
        if (sourceFile) {
          try {
            sourceFile.getFilePath();
            libraryFiles.push({ importPath, sourceFile });
          } catch {
            logger.warn(`[Indexer] SourceFile node forgotten for library file ${filePath}, skipping`);
          }
        }
      } catch (error) {
        logger.warn(`[Indexer] Could not process library file ${filePath}: ${(error as Error).message}`);
      }
    }

    return libraryFiles;
  }

  private collectAllLibraryClasses(
    libraryFiles: Array<{ importPath: string; sourceFile: SourceFile }>
  ): Map<string, ClassDeclaration> {
    const allLibraryClasses = new Map<string, ClassDeclaration>();

    for (const { sourceFile } of libraryFiles) {
      try {
        sourceFile.getFilePath();
        this.collectClassesFromSourceFile(sourceFile, allLibraryClasses);
      } catch {
        logger.warn(`[Indexer] SourceFile node forgotten during class collection, skipping file`);
      }
    }

    return allLibraryClasses;
  }

  private collectClassesFromSourceFile(sourceFile: SourceFile, allLibraryClasses: Map<string, ClassDeclaration>): void {
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    for (const declarations of exportedDeclarations.values()) {
      for (const declaration of declarations) {
        if (declaration.isKind(SyntaxKind.ClassDeclaration)) {
          const classDecl = declaration as ClassDeclaration;
          const name = classDecl.getName();
          if (name && !allLibraryClasses.has(name)) {
            allLibraryClasses.set(name, classDecl);
          }
        }
      }
    }

    for (const classDecl of sourceFile.getClasses()) {
      const name = classDecl.getName();
      if (name && !allLibraryClasses.has(name)) {
        allLibraryClasses.set(name, classDecl);
      }
    }
  }

  private buildLibraryComponentToModuleMap(
    libraryFiles: Array<{ importPath: string; sourceFile: SourceFile }>,
    allLibraryClasses: Map<string, ClassDeclaration>,
    typeChecker: import("ts-morph").TypeChecker
  ): Map<string, { moduleName: string; importPath: string; exportCount: number }> {
    const componentToModuleMap = new Map<string, { moduleName: string; importPath: string; exportCount: number }>();

    for (const { importPath, sourceFile } of libraryFiles) {
      try {
        sourceFile.getFilePath();
        this._buildComponentToModuleMap(sourceFile, importPath, componentToModuleMap, allLibraryClasses, typeChecker);
      } catch {
        logger.warn(`[Indexer] SourceFile node forgotten during module mapping for ${importPath}, skipping`);
      }
    }

    return componentToModuleMap;
  }

  private async indexLibraryDeclarations(
    libraryFiles: Array<{ importPath: string; sourceFile: SourceFile }>,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }>
  ): Promise<void> {
    for (const { importPath, sourceFile } of libraryFiles) {
      try {
        sourceFile.getFilePath();
        await this._indexDeclarationsInFile(sourceFile, importPath, componentToModuleMap);
      } catch {
        logger.warn(`[Indexer] SourceFile node forgotten during declarations indexing for ${importPath}, skipping`);
      }
    }
  }

  /**
   * Indexes all NgModules in the project.
   * @param moduleFileUris An array of module file URIs to index.
   * @internal
   */
  private async indexProjectModules(moduleFileUris: vscode.Uri[]): Promise<void> {
    if (!this.projectRootPath) {
      return;
    }
    logger.debug(`[Indexer] Indexing ${moduleFileUris.length} project NgModules for ${this.projectRootPath}...`);
    this.projectModuleMap.clear();

    for (const file of moduleFileUris) {
      try {
        const sourceFile = this.project.addSourceFileAtPath(file.fsPath);
        // Check if the sourceFile is still valid before processing
        sourceFile.getFilePath(); // This will throw if the node is forgotten
        this._processProjectModuleFile(sourceFile);
      } catch (error) {
        logger.warn(`[Indexer] Could not process project module file ${file.fsPath}: ${(error as Error).message}`);
      }
    }

    // Process already opened files that might be modules
    for (const sourceFile of this.project.getSourceFiles()) {
      try {
        // Check if the sourceFile is still valid
        const filePath = sourceFile.getFilePath(); // This will throw if the node is forgotten
        if (filePath.endsWith(".module.ts") && !moduleFileUris.some((f) => f.fsPath === filePath)) {
          this._processProjectModuleFile(sourceFile);
        }
      } catch {
        logger.warn(`[Indexer] SourceFile node forgotten during project module processing, skipping`);
      }
    }
    logger.debug(`[Indexer] Found ${this.projectModuleMap.size} component-to-module mappings in project.`);
  }

  /**
   * Processes a single project module file.
   * @param sourceFile The source file to process.
   * @internal
   */
  private _processProjectModuleFile(sourceFile: SourceFile) {
    if (!this.isSourceFileValid(sourceFile)) {
      return;
    }

    const classDeclarations = sourceFile.getClasses();
    for (const classDecl of classDeclarations) {
      this.processNgModuleClass(classDecl, sourceFile);
    }
  }

  /**
   * Checks if a source file is valid.
   */
  private isSourceFileValid(sourceFile: SourceFile): boolean {
    try {
      sourceFile.getFilePath();
      return true;
    } catch {
      logger.warn(`[Indexer] SourceFile node forgotten in _processProjectModuleFile, skipping`);
      return false;
    }
  }

  /**
   * Processes a single NgModule class.
   */
  private processNgModuleClass(classDecl: ClassDeclaration, sourceFile: SourceFile): void {
    const ngModuleDecorator = classDecl.getDecorator("NgModule");
    if (!ngModuleDecorator) {
      return;
    }

    const moduleName = classDecl.getName();
    if (!moduleName) {
      return;
    }

    const objectLiteral = this.getNgModuleObjectLiteral(ngModuleDecorator);
    if (!objectLiteral) {
      return;
    }

    const exportsProp = objectLiteral.getProperty("exports");
    if (!exportsProp) {
      return;
    }

    this.processModuleExports(exportsProp as PropertyAssignment, moduleName, sourceFile);
  }

  /**
   * Gets the NgModule decorator's object literal.
   */
  private getNgModuleObjectLiteral(ngModuleDecorator: Decorator): ObjectLiteralExpression | null {
    const decoratorArg = ngModuleDecorator.getArguments()[0];
    if (!decoratorArg || !decoratorArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
      return null;
    }
    return decoratorArg as ObjectLiteralExpression;
  }

  /**
   * Processes module exports.
   */
  private processModuleExports(exportsProp: PropertyAssignment, moduleName: string, sourceFile: SourceFile): void {
    const exportedIdentifiers = this._getIdentifierNamesFromArrayProp(exportsProp);

    if (exportedIdentifiers.length === 0) {
      return;
    }

    this.storeModuleExports(moduleName, exportedIdentifiers);
    this.updateProjectModuleMap(exportedIdentifiers, moduleName, sourceFile);
  }

  /**
   * Stores module exports in the index.
   */
  private storeModuleExports(moduleName: string, exportedIdentifiers: string[]): void {
    this.externalModuleExportsIndex.set(moduleName, new Set(exportedIdentifiers));
    logger.debug(
      `[ProjectModules] Indexed module ${moduleName} with ${exportedIdentifiers.length} exports: ${exportedIdentifiers.join(", ")}`
    );
  }

  /**
   * Updates the project module map with exported identifiers.
   */
  private updateProjectModuleMap(exportedIdentifiers: string[], moduleName: string, sourceFile: SourceFile): void {
    const newImportPath = path.relative(this.projectRootPath, sourceFile.getFilePath()).replace(/\\/g, "/");
    const exportCount = exportedIdentifiers.length;

    for (const componentName of exportedIdentifiers) {
      const existing = this.projectModuleMap.get(componentName);
      const newCandidate = { moduleName, importPath: newImportPath, exportCount };

      if (existing) {
        const newScore = this._calculateModuleFitScore(
          componentName,
          newCandidate.moduleName,
          newCandidate.exportCount,
          newCandidate.importPath
        );
        const existingScore = this._calculateModuleFitScore(
          componentName,
          existing.moduleName,
          existing.exportCount,
          existing.importPath
        );

        if (newScore > existingScore) {
          this.projectModuleMap.set(componentName, newCandidate);
        }
      } else {
        this.projectModuleMap.set(componentName, newCandidate);
      }
    }
  }

  /**
   * Gets the names of identifiers in an array property.
   * @param prop The property assignment to get the identifiers from.
   * @returns An array of identifier names.
   * @internal
   */
  private _getIdentifierNamesFromArrayProp(prop: PropertyAssignment | undefined): string[] {
    if (!prop) {
      return [];
    }
    const initializer = prop.getInitializer();

    // Handle direct array literals
    if (initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
      const arr = initializer as ArrayLiteralExpression;
      return arr.getElements().map((el) => el.getText());
    }

    // Handle variable references (like EXPORTED_DECLARATIONS)
    if (initializer?.isKind(SyntaxKind.Identifier)) {
      const varName = initializer.getText();
      const sourceFile = prop.getSourceFile();

      // Find the variable declaration
      const variableDeclaration = sourceFile.getVariableDeclaration(varName);
      if (variableDeclaration) {
        const varInitializer = variableDeclaration.getInitializer();
        if (varInitializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
          const arr = varInitializer as ArrayLiteralExpression;
          return arr.getElements().map((el) => el.getText());
        }
      }
    }

    return [];
  }

  /**
   * Builds a map of components to the modules that export them.
   * @param sourceFile The source file to process.
   * @param importPath The import path of the source file.
   * @param componentToModuleMap The map to store the component-to-module mappings.
   * @param allLibraryClasses A map of all classes in the library.
   * @param typeChecker The type checker to use.
   * @internal
   */
  private _buildComponentToModuleMap(
    sourceFile: SourceFile,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }>,
    allLibraryClasses: Map<string, ClassDeclaration>,
    typeChecker: TypeChecker
  ) {
    try {
      const classDeclarations = this._collectClassDeclarations(sourceFile);
      this._processNgModuleClasses(classDeclarations, importPath, componentToModuleMap, allLibraryClasses, typeChecker);
    } catch (error) {
      try {
        logger.error(`Error building module map for file ${sourceFile.getFilePath()}: ${(error as Error).message}`);
      } catch {
        logger.error(`Error building module map for forgotten SourceFile node: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Processes all NgModule classes and maps their exports.
   * @param classDeclarations Map of class declarations to process.
   * @param importPath The import path of the source file.
   * @param componentToModuleMap The map to store the component-to-module mappings.
   * @param allLibraryClasses A map of all classes in the library.
   * @param typeChecker The type checker to use.
   * @internal
   */
  private _processNgModuleClasses(
    classDeclarations: Map<string, ClassDeclaration>,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }>,
    allLibraryClasses: Map<string, ClassDeclaration>,
    typeChecker: TypeChecker
  ) {
    // Find all NgModules among the correctly found classes and map their exports
    for (const classDecl of classDeclarations.values()) {
      const className = classDecl.getName();
      // Skip unnamed or internal Angular modules
      if (!className || className.startsWith("ɵ")) {
        continue;
      }

      this._processNgModuleClass(
        classDecl,
        className,
        importPath,
        componentToModuleMap,
        allLibraryClasses,
        typeChecker
      );
    }
  }

  /**
   * Processes a single NgModule class and maps its exports.
   * @param classDecl The class declaration to process.
   * @param className The name of the class.
   * @param importPath The import path of the source file.
   * @param componentToModuleMap The map to store the component-to-module mappings.
   * @param allLibraryClasses A map of all classes in the library.
   * @param typeChecker The type checker to use.
   * @internal
   */
  private _processNgModuleClass(
    classDecl: ClassDeclaration,
    className: string,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }>,
    allLibraryClasses: Map<string, ClassDeclaration>,
    typeChecker: TypeChecker
  ) {
    const exportsTuple = parseModDefinition(classDecl);
    if (!exportsTuple) {
      return;
    }
    const moduleExports = new Set<string>();

    this._processModuleExports(
      exportsTuple,
      className,
      importPath,
      componentToModuleMap,
      allLibraryClasses,
      typeChecker,
      moduleExports
    );

    // Store the accumulated exports in the external modules index
    if (moduleExports.size > 0) {
      this.externalModuleExportsIndex.set(className, moduleExports);
      logger.debug(
        `[ExternalModules] Indexed module ${className} with ${moduleExports.size} exports: ${Array.from(moduleExports).join(", ")}`
      );
    }
  }

  /**
   * Processes the exports of a module.
   * @param exportsTuple The tuple of exported elements.
   * @param moduleName The name of the module.
   * @param importPath The import path of the module.
   * @param componentToModuleMap The map to store the component-to-module mappings.
   * @param allLibraryClasses A map of all classes in the library.
   * @param typeChecker The type checker to use.
   * @param moduleExports Optional Set to accumulate all exports for the module.
   * @internal
   */
  private _processModuleExports(
    exportsTuple: import("ts-morph").TupleTypeNode,
    moduleName: string,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }>,
    allLibraryClasses: Map<string, ClassDeclaration>,
    typeChecker: TypeChecker,
    moduleExports?: Set<string>
  ) {
    for (const element of exportsTuple.getElements()) {
      const exportedClassName = this._resolveExportedClassName(element, typeChecker);
      if (!exportedClassName) {
        continue;
      }

      const exportedClassDecl = allLibraryClasses.get(exportedClassName);
      if (!exportedClassDecl) {
        continue;
      }

      if (this._isReexportedModule(exportedClassDecl)) {
        this._processReexportedModule(
          exportedClassDecl,
          moduleName,
          importPath,
          componentToModuleMap,
          allLibraryClasses,
          typeChecker,
          moduleExports
        );
      } else {
        this._mapComponentToModule(exportedClassName, moduleName, importPath, componentToModuleMap, moduleExports);
      }
    }
  }

  /**
   * Resolves the exported class name from a tuple element using TypeChecker.
   * @param element The tuple element to resolve.
   * @param typeChecker The type checker to use.
   * @returns The exported class name or undefined.
   * @internal
   */
  private _resolveExportedClassName(
    element: import("ts-morph").TypeNode,
    typeChecker: TypeChecker
  ): string | undefined {
    const exprName = element.isKind(SyntaxKind.TypeQuery)
      ? element.asKindOrThrow(SyntaxKind.TypeQuery).getExprName()
      : element.asKindOrThrow(SyntaxKind.TypeReference).getTypeName();

    const type = typeChecker.getTypeAtLocation(exprName);
    const symbol = type.getSymbol() ?? type.getAliasSymbol();
    if (!symbol) {
      return undefined;
    }

    const aliased = symbol.getAliasedSymbol();
    const finalSymbol = aliased || symbol;
    return finalSymbol.getName();
  }

  /**
   * Checks if the exported class declaration is a re-exported NgModule.
   * @param exportedClassDecl The class declaration to check.
   * @returns True if it's a re-exported module.
   * @internal
   */
  private _isReexportedModule(exportedClassDecl: ClassDeclaration): boolean {
    return !!exportedClassDecl.getStaticProperty("ɵmod");
  }

  /**
   * Processes a re-exported module by recursively processing its exports.
   * @param exportedClassDecl The re-exported module class declaration.
   * @param moduleName The current module name.
   * @param importPath The import path.
   * @param componentToModuleMap The component-to-module mapping.
   * @param allLibraryClasses Map of all class declarations.
   * @param typeChecker The type checker.
   * @param moduleExports Optional set to accumulate exports.
   * @internal
   */
  private _processReexportedModule(
    exportedClassDecl: ClassDeclaration,
    moduleName: string,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }>,
    allLibraryClasses: Map<string, ClassDeclaration>,
    typeChecker: TypeChecker,
    moduleExports?: Set<string>
  ) {
    const innerExportsTuple = parseModDefinition(exportedClassDecl);
    if (innerExportsTuple) {
      this._processModuleExports(
        innerExportsTuple,
        moduleName,
        importPath,
        componentToModuleMap,
        allLibraryClasses,
        typeChecker,
        moduleExports
      );
    }
  }

  /**
   * Maps a component/directive/pipe to its module.
   * @param exportedClassName The name of the exported class.
   * @param moduleName The module name.
   * @param importPath The import path.
   * @param componentToModuleMap The mapping to update.
   * @param moduleExports Optional set to add exports to.
   * @internal
   */
  private _mapComponentToModule(
    exportedClassName: string,
    moduleName: string,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }>,
    moduleExports?: Set<string>
  ) {
    // This function is only called during library indexing where we build the module exports on the fly.
    // If moduleExports is not present, we can't perform scoring, so we can't add the mapping.
    if (!moduleExports) {
      return;
    }

    const exportCount = moduleExports.size;
    const existing = componentToModuleMap.get(exportedClassName);

    const newCandidate = { moduleName, importPath, exportCount };

    if (existing) {
      const newScore = this._calculateModuleFitScore(
        exportedClassName,
        newCandidate.moduleName,
        newCandidate.exportCount,
        newCandidate.importPath
      );
      const existingScore = this._calculateModuleFitScore(
        exportedClassName,
        existing.moduleName,
        existing.exportCount,
        existing.importPath
      );

      // If new one is better, update the map.
      if (newScore > existingScore) {
        componentToModuleMap.set(exportedClassName, newCandidate);
      }
    } else {
      // If it doesn't exist, add it.
      componentToModuleMap.set(exportedClassName, newCandidate);
    }

    // This is for accumulating all unique exports for the top-level module being processed.
    moduleExports.add(exportedClassName);
  }

  /**
   * Calculates a "fit score" for a module-component pair.
   * Higher score is better.
   * @internal
   */
  private _calculateModuleFitScore(
    componentName: string,
    moduleName: string,
    exportCount: number,
    importPath: string
  ): number {
    let score = 0;

    // 1. Major bonus for direct name match (e.g., InputNumber in InputNumberModule)
    if (moduleName.startsWith(componentName)) {
      score += 100;
    }

    // 2. Penalty for generic module names that don't relate to the component
    if (moduleName.toLowerCase().includes("module")) {
      const baseModuleName = moduleName.replace(/module$/i, "");
      if (baseModuleName.length > 0 && !componentName.toLowerCase().includes(baseModuleName.toLowerCase())) {
        score -= 10;
      }
    }

    // 3. Bonus for specificity (fewer exports is better)
    score += 50 / (exportCount + 1);

    // 4. Small penalty for longer import paths as a tie-breaker
    score -= importPath.length * 0.1;

    return score;
  }

  /**
   * Determines if an element is standalone from its compiled type reference.
   * @param typeRef The type reference node from a static property (e.g., `ɵcmp`).
   * @param elementType The type of the Angular element.
   * @returns `true` if the element is standalone, `false` otherwise.
   * @internal
   */
  private _isStandaloneFromTypeReference(
    typeRef: TypeReferenceNode,
    elementType: "component" | "directive" | "pipe"
  ): boolean {
    const typeArgs = typeRef.getTypeArguments();
    let standaloneIndex: number;

    switch (elementType) {
      case "component":
      case "directive":
        standaloneIndex = 7;
        break;
      case "pipe":
        standaloneIndex = 2;
        break;
      default:
        return false;
    }

    if (typeArgs.length > standaloneIndex) {
      return typeArgs[standaloneIndex].getText() === "true";
    }

    return false;
  }

  /**
   * Collects all class declarations from a source file.
   * @param sourceFile The source file to collect classes from.
   * @returns A map of class names to their declarations.
   * @internal
   */
  private _collectClassDeclarations(sourceFile: SourceFile): Map<string, ClassDeclaration> {
    const classDeclarations = new Map<string, ClassDeclaration>();

    // This logic is duplicated from _buildComponentToModuleMap to ensure we have all class definitions.
    // A more optimized approach could pass this data from the first pass, but this is safer.
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    for (const declarations of exportedDeclarations.values()) {
      for (const declaration of declarations) {
        if (declaration.isKind(SyntaxKind.ClassDeclaration)) {
          const classDecl = declaration as ClassDeclaration;
          const name = classDecl.getName();
          if (name && !classDeclarations.has(name)) {
            classDeclarations.set(name, classDecl);
          }
        }
      }
    }
    for (const classDecl of sourceFile.getClasses()) {
      const name = classDecl.getName();
      if (name && !classDeclarations.has(name)) {
        classDeclarations.set(name, classDecl);
      }
    }

    return classDeclarations;
  }

  /**
   * Recursively searches for a static property (e.g., ɵcmp) in the inheritance chain.
   * @param cls The class to search in.
   * @param propName The property name to search for.
   * @returns An object containing the owner class and the property declaration.
   * @internal
   */
  private _findInheritedStaticProperty(
    cls: ClassDeclaration,
    propName: "ɵcmp" | "ɵdir" | "ɵpipe"
  ): { owner: ClassDeclaration; prop: import("ts-morph").PropertyDeclaration | undefined } {
    let current: ClassDeclaration | undefined = cls;
    while (current) {
      const prop = current.getStaticProperty(propName);
      if (prop?.isKind(SyntaxKind.PropertyDeclaration)) {
        return { owner: current, prop };
      }
      current = current.getBaseClass();
    }
    return { owner: cls, prop: undefined };
  }

  /**
   * Extracts selector from a type reference node.
   * @param typeRef The type reference node.
   * @returns The selector string or undefined.
   * @internal
   */
  private _extractSelectorFromTypeReference(typeRef: TypeReferenceNode): string | undefined {
    const typeArgs = typeRef.getTypeArguments();
    if (typeArgs.length > 1) {
      const selectorNode = typeArgs[1];
      if (selectorNode.isKind(SyntaxKind.LiteralType)) {
        const literal = selectorNode.getLiteral();
        if (literal.isKind(SyntaxKind.StringLiteral)) {
          return literal.getLiteralText();
        }
      } else if (selectorNode.isKind(SyntaxKind.TemplateLiteralType)) {
        // Handle template literals like `button[mat-icon-button]`
        return selectorNode.getText().slice(1, -1);
      }
    }
    return undefined;
  }

  /**
   * Analyzes a class declaration to extract Angular element information.
   * @param classDecl The class declaration to analyze.
   * @returns The element information or null if not an Angular element.
   * @internal
   */
  private _analyzeAngularElement(classDecl: ClassDeclaration): {
    elementType: "component" | "directive" | "pipe";
    selector: string;
    isStandalone: boolean;
  } | null {
    // Check for component, then directive, then pipe
    const componentResult = this._analyzeElementType(classDecl, "ɵcmp", "component");
    if (componentResult) {
      return componentResult;
    }

    const directiveResult = this._analyzeElementType(classDecl, "ɵdir", "directive");
    if (directiveResult) {
      return directiveResult;
    }

    const pipeResult = this._analyzePipeElement(classDecl);
    if (pipeResult) {
      return pipeResult;
    }

    return null;
  }

  private _analyzeElementType(
    classDecl: ClassDeclaration,
    propertyName: "ɵcmp" | "ɵdir",
    elementType: "component" | "directive"
  ): { elementType: "component" | "directive"; selector: string; isStandalone: boolean } | null {
    const { prop } = this._findInheritedStaticProperty(classDecl, propertyName);
    if (!prop) {
      return null;
    }

    const typeNode = prop.getTypeNode();
    if (!typeNode?.isKind(SyntaxKind.TypeReference)) {
      return null;
    }

    const typeRef = typeNode as TypeReferenceNode;
    const selector = this._extractSelectorFromTypeReference(typeRef);
    if (!selector) {
      return null;
    }

    return {
      elementType,
      selector,
      isStandalone: this._isStandaloneFromTypeReference(typeRef, elementType),
    };
  }

  private _analyzePipeElement(
    classDecl: ClassDeclaration
  ): { elementType: "pipe"; selector: string; isStandalone: boolean } | null {
    const { prop: pipeDef } = this._findInheritedStaticProperty(classDecl, "ɵpipe");
    if (!pipeDef) {
      return null;
    }

    const typeNode = pipeDef.getTypeNode();
    if (!typeNode?.isKind(SyntaxKind.TypeReference)) {
      return null;
    }

    const typeRef = typeNode as TypeReferenceNode;
    const selector = this._extractPipeSelectorFromTypeReference(typeRef);
    if (!selector) {
      return null;
    }

    return {
      elementType: "pipe",
      selector,
      isStandalone: this._isStandaloneFromTypeReference(typeRef, "pipe"),
    };
  }

  private _extractPipeSelectorFromTypeReference(typeRef: TypeReferenceNode): string | null {
    const typeArgs = typeRef.getTypeArguments();
    if (typeArgs.length <= 1 || !typeArgs[1].isKind(SyntaxKind.LiteralType)) {
      return null;
    }

    const literal = (typeArgs[1] as LiteralTypeNode).getLiteral();
    if (!literal.isKind(SyntaxKind.StringLiteral)) {
      return null;
    }

    return literal.getLiteralText();
  }

  /**
   * Creates and indexes Angular element data.
   * @param className The class name.
   * @param elementType The element type.
   * @param selector The selector string.
   * @param isStandalone Whether the element is standalone.
   * @param importPath The original import path.
   * @param componentToModuleMap Map of components to modules.
   * @internal
   */
  private async _createAndIndexElementData(
    className: string,
    elementType: "component" | "directive" | "pipe",
    selector: string,
    isStandalone: boolean,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }>
  ): Promise<void> {
    const exportingModule = componentToModuleMap.get(className);
    const individualSelectors = await parseAngularSelector(selector);

    let finalImportPath = importPath;
    let finalImportName = className;

    if (exportingModule) {
      finalImportPath = exportingModule.importPath;
      finalImportName = isStandalone ? className : exportingModule.moduleName;
    }

    const isExternal = true; // This method is only for node_modules

    // For standalone external components, ensure we only store the one with the shortest import path.
    if (isStandalone && isExternal) {
      const bestPath = this._handleStandaloneExternalComponent(
        className,
        elementType,
        finalImportPath,
        individualSelectors
      );
      if (bestPath === null) {
        return; // A better candidate already exists, so skip this one.
      }
      finalImportPath = bestPath;
    }

    const elementData = new AngularElementData({
      path: finalImportPath,
      name: finalImportName,
      type: elementType,
      originalSelector: selector,
      selectors: individualSelectors,
      isStandalone,
      isExternal,
      exportingModuleName: !isStandalone && exportingModule ? exportingModule.moduleName : undefined,
    });

    for (const sel of individualSelectors) {
      this.selectorTrie.insert(sel, elementData);
    }

    const via = exportingModule ? `via ${exportingModule.moduleName}` : "directly";
    const standaloneTag = isStandalone ? "standalone" : "non-standalone";
    logger.info(
      `[NodeModulesIndexer] Indexed ${standaloneTag} ${elementType}: ${className} (${selector}) ${via} from ${finalImportPath}. Import target: ${finalImportName}`
    );
  }

  /**
   * Handles the special indexing logic for standalone components from external libraries.
   * It ensures that only one candidate with the shortest (most public) import path is stored.
   * @returns The determined final import path if processing should continue, or null if the candidate should be skipped.
   * @internal
   */
  private _handleStandaloneExternalComponent(
    className: string,
    elementType: "component" | "directive" | "pipe",
    currentImportPath: string,
    selectors: string[]
  ): string | null {
    // Use a representative selector to find existing candidates to avoid iterating over all selectors.
    const representativeSelector = selectors.length > 0 ? selectors[0] : "";
    if (!representativeSelector) {
      return currentImportPath; // Should not happen with valid components, but as a safeguard.
    }

    const existingCandidates = this.selectorTrie.findAll(representativeSelector);
    const existingElement = existingCandidates.find((c) => c.name === className);

    if (existingElement) {
      // An element with the same name already exists. Compare import paths.
      if (currentImportPath.length >= existingElement.path.length) {
        // The existing path is shorter or equal, so we keep it and discard this new one.
        logger.debug(
          `[NodeModulesIndexer] Skipping standalone ${elementType} ${className} from ${currentImportPath} because a better candidate from ${existingElement.path} already exists.`
        );
        return null; // Signal to skip this element.
      }

      // The new path is shorter. Remove the old element before adding this new, better one.
      logger.debug(
        `[NodeModulesIndexer] Found better path for standalone ${elementType} ${className}. Replacing ${existingElement.path} with ${currentImportPath}.`
      );
      for (const sel of existingElement.selectors) {
        // Use the precise remove operation.
        this.selectorTrie.remove(sel, existingElement.path, existingElement.name);
      }
    }

    // This is either the first time we see this element, or it's a better candidate.
    return currentImportPath;
  }

  /**
   * Indexes the declarations in a file.
   * @param sourceFile The source file to process.
   * @param importPath The import path of the source file.
   * @param componentToModuleMap A map of components to the modules that export them.
   * @internal
   */
  private async _indexDeclarationsInFile(
    sourceFile: SourceFile,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }>
  ) {
    try {
      const classDeclarations = this._collectClassDeclarations(sourceFile);

      // Find all Components, Directives, and Pipes
      for (const classDecl of classDeclarations.values()) {
        const className = classDecl.getName();
        // Skip unnamed or internal Angular classes
        if (!className || className.startsWith("ɵ")) {
          continue;
        }

        const elementInfo = this._analyzeAngularElement(classDecl);
        if (elementInfo) {
          await this._createAndIndexElementData(
            className,
            elementInfo.elementType,
            elementInfo.selector,
            elementInfo.isStandalone,
            importPath,
            componentToModuleMap
          );
        }
      }
    } catch (error) {
      try {
        logger.error(`Error indexing declarations in file ${sourceFile.getFilePath()}: ${(error as Error).message}`);
      } catch {
        logger.error(`Error indexing declarations in forgotten SourceFile node: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Gets all indexed selectors.
   * @returns An array of selectors.
   */
  getAllSelectors(): string[] {
    return this.selectorTrie.getAllSelectors();
  }

  /**
   * Searches for selectors with a given prefix.
   * @param prefix The prefix to search for.
   * @returns An array of objects containing the selector and the corresponding `AngularElementData`.
   */
  searchWithSelectors(prefix: string): { selector: string; element: AngularElementData }[] {
    return this.selectorTrie.searchWithSelectors(prefix);
  }

  /**
   * Disposes the file watcher and clears the caches.
   */
  dispose() {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
      this.fileWatcher = null;
    }
    this.clearInMemoryState();
    // Note: Should we dispose the ts-morph Project as well? It doesn't have a dispose method, but we can clear its files
    removeAllSourceFiles(this.project, "dispose");
  }
}
