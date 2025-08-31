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
import { findAngularDependencies, getLibraryEntryPoints, parseAngularSelector } from "../utils";

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
    const scoreType = (el: AngularElementData): number => {
      switch (el.type) {
        case "component":
          return 0;
        case "directive":
          return 1;
        case "pipe":
          return 2;
        default:
          return 3;
      }
    };

    candidatePool.sort((a, b) => {
      const typeDiff = scoreType(a) - scoreType(b);
      if (typeDiff !== 0) {
        return typeDiff;
      }

      const lenDiff = a.originalSelector.length - b.originalSelector.length;
      if (lenDiff !== 0) {
        return lenDiff;
      }

      return a.name.localeCompare(b.name);
    });

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

  public remove(selector: string, elementPath: string): void {
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
    // Remove the element if it matches the path
    currentNode.elements = currentNode.elements.filter((el) => path.resolve(el.path) !== path.resolve(elementPath));
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
 * The main class responsible for indexing Angular elements in a project.
 */
export class AngularIndexer {
  /**
   * The ts-morph project instance.
   */
  project: Project;
  private fileCache: Map<string, FileElementsInfo> = new Map();
  private selectorTrie: SelectorTrie = new SelectorTrie();
  private projectModuleMap: Map<string, { moduleName: string; importPath: string }> = new Map();
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

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: false, // Keep this as false for real file system interaction
      skipAddingFilesFromTsConfig: true,
      // Consider adding compilerOptions from tsconfig if available for more accurate parsing,
      // but this might slow down initialization. For now, default is fine.
    });
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
    logger.info(
      `AngularIndexer: Project root set to ${projectPath}. Cache keys: ${this.workspaceFileCacheKey}, ${this.workspaceIndexCacheKey}, ${this.workspaceModulesCacheKey}`
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
      const fallbackResult = this.parseAngularElementWithRegex(filePath, content);
      return fallbackResult ? [fallbackResult] : [];
    }

    try {
      let sourceFile = this.project.getSourceFile(filePath);
      if (sourceFile) {
        sourceFile.replaceWithText(content); // Update existing
      } else {
        sourceFile = this.project.createSourceFile(filePath, content, {
          overwrite: true,
        });
      }

      const elements: ComponentInfo[] = [];
      const classes = sourceFile.getClasses();

      for (const classDeclaration of classes) {
        const elementInfo = this.extractAngularElementInfo(classDeclaration, filePath, content); // content passed for hash
        if (elementInfo) {
          elements.push(elementInfo);
        }
      }

      // If no Angular elements found by ts-morph, try regex as a fallback
      if (elements.length === 0) {
        const fallbackResult = this.parseAngularElementWithRegex(filePath, content);
        if (fallbackResult) {
          elements.push(fallbackResult);
        }
      }

      return elements;
    } catch (error) {
      logger.error(`ts-morph parsing error for ${filePath} in project ${this.projectRootPath}:`, error as Error);
      const fallbackResult = this.parseAngularElementWithRegex(filePath, content);
      return fallbackResult ? [fallbackResult] : [];
    }
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
      let isStandalone = false;

      switch (decoratorName) {
        case "Component": {
          elementType = "component";
          const componentData = this.extractComponentDecoratorData(decorator);
          selector = componentData.selector;
          isStandalone = componentData.standalone;
          break;
        }
        case "Directive": {
          elementType = "directive";
          const directiveData = this.extractDirectiveDecoratorData(decorator);
          selector = directiveData.selector;
          isStandalone = directiveData.standalone;
          break;
        }
        case "Pipe": {
          elementType = "pipe";
          const pipeData = this.extractPipeDecoratorData(decorator);
          selector = pipeData.name;
          isStandalone = pipeData.standalone;
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
          isStandalone: isStandalone,
        };
      }
    }
    return null;
  }

  /**
   * Extracts the standalone flag from a decorator's arguments.
   * @param decorator The decorator to extract the flag from.
   * @returns `true` if the element is standalone, `false` otherwise.
   * @internal
   */
  private _extractStandaloneFlagFromDecorator(decorator: Decorator): boolean {
    try {
      const args = decorator.getArguments();
      if (args.length > 0 && args[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
        const objectLiteral = args[0] as ObjectLiteralExpression;
        const standaloneProperty = objectLiteral.getProperty("standalone");
        if (standaloneProperty?.isKind(SyntaxKind.PropertyAssignment)) {
          const initializer = standaloneProperty.getInitializer();
          return initializer?.isKind(SyntaxKind.TrueKeyword) ?? false;
        }
      }
    } catch (error) {
      logger.error("Error extracting standalone flag from decorator:", error as Error);
    }
    return false;
  }

  /**
   * Extracts the selector and standalone flag from a `@Component` decorator.
   * @param decorator The decorator to extract information from.
   * @returns An object containing the selector and standalone flag.
   * @internal
   */
  private extractComponentDecoratorData(decorator: Decorator): { selector?: string; standalone: boolean } {
    let selector: string | undefined;
    const standalone = this._extractStandaloneFlagFromDecorator(decorator);

    try {
      const args = decorator.getArguments();
      if (args.length > 0 && args[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
        const objectLiteral = args[0] as ObjectLiteralExpression;

        // Extract selector
        const selectorProperty = objectLiteral.getProperty("selector");
        if (selectorProperty?.isKind(SyntaxKind.PropertyAssignment)) {
          const initializer = selectorProperty.getInitializer();
          if (initializer?.isKind(SyntaxKind.StringLiteral)) {
            selector = initializer.getLiteralText();
          }
        }
      }
    } catch (error) {
      logger.error("Error extracting component selector from decorator:", error as Error);
    }

    return { selector, standalone };
  }

  /**
   * Extracts the selector and standalone flag from a `@Directive` decorator.
   * @param decorator The decorator to extract information from.
   * @returns An object containing the selector and standalone flag.
   * @internal
   */
  private extractDirectiveDecoratorData(decorator: Decorator): { selector?: string; standalone: boolean } {
    let selector: string | undefined;
    const standalone = this._extractStandaloneFlagFromDecorator(decorator);

    try {
      const args = decorator.getArguments();
      if (args.length > 0 && args[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
        const objectLiteral = args[0] as ObjectLiteralExpression;

        const selectorProperty = objectLiteral.getProperty("selector");
        if (selectorProperty?.isKind(SyntaxKind.PropertyAssignment)) {
          const initializer = selectorProperty.getInitializer();
          if (initializer?.isKind(SyntaxKind.StringLiteral)) {
            selector = initializer.getLiteralText();
          }
        }
      }
    } catch (error) {
      logger.error("Error extracting directive selector from decorator:", error as Error);
    }

    return { selector, standalone };
  }

  /**
   * Extracts the name and standalone flag from a `@Pipe` decorator.
   * @param decorator The decorator to extract information from.
   * @returns An object containing the name and standalone flag.
   * @internal
   */
  private extractPipeDecoratorData(decorator: Decorator): { name?: string; standalone: boolean } {
    let name: string | undefined;
    const standalone = this._extractStandaloneFlagFromDecorator(decorator);

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

    return { name, standalone };
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
  private async updateFileIndex(filePath: string, context: vscode.ExtensionContext): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        logger.warn(`File not found, cannot update index: ${filePath} for project ${this.projectRootPath}`);
        return;
      }
      if (!this.projectRootPath) {
        logger.error(`AngularIndexer.updateFileIndex: projectRootPath not set for ${filePath}. Aborting update.`);
        return;
      }
      if (!filePath.startsWith(this.projectRootPath)) {
        logger.warn(
          `AngularIndexer.updateFileIndex: File ${filePath} is outside of project root ${this.projectRootPath}. Skipping.`
        );
        return;
      }

      const stats = fs.statSync(filePath);
      const lastModified = stats.mtime.getTime();
      const cachedFile = this.fileCache.get(filePath);

      // Read content once
      const content = fs.readFileSync(filePath, "utf-8");
      const hash = this.generateHash(content);

      if (cachedFile && cachedFile.lastModified >= lastModified && cachedFile.hash === hash) {
        // If modification time is same or older, and hash is same, no need to parse
        // Update lastModified just in case it was touched without content change
        if (cachedFile.lastModified < lastModified) {
          const updatedCache: FileElementsInfo = {
            ...cachedFile,
            lastModified: lastModified,
          };
          this.fileCache.set(filePath, updatedCache);
        }
        return;
      }

      // If the file is a module, re-index project modules.
      if (filePath.endsWith(".module.ts")) {
        await this.indexProjectModules();
      }

      // Before parsing, remove all existing selectors from this file to ensure clean update
      if (cachedFile) {
        for (const oldElement of cachedFile.elements) {
          const individualSelectors = await parseAngularSelector(oldElement.selector);
          for (const selector of individualSelectors) {
            this.selectorTrie.remove(selector, filePath);
          }
        }
      }

      const parsedElements = this.parseAngularElementsWithTsMorph(filePath, content);

      if (parsedElements.length > 0) {
        // Update file cache with all elements from this file
        const fileElementsInfo: FileElementsInfo = {
          filePath: filePath,
          lastModified: lastModified,
          hash: hash,
          elements: parsedElements,
        };
        this.fileCache.set(filePath, fileElementsInfo);

        // Add all parsed elements to the selector index
        for (const parsed of parsedElements) {
          // Parse the selector to get all individual selectors
          const individualSelectors = await parseAngularSelector(parsed.selector);

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

          const elementData = new AngularElementData(
            importPath,
            importName,
            parsed.type,
            parsed.selector, // original selector
            individualSelectors,
            parsed.isStandalone,
            false, // isExternal
            moduleToImport
          );

          // Index the element under each individual selector
          for (const selector of individualSelectors) {
            this.selectorTrie.insert(selector, elementData);
            logger.info(`Updated index for ${this.projectRootPath}: ${selector} (${parsed.type}) -> ${parsed.path}`);
          }
        }
      } else {
        // Parsing failed or not an Angular element - remove from file cache and trie
        this.fileCache.delete(filePath);
        const sourceFile = this.project.getSourceFile(filePath);
        if (sourceFile) {
          this.project.removeSourceFile(sourceFile); // or sourceFile.forget()
        }
        logger.info(`No Angular elements found in ${filePath} for ${this.projectRootPath}`);
      }
      await this.saveIndexToWorkspace(context);
    } catch (error) {
      logger.error(`Error updating index for ${filePath} in project ${this.projectRootPath}:`, error as Error);
    }
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
          this.selectorTrie.remove(selector, filePath);
          logger.info(`Removed from index for ${this.projectRootPath}: ${selector} from ${filePath}`);
        }
      }
      this.fileCache.delete(filePath);
    }

    // Remove from ts-morph project
    const sourceFile = this.project.getSourceFile(filePath);
    if (sourceFile) {
      this.project.removeSourceFile(sourceFile);
    }

    if (fileInfo) {
      await this.saveIndexToWorkspace(context);
    }
  }

  /**
   * Generates a full index of the project.
   * @param context The extension context.
   * @returns A map of selectors to `AngularElementData` objects.
   */
  async generateFullIndex(context: vscode.ExtensionContext): Promise<Map<string, AngularElementData>> {
    if (this.isIndexing) {
      logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): Already indexing, skipping...`);
      return new Map(this.selectorTrie.getAllElements().map((e) => [e.originalSelector, e]));
    }

    this.isIndexing = true;
    try {
      logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): Starting full index generation...`);
      if (!this.projectRootPath) {
        logger.error("AngularIndexer.generateFullIndex: projectRootPath not set. Aborting.");
        return new Map();
      }

      // Clear existing ts-morph project files before full scan to avoid stale data
      this.project.getSourceFiles().forEach((sf) => this.project.removeSourceFile(sf));
      this.fileCache.clear();
      this.selectorTrie.clear();
      this.projectModuleMap.clear();

      await this.indexProjectModules();

      const angularFiles = await this.getAngularFilesUsingVsCode();
      logger.info(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Found ${angularFiles.length} Angular files.`
      );

      const batchSize = 20; // Process in batches
      for (let i = 0; i < angularFiles.length; i += batchSize) {
        const batch = angularFiles.slice(i, i + batchSize);
        // Sequentially process files in a batch to avoid overwhelming ts-morph or fs
        for (const file of batch) {
          await this.updateFileIndex(file, context);
        }
        // const batchTasks = batch.map(file => this.updateFileIndex(file, context));
        // await Promise.all(batchTasks); // This could be too concurrent for ts-morph project modifications
        logger.info(
          `AngularIndexer (${path.basename(
            this.projectRootPath
          )}): Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(angularFiles.length / batchSize)}`
        );
      }

      const totalElements = this.selectorTrie.getAllElements().length;
      logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): Indexed ${totalElements} elements.`);

      await this.indexNodeModules(context);

      await this.saveIndexToWorkspace(context);
      return new Map(this.selectorTrie.getAllElements().map((e) => [e.originalSelector, e]));
    } finally {
      this.isIndexing = false;
    }
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
      const storedCache = context.workspaceState.get<Record<string, FileElementsInfo | ComponentInfo>>(
        this.workspaceFileCacheKey
      );
      const storedIndex = context.workspaceState.get<Record<string, AngularElementData>>(this.workspaceIndexCacheKey);
      const storedModules = context.workspaceState.get<Record<string, { moduleName: string; importPath: string }>>(
        this.workspaceModulesCacheKey
      );

      if (storedCache && storedIndex) {
        // Convert old ComponentInfo format to new FileElementsInfo format if needed
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
        this.fileCache = convertedCache;

        this.selectorTrie.clear();
        for (const [key, value] of Object.entries(storedIndex)) {
          const elementData = new AngularElementData(
            value.path,
            value.name,
            value.type,
            value.originalSelector || key,
            await parseAngularSelector(value.originalSelector || key),
            value.isStandalone,
            value.isExternal ?? value.path.includes("node_modules"), // Use cached isExternal, fallback for old cache
            value.exportingModuleName,
          );
          // Index under all its selectors
          for (const selector of elementData.selectors) {
            this.selectorTrie.insert(selector, elementData);
          }
        }
        // Note: This does not repopulate the ts-morph Project.
        // A full scan or lazy loading of files into ts-morph Project is still needed if AST is required later.
        // For now, the index is used for lookups, and files are added to ts-morph Project on demand (e.g. during updateFileIndex or importElementToFile).

        if (storedModules) {
          this.projectModuleMap = new Map(Object.entries(storedModules));
        }
        logger.info(
          `AngularIndexer (${path.basename(this.projectRootPath)}): Loaded ${
            this.selectorTrie.size
          } elements from workspace cache.`
        );
        return true;
      }
    } catch (error) {
      logger.error(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Error loading index from workspace:`,
        error as Error
      );
    }
    logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): No valid cache found in workspace.`);
    return false;
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
      !this.workspaceModulesCacheKey
    ) {
      logger.error("AngularIndexer.clearCache: projectRootPath or cache keys not set. Cannot clear cache.");
      return;
    }
    try {
      // Clear in-memory state
      this.fileCache.clear();
      this.selectorTrie.clear();
      this.projectModuleMap.clear();
      this.project.getSourceFiles().forEach((sf) => this.project.removeSourceFile(sf));

      // Clear persisted state
      await context.workspaceState.update(this.workspaceFileCacheKey, undefined);
      await context.workspaceState.update(this.workspaceIndexCacheKey, undefined);
      await context.workspaceState.update(this.workspaceModulesCacheKey, undefined);

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
   * Indexes all Angular libraries in `node_modules`.
   * @param context The extension context.
   */
  public async indexNodeModules(context: vscode.ExtensionContext): Promise<void> {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Angular Auto-Import: Indexing libraries from node_modules...`,
        cancellable: false,
      },
      async (progress) => {
        try {
          if (!this.projectRootPath) {
            logger.error("AngularIndexer.indexNodeModules: projectRootPath not set.");
            return;
          }
          progress.report({ message: "Finding Angular libraries..." });
          const angularDeps = await findAngularDependencies(this.projectRootPath);
          logger.debug(`[indexNodeModules] Found ${angularDeps.length} Angular dependencies.`);

          const totalDeps = angularDeps.length;
          let processedCount = 0;

          for (const dep of angularDeps) {
            processedCount++;
            progress.report({
              message: `Processing ${dep.name}... (${processedCount}/${totalDeps})`,
              increment: (1 / totalDeps) * 100,
            });

            const entryPoints = await getLibraryEntryPoints(dep);
            if (entryPoints.size === 0) {
              continue;
            }

            logger.debug(`[indexNodeModules] Found ${entryPoints.size} entry points for ${dep.name}`);
            await this._indexLibrary(entryPoints);
          }
          await this.saveIndexToWorkspace(context);
          logger.debug(`[indexNodeModules] Finished indexing ${processedCount} libraries.`);
        } catch (error) {
          logger.error("[indexNodeModules] Error during node_modules indexing:", error as Error);
        }
      }
    );
  }

  /**
   * Indexes a library from its entry points.
   * @param entryPoints A map of import paths to file paths.
   * @internal
   */
  private async _indexLibrary(entryPoints: Map<string, string>): Promise<void> {
    const libraryFiles: { importPath: string; sourceFile: SourceFile }[] = [];
    for (const [importPath, filePath] of entryPoints.entries()) {
      try {
        const sourceFile = this.project.addSourceFileAtPathIfExists(filePath);
        if (sourceFile) {
          libraryFiles.push({ importPath, sourceFile });
        }
      } catch (error) {
        logger.warn(`[Indexer] Could not process library file ${filePath}: ${(error as Error).message}`);
      }
    }

    if (libraryFiles.length === 0) {
      return;
    }
    const typeChecker = this.project.getTypeChecker();

    const allLibraryClasses = new Map<string, ClassDeclaration>();
    // Pass 0: Collect all class declarations from all files in the library for easy lookup.
    for (const { sourceFile } of libraryFiles) {
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

    const componentToModuleMap = new Map<string, { moduleName: string; importPath: string }>();

    // Pass 1: Build a complete map of all modules and their exports for the entire library
    for (const { importPath, sourceFile } of libraryFiles) {
      this._buildComponentToModuleMap(sourceFile, importPath, componentToModuleMap, allLibraryClasses, typeChecker);
    }

    // Pass 2: Index all components/directives/pipes using the complete map
    for (const { importPath, sourceFile } of libraryFiles) {
      await this._indexDeclarationsInFile(sourceFile, importPath, componentToModuleMap);
    }
  }

  /**
   * Indexes all NgModules in the project.
   * @internal
   */
  private async indexProjectModules(): Promise<void> {
    if (!this.projectRootPath) {
      return;
    }
    logger.debug(`[Indexer] Indexing project NgModules for ${this.projectRootPath}...`);
    this.projectModuleMap.clear();

    const moduleFiles = await vscode.workspace.findFiles(
      new vscode.RelativePattern(this.projectRootPath, "**/*.module.ts"),
      new vscode.RelativePattern(this.projectRootPath, "**/node_modules/**")
    );

    for (const file of moduleFiles) {
      try {
        const sourceFile = this.project.addSourceFileAtPath(file.fsPath);
        this._processProjectModuleFile(sourceFile);
      } catch (error) {
        logger.warn(`[Indexer] Could not process project module file ${file.fsPath}: ${(error as Error).message}`);
      }
    }

    // Process already opened files that might be modules
    for (const sourceFile of this.project.getSourceFiles()) {
      if (
        sourceFile.getFilePath().endsWith(".module.ts") &&
        !moduleFiles.some((f) => f.fsPath === sourceFile.getFilePath())
      ) {
        this._processProjectModuleFile(sourceFile);
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
    const classDeclarations = sourceFile.getClasses();
    for (const classDecl of classDeclarations) {
      const ngModuleDecorator = classDecl.getDecorator("NgModule");
      if (!ngModuleDecorator) {
        continue;
      }

      const moduleName = classDecl.getName();
      if (!moduleName) {
        continue;
      }

      const decoratorArg = ngModuleDecorator.getArguments()[0];
      if (!decoratorArg || !decoratorArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
        continue;
      }

      const objectLiteral = decoratorArg as ObjectLiteralExpression;
      const exportsProp = objectLiteral.getProperty("exports");

      if (!exportsProp) {
        continue;
      }

      const exportedIdentifiers = this._getIdentifierNamesFromArrayProp(exportsProp as PropertyAssignment);

      for (const componentName of exportedIdentifiers) {
        // Simple mapping, assumes component is declared in the same module if exported.
        // A more complex implementation would also check the `declarations` array.
        if (!this.projectModuleMap.has(componentName)) {
          this.projectModuleMap.set(componentName, {
            moduleName,
            importPath: path.relative(this.projectRootPath, sourceFile.getFilePath()).replace(/\\/g, "/"),
          });
        }
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
    if (!initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
      return [];
    }

    const arr = initializer as ArrayLiteralExpression;
    return arr.getElements().map((el) => el.getText());
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
    componentToModuleMap: Map<string, { moduleName: string; importPath: string }>,
    allLibraryClasses: Map<string, ClassDeclaration>,
    typeChecker: TypeChecker
  ) {
    try {
      const classDeclarations = new Map<string, ClassDeclaration>();

      // FIX: Use getExportedDeclarations() to correctly resolve re-exported modules.
      // This was the logic before the faulty commit.
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

      // Find all NgModules among the correctly found classes and map their exports
      for (const classDecl of classDeclarations.values()) {
        const className = classDecl.getName();
        // Skip unnamed or internal Angular modules
        if (!className || className.startsWith("ɵ")) {
          continue;
        }

        const modDef = classDecl.getStaticProperty("ɵmod");
        if (modDef?.isKind(SyntaxKind.PropertyDeclaration)) {
          const typeNode = modDef.getTypeNode();
          if (typeNode?.isKind(SyntaxKind.TypeReference)) {
            const typeRef = typeNode as TypeReferenceNode;
            const typeArgs = typeRef.getTypeArguments();

            if (typeArgs.length > 3 && typeArgs[3].isKind(SyntaxKind.TupleType)) {
              const exportsTuple = typeArgs[3].asKindOrThrow(SyntaxKind.TupleType);
              this._processModuleExports(
                exportsTuple,
                className,
                importPath,
                componentToModuleMap,
                allLibraryClasses,
                typeChecker
              );
            }
          }
        }
      }
    } catch (error) {
      logger.error(`Error building module map for file ${sourceFile.getFilePath()}:`, error as Error);
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
   * @internal
   */
  private _processModuleExports(
    exportsTuple: import("ts-morph").TupleTypeNode,
    moduleName: string,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string }>,
    allLibraryClasses: Map<string, ClassDeclaration>,
    typeChecker: TypeChecker
  ) {
    for (const element of exportsTuple.getElements()) {
      let exportedClassName: string | undefined;

      // Semantic resolution using TypeChecker
      const exprName = element.isKind(SyntaxKind.TypeQuery)
        ? element.asKindOrThrow(SyntaxKind.TypeQuery).getExprName()
        : element.asKindOrThrow(SyntaxKind.TypeReference).getTypeName();
      const type = typeChecker.getTypeAtLocation(exprName);
      const symbol = type.getSymbol() ?? type.getAliasSymbol();
      if (symbol) {
        const aliased = symbol.getAliasedSymbol();
        const finalSymbol = aliased || symbol;
        exportedClassName = finalSymbol.getName();
      }

      if (exportedClassName) {
        const exportedClassDecl = allLibraryClasses.get(exportedClassName);

        // Check if the exported item is another NgModule
        if (exportedClassDecl?.getStaticProperty("ɵmod")) {
          // It's a re-exported module. Recursively process its exports.
          const modDef = exportedClassDecl.getStaticProperty("ɵmod");
          if (modDef?.isKind(SyntaxKind.PropertyDeclaration)) {
            const typeNode = modDef.getTypeNode();
            if (typeNode?.isKind(SyntaxKind.TypeReference)) {
              const typeRef = typeNode as TypeReferenceNode;
              const typeArgs = typeRef.getTypeArguments();

              if (typeArgs.length > 3 && typeArgs[3].isKind(SyntaxKind.TupleType)) {
                const innerExportsTuple = typeArgs[3].asKindOrThrow(SyntaxKind.TupleType);
                // RECURSION: Process the inner module's exports, but attribute them
                // to the *current* moduleName that is doing the re-exporting.
                this._processModuleExports(
                  innerExportsTuple,
                  moduleName,
                  importPath,
                  componentToModuleMap,
                  allLibraryClasses,
                  typeChecker
                );
              }
            }
          }
        } else {
          // It's a component/directive/pipe. Map it to the current module.
          // Do not overwrite. First module found that exports a component 'wins'.
          if (!componentToModuleMap.has(exportedClassName)) {
            componentToModuleMap.set(exportedClassName, {
              moduleName: moduleName,
              importPath,
            });
          }
        }
      }
    }
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
   * Indexes the declarations in a file.
   * @param sourceFile The source file to process.
   * @param importPath The import path of the source file.
   * @param componentToModuleMap A map of components to the modules that export them.
   * @internal
   */
  private async _indexDeclarationsInFile(
    sourceFile: SourceFile,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string }>
  ) {
    try {
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

      /**
       * Recursively searches for a static property (e.g., ɵcmp) in the inheritance chain.
       */
      const findInheritedStaticProperty = (
        cls: ClassDeclaration,
        propName: "ɵcmp" | "ɵdir" | "ɵpipe"
      ): { owner: ClassDeclaration; prop: import("ts-morph").PropertyDeclaration | undefined } => {
        let current: ClassDeclaration | undefined = cls;
        while (current) {
          const prop = current.getStaticProperty(propName);
          if (prop?.isKind(SyntaxKind.PropertyDeclaration)) {
            return { owner: current, prop };
          }
          current = current.getBaseClass();
        }
        return { owner: cls, prop: undefined };
      };

      // Find all Components, Directives, and Pipes
      for (const classDecl of classDeclarations.values()) {
        const className = classDecl.getName();
        // Skip unnamed or internal Angular classes
        if (!className || className.startsWith("ɵ")) {
          continue;
        }

        // Reset for each class
        let elementType: "component" | "directive" | "pipe" | null = null;
        let selector: string | undefined;
        let isStandalone = false;

        // Check for component, then directive, then pipe
        const { prop: cmpDef } = findInheritedStaticProperty(classDecl, "ɵcmp");
        if (cmpDef) {
          elementType = "component";
          const typeNode = cmpDef.getTypeNode();
          if (typeNode?.isKind(SyntaxKind.TypeReference)) {
            const typeRef = typeNode as TypeReferenceNode;
            const typeArgs = typeRef.getTypeArguments();
            if (typeArgs.length > 1) {
              const selectorNode = typeArgs[1];
              if (selectorNode.isKind(SyntaxKind.LiteralType)) {
                const literal = selectorNode.getLiteral();
                if (literal.isKind(SyntaxKind.StringLiteral)) {
                  selector = literal.getLiteralText();
                }
              } else if (selectorNode.isKind(SyntaxKind.TemplateLiteralType)) {
                // Handle template literals like `button[mat-icon-button]`
                selector = selectorNode.getText().slice(1, -1);
              }
            }
            isStandalone = this._isStandaloneFromTypeReference(typeRef, "component");
          }
        } else {
          const { prop: dirDef } = findInheritedStaticProperty(classDecl, "ɵdir");
          if (dirDef) {
            elementType = "directive";
            const typeNode = dirDef.getTypeNode();
            if (typeNode?.isKind(SyntaxKind.TypeReference)) {
              const typeRef = typeNode as TypeReferenceNode;
              const typeArgs = typeRef.getTypeArguments();
              if (typeArgs.length > 1) {
                const selectorNode = typeArgs[1];
                if (selectorNode.isKind(SyntaxKind.LiteralType)) {
                  const literal = selectorNode.getLiteral();
                  if (literal.isKind(SyntaxKind.StringLiteral)) {
                    selector = literal.getLiteralText();
                  }
                } else if (selectorNode.isKind(SyntaxKind.TemplateLiteralType)) {
                  selector = selectorNode.getText().slice(1, -1);
                }
              }
              isStandalone = this._isStandaloneFromTypeReference(typeRef, "directive");
            }
          } else {
            const { prop: pipeDef } = findInheritedStaticProperty(classDecl, "ɵpipe");
            if (pipeDef) {
              elementType = "pipe";
              const typeNode = pipeDef.getTypeNode();
              if (typeNode?.isKind(SyntaxKind.TypeReference)) {
                const typeRef = typeNode as TypeReferenceNode;
                const typeArgs = typeRef.getTypeArguments();
                if (typeArgs.length > 1 && typeArgs[1].isKind(SyntaxKind.LiteralType)) {
                  const literal = (typeArgs[1] as LiteralTypeNode).getLiteral();
                  if (literal.isKind(SyntaxKind.StringLiteral)) {
                    selector = literal.getLiteralText();
                  }
                }
                isStandalone = this._isStandaloneFromTypeReference(typeRef, "pipe");
              }
            }
          }
        }

        if (elementType && selector) {
          const exportingModule = componentToModuleMap.get(className);
          const individualSelectors = await parseAngularSelector(selector);

          let finalImportPath = importPath;
          let finalImportName = className;

          if (exportingModule) {
            finalImportPath = exportingModule.importPath;
            finalImportName = isStandalone ? className : exportingModule.moduleName;
          }

          const elementData = new AngularElementData(
            finalImportPath,
            finalImportName,
            elementType,
            selector,
            individualSelectors,
            isStandalone,
            true, // isExternal
            !isStandalone && exportingModule ? exportingModule.moduleName : undefined
          );

          for (const sel of individualSelectors) {
            this.selectorTrie.insert(sel, elementData);
          }

          const via = exportingModule ? `via ${exportingModule.moduleName}` : "directly";
          const standaloneTag = isStandalone ? "standalone" : "non-standalone";
          logger.info(
            `[NodeModulesIndexer] Indexed ${standaloneTag} ${elementType}: ${className} (${selector}) ${via} from ${finalImportPath}. Import target: ${finalImportName}`
          );
        }
      }
    } catch (error) {
      logger.error(`Error indexing declarations in file ${sourceFile.getFilePath()}:`, error as Error);
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
   * Gets all Angular files in the project using the VS Code API.
   * @returns An array of file paths.
   * @internal
   */
  private async getAngularFilesUsingVsCode(): Promise<string[]> {
    try {
      const patterns = ["**/*.ts"];
      const allFiles: string[] = [];
      for (const pattern of patterns) {
        const files = await vscode.workspace.findFiles(
          new vscode.RelativePattern(this.projectRootPath, pattern),
          new vscode.RelativePattern(this.projectRootPath, "**/node_modules/**") // Ensure exclusion is relative to workspace folder
        );
        allFiles.push(...files.map((file) => file.fsPath));
      }
      return allFiles;
    } catch (error) {
      logger.error(`Error finding files using VS Code API: ${error}`);
      return this.getAngularFilesFallback(this.projectRootPath).map((relPath) =>
        path.join(this.projectRootPath, relPath)
      );
    }
  }

  /**
   * Gets all Angular files in the project using a fallback method.
   * @param basePath The base path of the project.
   * @returns An array of file paths.
   * @internal
   */
  private getAngularFilesFallback(basePath: string): string[] {
    // Fallback to manual file discovery (simplified, consider enhancing .gitignore handling if this is frequently used)
    const angularFiles: string[] = [];
    const excludedDirs = new Set([
      "node_modules",
      ".git",
      "dist",
      "build",
      "out",
      ".vscode",
      ".angular",
      "coverage",
      "tmp",
    ]);

    const traverseDirectory = (currentDirPath: string) => {
      try {
        const entries = fs.readdirSync(currentDirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDirPath, entry.name);
          if (entry.isDirectory()) {
            if (!excludedDirs.has(entry.name)) {
              traverseDirectory(fullPath);
            }
          } else if (entry.isFile() && /\.ts$/.test(entry.name)) {
            angularFiles.push(path.relative(basePath, fullPath));
          }
        }
      } catch (_err) {
        // logger.warn(`Could not read directory ${currentDirPath}: ${err}`);
      }
    };
    if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
      traverseDirectory(basePath);
    }
    return angularFiles;
  }

  /**
   * Disposes the file watcher and clears the caches.
   */
  dispose() {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
      this.fileWatcher = null;
    }
    this.fileCache.clear();
    this.selectorTrie.clear();
    // Note: Should we dispose the ts-morph Project as well? It doesn't have a dispose method, but we can clear its files
    this.project.getSourceFiles().forEach((sf) => this.project.removeSourceFile(sf));
  }
}
