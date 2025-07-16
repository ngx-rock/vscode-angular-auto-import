/**
 * Angular Indexer Service
 * Responsible for indexing Angular components, directives, and pipes.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  type ClassDeclaration,
  type Decorator,
  type LiteralTypeNode,
  type ObjectLiteralExpression,
  Project,
  type PropertyAssignment,
  type StringLiteral,
  SyntaxKind,
  type TypeReferenceNode,
} from "ts-morph";
import * as vscode from "vscode";
import { AngularElementData, type ComponentInfo, type FileElementsInfo } from "../types";
import { findAngularDependencies, getLibraryEntryPoints, parseAngularSelector } from "../utils";

class TrieNode {
  public children: Map<string, TrieNode> = new Map();
  public elements: AngularElementData[] = [];
}

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

export class AngularIndexer {
  project: Project; // Made public for access in importElementToFile
  private fileCache: Map<string, FileElementsInfo> = new Map();
  private selectorTrie: SelectorTrie = new SelectorTrie();
  public fileWatcher: vscode.FileSystemWatcher | null = null;
  private projectRootPath: string = "";
  private isIndexing: boolean = false;

  public workspaceFileCacheKey: string = "";
  public workspaceIndexCacheKey: string = "";

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: false, // Keep this as false for real file system interaction
      skipAddingFilesFromTsConfig: true,
      // Consider adding compilerOptions from tsconfig if available for more accurate parsing,
      // but this might slow down initialization. For now, default is fine.
    });
  }

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
    console.log(
      `AngularIndexer: Project root set to ${projectPath}. Cache keys: ${this.workspaceFileCacheKey}, ${this.workspaceIndexCacheKey}`
    );
  }

  initializeWatcher(context: vscode.ExtensionContext) {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
    if (!this.projectRootPath) {
      console.error("AngularIndexer: Cannot initialize watcher, projectRootPath not set.");
      return;
    }

    // Updated pattern to support uppercase letters in filenames
    const pattern = new vscode.RelativePattern(this.projectRootPath, "**/*{[Cc]omponent,[Dd]irective,[Pp]ipe}.ts");
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.fileWatcher.onDidCreate(async (uri) => {
      console.log(`Watcher (${path.basename(this.projectRootPath)}): File created: ${uri.fsPath}`);
      await this.updateFileIndex(uri.fsPath, context);
    });

    this.fileWatcher.onDidChange(async (uri) => {
      console.log(`Watcher (${path.basename(this.projectRootPath)}): File changed: ${uri.fsPath}`);
      await this.updateFileIndex(uri.fsPath, context);
    });

    this.fileWatcher.onDidDelete(async (uri) => {
      console.log(`Watcher (${path.basename(this.projectRootPath)}): File deleted: ${uri.fsPath}`);
      await this.removeFromIndex(uri.fsPath, context);
      // Also remove from ts-morph project
      const sourceFile = this.project.getSourceFile(uri.fsPath);
      if (sourceFile) {
        this.project.removeSourceFile(sourceFile);
      }
    });

    context.subscriptions.push(this.fileWatcher);
    console.log(`AngularIndexer: File watcher initialized for ${this.projectRootPath} with pattern ${pattern.pattern}`);
  }

  private generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  private parseAngularElementsWithTsMorph(filePath: string, content: string): ComponentInfo[] {
    if (!this.projectRootPath) {
      console.error("AngularIndexer.parseAngularElementsWithTsMorph: projectRootPath is not set.");
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
      console.error(`ts-morph parsing error for ${filePath} in project ${this.projectRootPath}:`, error);
      const fallbackResult = this.parseAngularElementWithRegex(filePath, content);
      return fallbackResult ? [fallbackResult] : [];
    }
  }

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

  private extractSelectorFromDecorator(decorator: Decorator): string | undefined {
    try {
      const args = decorator.getArguments();
      if (args.length === 0) {
        return undefined;
      }

      const firstArg = args[0];
      if (!firstArg || !firstArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
        return undefined;
      }

      const objectLiteral = firstArg as ObjectLiteralExpression;
      const selectorProperty = objectLiteral.getProperty("selector");

      if (selectorProperty?.isKind(SyntaxKind.PropertyAssignment)) {
        const propertyAssignment = selectorProperty as PropertyAssignment;
        const initializer = propertyAssignment.getInitializer();

        if (initializer?.isKind(SyntaxKind.StringLiteral)) {
          return (initializer as StringLiteral).getLiteralText();
        }
      }
    } catch (error) {
      console.error("Error extracting selector from decorator:", error);
    }
    return undefined;
  }

  private extractComponentDecoratorData(decorator: Decorator): { selector?: string; standalone: boolean } {
    let selector: string | undefined;
    let standalone = false;

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

        // Extract standalone flag
        const standaloneProperty = objectLiteral.getProperty("standalone");
        if (standaloneProperty?.isKind(SyntaxKind.PropertyAssignment)) {
          const initializer = standaloneProperty.getInitializer();
          if (initializer?.isKind(SyntaxKind.TrueKeyword) || initializer?.isKind(SyntaxKind.FalseKeyword)) {
            standalone = initializer.isKind(SyntaxKind.TrueKeyword);
          }
        }
      }
    } catch (error) {
      console.error("Error extracting component data from decorator:", error);
    }

    return { selector, standalone };
  }

  private extractDirectiveDecoratorData(decorator: Decorator): { selector?: string; standalone: boolean } {
    let selector: string | undefined;
    let standalone = false;

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

        const standaloneProperty = objectLiteral.getProperty("standalone");
        if (standaloneProperty?.isKind(SyntaxKind.PropertyAssignment)) {
          const initializer = standaloneProperty.getInitializer();
          standalone = initializer?.isKind(SyntaxKind.TrueKeyword) ?? false;
        }
      }
    } catch (error) {
      console.error("Error extracting directive data from decorator:", error);
    }

    return { selector, standalone };
  }

  private extractPipeDecoratorData(decorator: Decorator): { name?: string; standalone: boolean } {
    let name: string | undefined;
    let standalone = false;

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

        const standaloneProperty = objectLiteral.getProperty("standalone");
        if (standaloneProperty?.isKind(SyntaxKind.PropertyAssignment)) {
          const initializer = standaloneProperty.getInitializer();
          standalone = initializer?.isKind(SyntaxKind.TrueKeyword) ?? false;
        }
      }
    } catch (error) {
      console.error("Error extracting pipe data from decorator:", error);
    }

    return { name, standalone };
  }

  private extractPipeNameFromDecorator(decorator: Decorator): string | undefined {
    try {
      const args = decorator.getArguments();
      if (args.length === 0) {
        return undefined;
      }

      const firstArg = args[0];
      if (!firstArg || !firstArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
        return undefined;
      }

      const objectLiteral = firstArg as ObjectLiteralExpression;
      const nameProperty = objectLiteral.getProperty("name");

      if (nameProperty?.isKind(SyntaxKind.PropertyAssignment)) {
        const propertyAssignment = nameProperty as PropertyAssignment;
        const initializer = propertyAssignment.getInitializer();

        if (initializer?.isKind(SyntaxKind.StringLiteral)) {
          return (initializer as StringLiteral).getLiteralText();
        }
      }
    } catch (error) {
      console.error("Error extracting pipe name from decorator:", error);
    }
    return undefined;
  }

  private parseAngularElementWithRegex(filePath: string, content: string): ComponentInfo | null {
    // This is a fallback, ensure it's robust enough or log clearly when it's used.
    // Note: This regex approach only finds the first element, unlike the ts-morph approach
    if (!this.projectRootPath) {
      console.warn(
        "AngularIndexer.parseAngularElementWithRegex: projectRootPath is not set. Regex parsing might be unreliable."
      );
      // Allow to proceed but with caution
    }

    const selectorRegex = /selector:\s*['"]([^'"]*)['"]/;
    const pipeNameRegex = /name:\s*['"]([^'"]*)['"]/;
    const classNameRegex = /export\s+class\s+(\w+)/;
    const fileName = path.basename(filePath);
    let elementType: "component" | "directive" | "pipe";

    // Support both lowercase and uppercase patterns
    if (fileName.includes(".component.") || fileName.includes(".Component.")) {
      elementType = "component";
    } else if (fileName.includes(".directive.") || fileName.includes(".Directive.")) {
      elementType = "directive";
    } else if (fileName.includes(".pipe.") || fileName.includes(".Pipe.")) {
      elementType = "pipe";
    } else {
      return null;
    }

    const classNameMatch = classNameRegex.exec(content);
    if (!classNameMatch?.[1]) {
      return null;
    }

    let selector: string | undefined;
    if (elementType === "pipe") {
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
        type: elementType,
        isStandalone: false, // Fallback parser cannot determine this, default to false.
      };
    }
    return null;
  }

  private async updateFileIndex(filePath: string, context: vscode.ExtensionContext): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found, cannot update index: ${filePath} for project ${this.projectRootPath}`);
        return;
      }
      if (!this.projectRootPath) {
        console.error(`AngularIndexer.updateFileIndex: projectRootPath not set for ${filePath}. Aborting update.`);
        return;
      }
      if (!filePath.startsWith(this.projectRootPath)) {
        console.warn(
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

      // Before parsing, remove all existing selectors from this file to ensure clean update
      if (cachedFile) {
        for (const oldElement of cachedFile.elements) {
          const individualSelectors = parseAngularSelector(oldElement.selector);
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
        parsedElements.forEach((parsed) => {
          // Parse the selector to get all individual selectors
          const individualSelectors = parseAngularSelector(parsed.selector);
          const elementData = new AngularElementData(
            parsed.path,
            parsed.name,
            parsed.type,
            parsed.selector, // original selector
            individualSelectors,
            parsed.isStandalone
          );

          // Index the element under each individual selector
          for (const selector of individualSelectors) {
            this.selectorTrie.insert(selector, elementData);
            console.log(`Updated index for ${this.projectRootPath}: ${selector} (${parsed.type}) -> ${parsed.path}`);
          }
        });
      } else {
        // Parsing failed or not an Angular element - remove from file cache and trie
        this.fileCache.delete(filePath);
        const sourceFile = this.project.getSourceFile(filePath);
        if (sourceFile) {
          this.project.removeSourceFile(sourceFile); // or sourceFile.forget()
        }
        console.log(`No Angular elements found in ${filePath} for ${this.projectRootPath}`);
      }
      await this.saveIndexToWorkspace(context);
    } catch (error) {
      console.error(`Error updating index for ${filePath} in project ${this.projectRootPath}:`, error);
    }
  }

  private async removeFromIndex(filePath: string, context: vscode.ExtensionContext): Promise<void> {
    // Remove from file cache
    const fileInfo = this.fileCache.get(filePath);
    if (fileInfo) {
      for (const element of fileInfo.elements) {
        const individualSelectors = parseAngularSelector(element.selector);
        for (const selector of individualSelectors) {
          this.selectorTrie.remove(selector, filePath);
          console.log(`Removed from index for ${this.projectRootPath}: ${selector} from ${filePath}`);
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

  async generateFullIndex(context: vscode.ExtensionContext): Promise<Map<string, AngularElementData>> {
    if (this.isIndexing) {
      console.log(`AngularIndexer (${path.basename(this.projectRootPath)}): Already indexing, skipping...`);
      return new Map(this.selectorTrie.getAllElements().map((e) => [e.originalSelector, e]));
    }

    this.isIndexing = true;
    try {
      console.log(`AngularIndexer (${path.basename(this.projectRootPath)}): Starting full index generation...`);
      if (!this.projectRootPath) {
        console.error("AngularIndexer.generateFullIndex: projectRootPath not set. Aborting.");
        return new Map();
      }

      // Clear existing ts-morph project files before full scan to avoid stale data
      this.project.getSourceFiles().forEach((sf) => this.project.removeSourceFile(sf));
      this.fileCache.clear();
      this.selectorTrie.clear();

      const angularFiles = await this.getAngularFilesUsingVsCode();
      console.log(
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
        console.log(
          `AngularIndexer (${path.basename(
            this.projectRootPath
          )}): Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(angularFiles.length / batchSize)}`
        );
      }

      console.log(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Indexed ${this.selectorTrie.size} elements.`
      );

      await this.indexNodeModules(context);

      await this.saveIndexToWorkspace(context);
      return new Map(this.selectorTrie.getAllElements().map((e) => [e.originalSelector, e]));
    } finally {
      this.isIndexing = false;
    }
  }

  loadFromWorkspace(context: vscode.ExtensionContext): boolean {
    if (!this.projectRootPath || !this.workspaceFileCacheKey || !this.workspaceIndexCacheKey) {
      console.error("AngularIndexer.loadFromWorkspace: projectRootPath or cache keys not set. Cannot load.");
      return false;
    }
    try {
      const storedCache = context.workspaceState.get<Record<string, FileElementsInfo | ComponentInfo>>(
        this.workspaceFileCacheKey
      );
      const storedIndex = context.workspaceState.get<Record<string, AngularElementData>>(this.workspaceIndexCacheKey);

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
            value.selectors || parseAngularSelector(value.originalSelector || key),
            value.isStandalone
          );
          // Index under all its selectors
          for (const selector of elementData.selectors) {
            this.selectorTrie.insert(selector, elementData);
          }
        }
        // Note: This does not repopulate the ts-morph Project.
        // A full scan or lazy loading of files into ts-morph Project is still needed if AST is required later.
        // For now, the index is used for lookups, and files are added to ts-morph Project on demand (e.g. during updateFileIndex or importElementToFile).
        console.log(
          `AngularIndexer (${path.basename(this.projectRootPath)}): Loaded ${
            this.selectorTrie.size
          } elements from workspace cache.`
        );
        return true;
      }
    } catch (error) {
      console.error(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Error loading index from workspace:`,
        error
      );
    }
    console.log(`AngularIndexer (${path.basename(this.projectRootPath)}): No valid cache found in workspace.`);
    return false;
  }

  private async saveIndexToWorkspace(context: vscode.ExtensionContext): Promise<void> {
    if (!this.projectRootPath || !this.workspaceFileCacheKey || !this.workspaceIndexCacheKey) {
      console.error("AngularIndexer.saveIndexToWorkspace: projectRootPath or cache keys not set. Cannot save.");
      return;
    }
    try {
      await context.workspaceState.update(this.workspaceFileCacheKey, Object.fromEntries(this.fileCache));

      const serializableTrie = Object.fromEntries(
        this.selectorTrie.getAllElements().map((el) => [el.originalSelector, el])
      );

      await context.workspaceState.update(this.workspaceIndexCacheKey, serializableTrie);
    } catch (error) {
      console.error(`AngularIndexer (${path.basename(this.projectRootPath)}): Error saving index to workspace:`, error);
    }
  }

  getElement(selector: string): AngularElementData | undefined {
    if (typeof selector !== "string" || !selector) {
      return undefined;
    }
    return this.selectorTrie.find(selector);
  }

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
            console.error("AngularIndexer.indexNodeModules: projectRootPath not set.");
            return;
          }
          progress.report({ message: "Finding Angular libraries..." });
          const angularDeps = await findAngularDependencies(this.projectRootPath);
          console.log(`[indexNodeModules] Found ${angularDeps.length} Angular dependencies.`);

          const totalDeps = angularDeps.length;
          let processedCount = 0;

          for (const dep of angularDeps) {
            processedCount++;
            progress.report({
              message: `Processing ${dep.name}... (${processedCount}/${totalDeps})`,
              increment: (1 / totalDeps) * 100,
            });

            const entryPoints = await getLibraryEntryPoints(dep);
            if (entryPoints.size === 0) continue;

            console.log(`[indexNodeModules] Found ${entryPoints.size} entry points for ${dep.name}`);

            for (const [importPath, filePath] of entryPoints.entries()) {
              await this.parseAndIndexDeclarationFile(importPath, filePath);
            }
          }
          await this.saveIndexToWorkspace(context);
          console.log(`[indexNodeModules] Finished indexing ${processedCount} libraries.`);
        } catch (error) {
          console.error("[indexNodeModules] Error during node_modules indexing:", error);
        }
      }
    );
  }

  private async parseAndIndexDeclarationFile(importPath: string, filePath: string): Promise<void> {
    try {
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      if (!sourceFile) return;

      const classDeclarations = new Map<string, ClassDeclaration>();

      // First, get all declarations exported from this file.
      // This will resolve re-exports and give us the actual class declarations from other files.
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

      // Also, include classes declared directly in this file, as they might be part of an NgModule
      // but not explicitly exported from the package's main entry point.
      for (const classDecl of sourceFile.getClasses()) {
        const name = classDecl.getName();
        if (name && !classDeclarations.has(name)) {
          classDeclarations.set(name, classDecl);
        }
      }

      const componentToModuleMap = new Map<string, { moduleName: string; importPath: string }>();

      // --- Pass 1: Find all NgModules and map their exports ---
      for (const classDecl of classDeclarations.values()) {
        const className = classDecl.getName();
        if (!className) continue;

        const modDef = classDecl.getStaticProperty("ɵmod");
        if (modDef && modDef.isKind(SyntaxKind.PropertyDeclaration)) {
          const typeNode = modDef.getTypeNode();
          if (typeNode?.isKind(SyntaxKind.TypeReference)) {
            const typeRef = typeNode as TypeReferenceNode;
            const typeArgs = typeRef.getTypeArguments();

            // The 'exports' array is the 4th type argument in ɵɵNgModuleDeclaration
            if (typeArgs.length > 3 && typeArgs[3].isKind(SyntaxKind.TupleType)) {
              const exportsTuple = typeArgs[3].asKindOrThrow(SyntaxKind.TupleType);
              for (const element of exportsTuple.getElements()) {
                let exportedClassName: string | undefined;

                if (element.isKind(SyntaxKind.TypeQuery)) {
                  // Handles both `() => import(...)` and `typeof MyComponent`
                  const typeQueryNode = element.asKindOrThrow(SyntaxKind.TypeQuery);
                  const exprName = typeQueryNode.getExprName();

                  if (exprName.isKind(SyntaxKind.Identifier)) {
                    // This covers `typeof MyComponent` where `exprName` is `MyComponent`
                    // and also direct references in some library formats.
                    exportedClassName = exprName.getText();
                  } else {
                    // This handles `() => import(...)`
                    exportedClassName = exprName.getText();
                  }
                } else if (element.isKind(SyntaxKind.TypeReference)) {
                  // Handles direct type references like `MyComponent`
                  exportedClassName = element.asKindOrThrow(SyntaxKind.TypeReference).getTypeName().getText();
                }

                if (exportedClassName) {
                  // Do not overwrite. First module found that exports a component 'wins'.
                  // This is a simple heuristic. A better approach might involve path analysis.
                  if (!componentToModuleMap.has(exportedClassName)) {
                    componentToModuleMap.set(exportedClassName, { moduleName: className, importPath });
                  }
                }
              }
            }
          }
        }
      }

      // --- Pass 2: Find all Components, Directives, and Pipes ---
      for (const classDecl of classDeclarations.values()) {
        const className = classDecl.getName();
        if (!className) continue;

        let elementType: "component" | "directive" | "pipe" | null = null;
        let selector: string | undefined;
        let isStandalone = false;

        const cmpDef = classDecl.getStaticProperty("ɵcmp");
        const dirDef = classDecl.getStaticProperty("ɵdir");
        const pipeDef = classDecl.getStaticProperty("ɵpipe");

        if (cmpDef && cmpDef.isKind(SyntaxKind.PropertyDeclaration)) {
          elementType = "component";
          const typeNode = cmpDef.getTypeNode();
          if (typeNode?.isKind(SyntaxKind.TypeReference)) {
            const typeRef = typeNode as TypeReferenceNode;
            const typeArgs = typeRef.getTypeArguments();
            // Selector is 2nd argument
            if (typeArgs.length > 1 && typeArgs[1].isKind(SyntaxKind.LiteralType)) {
              selector = (typeArgs[1] as LiteralTypeNode).getLiteral().getText().slice(1, -1);
            }
            // Standalone is the 8th argument in ɵɵComponentDeclaration
            if (typeArgs.length > 7) {
              const standaloneArg = typeArgs[7];
              if (standaloneArg.isKind(SyntaxKind.LiteralType)) {
                isStandalone = standaloneArg.getLiteral().isKind(SyntaxKind.TrueKeyword);
              }
            }
          }
        } else if (dirDef && dirDef.isKind(SyntaxKind.PropertyDeclaration)) {
          elementType = "directive";
          const typeNode = dirDef.getTypeNode();
          if (typeNode?.isKind(SyntaxKind.TypeReference)) {
            const typeRef = typeNode as TypeReferenceNode;
            const typeArgs = typeRef.getTypeArguments();
            if (typeArgs.length > 1 && typeArgs[1].isKind(SyntaxKind.LiteralType)) {
              selector = (typeArgs[1] as LiteralTypeNode).getLiteral().getText().slice(1, -1);
            }
            // Standalone is the 8th argument in ɵɵDirectiveDeclaration
            if (typeArgs.length > 7) {
              const standaloneArg = typeArgs[7];
              if (standaloneArg.isKind(SyntaxKind.LiteralType)) {
                isStandalone = standaloneArg.getLiteral().isKind(SyntaxKind.TrueKeyword);
              }
            }
          }
        } else if (pipeDef && pipeDef.isKind(SyntaxKind.PropertyDeclaration)) {
          elementType = "pipe";
          const typeNode = pipeDef.getTypeNode();
          if (typeNode?.isKind(SyntaxKind.TypeReference)) {
            const typeRef = typeNode as TypeReferenceNode;
            const typeArgs = typeRef.getTypeArguments();
            // Pipe name is 2nd argument
            if (typeArgs.length > 1 && typeArgs[1].isKind(SyntaxKind.LiteralType)) {
              selector = (typeArgs[1] as LiteralTypeNode).getLiteral().getText().slice(1, -1);
            }
            // Standalone is 3rd argument
            if (typeArgs.length > 2) {
              const standaloneArg = typeArgs[2];
              if (standaloneArg.isKind(SyntaxKind.LiteralType)) {
                isStandalone = standaloneArg.getLiteral().isKind(SyntaxKind.TrueKeyword);
              }
            }
          }
        }

        if (elementType && selector) {
          const exportingModule = componentToModuleMap.get(className);
          const individualSelectors = parseAngularSelector(selector);
          const elementData = new AngularElementData(
            // For standalone components, we must use the direct import path.
            // For non-standalone, we use the module's path if available.
            isStandalone ? importPath : exportingModule?.importPath || importPath,
            // If part of a module, we will need to import the module, not the component itself
            isStandalone ? className : exportingModule?.moduleName || className,
            elementType,
            selector,
            individualSelectors,
            isStandalone,
            isStandalone ? undefined : exportingModule?.moduleName
          );

          for (const sel of individualSelectors) {
            this.selectorTrie.insert(sel, elementData);
          }
          if (isStandalone) {
            console.log(
              `[NodeModulesIndexer] Indexed standalone ${elementType}: ${className} (${selector}) from ${importPath}`
            );
          } else if (exportingModule) {
            console.log(
              `[NodeModulesIndexer] Indexed non-standalone ${elementType}: ${className} (${selector}) via ${exportingModule.moduleName} from ${exportingModule.importPath}`
            );
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing declaration file ${filePath} from import ${importPath}:`, error);
    }
  }

  getAllSelectors(): string[] {
    return this.selectorTrie.getAllSelectors();
  }

  searchWithSelectors(prefix: string): { selector: string; element: AngularElementData }[] {
    return this.selectorTrie.searchWithSelectors(prefix);
  }

  private async getAngularFilesUsingVsCode(): Promise<string[]> {
    try {
      // Updated patterns to support uppercase letters in filenames
      const patterns = ["**/*[Cc]omponent.ts", "**/*[Dd]irective.ts", "**/*[Pp]ipe.ts"];
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
      console.error(`Error finding files using VS Code API: ${error}`);
      return this.getAngularFilesFallback(this.projectRootPath).map((relPath) =>
        path.join(this.projectRootPath, relPath)
      );
    }
  }

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
          } else if (entry.isFile() && /\.([Cc]omponent|[Dd]irective|[Pp]ipe)\.ts$/.test(entry.name)) {
            angularFiles.push(path.relative(basePath, fullPath));
          }
        }
      } catch (_err) {
        // console.warn(`Could not read directory ${currentDirPath}: ${err}`);
      }
    };
    if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
      traverseDirectory(basePath);
    }
    return angularFiles;
  }

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
