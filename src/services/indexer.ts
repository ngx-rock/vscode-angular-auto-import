/**
 * Angular Indexer Service
 * Responsible for indexing Angular components, directives, and pipes.
 */

import * as fs from "fs";
import * as path from "path";
import {
  ClassDeclaration,
  Decorator,
  ObjectLiteralExpression,
  Project,
  PropertyAssignment,
  StringLiteral,
  SyntaxKind,
} from "ts-morph";
import * as vscode from "vscode";
import { AngularElementData, ComponentInfo, FileElementsInfo } from "../types";
import { parseAngularSelector } from "../utils";

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
      currentNode = currentNode.children.get(char)!;
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
      currentNode = currentNode.children.get(char)!;
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
        currentNode = currentNode.children.get(char)!;
    }
    return currentNode.elements.length > 0 ? currentNode.elements[0] : undefined;
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
      currentNode = currentNode.children.get(char)!;
    }
    // Remove the element if it matches the path
    currentNode.elements = currentNode.elements.filter(el => path.resolve(el.path) !== path.resolve(elementPath));
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

  private collectAllElementsWithSelectors(node: TrieNode, currentSelector: string): { selector: string; element: AngularElementData }[] {
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

    const projectHash = this.generateHash(projectPath).replace(
      /[^a-zA-Z0-9_]/g,
      ""
    );
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
      console.error(
        "AngularIndexer: Cannot initialize watcher, projectRootPath not set."
      );
      return;
    }

    // Updated pattern to support uppercase letters in filenames
    const pattern = new vscode.RelativePattern(
      this.projectRootPath,
      "**/*{[Cc]omponent,[Dd]irective,[Pp]ipe}.ts"
    );
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.fileWatcher.onDidCreate(async (uri) => {
      console.log(
        `Watcher (${path.basename(this.projectRootPath)}): File created: ${
          uri.fsPath
        }`
      );
      await this.updateFileIndex(uri.fsPath, context);
    });

    this.fileWatcher.onDidChange(async (uri) => {
      console.log(
        `Watcher (${path.basename(this.projectRootPath)}): File changed: ${
          uri.fsPath
        }`
      );
      await this.updateFileIndex(uri.fsPath, context);
    });

    this.fileWatcher.onDidDelete(async (uri) => {
      console.log(
        `Watcher (${path.basename(this.projectRootPath)}): File deleted: ${
          uri.fsPath
        }`
      );
      await this.removeFromIndex(uri.fsPath, context);
      // Also remove from ts-morph project
      const sourceFile = this.project.getSourceFile(uri.fsPath);
      if (sourceFile) {
        this.project.removeSourceFile(sourceFile);
      }
    });

    context.subscriptions.push(this.fileWatcher);
    console.log(
      `AngularIndexer: File watcher initialized for ${this.projectRootPath} with pattern ${pattern.pattern}`
    );
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

  private parseAngularElementsWithTsMorph(
    filePath: string,
    content: string
  ): ComponentInfo[] {
    if (!this.projectRootPath) {
      console.error(
        "AngularIndexer.parseAngularElementsWithTsMorph: projectRootPath is not set."
      );
      const fallbackResult = this.parseAngularElementWithRegex(
        filePath,
        content
      );
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
        const elementInfo = this.extractAngularElementInfo(
          classDeclaration,
          filePath,
          content
        ); // content passed for hash
        if (elementInfo) {
          elements.push(elementInfo);
        }
      }

      // If no Angular elements found by ts-morph, try regex as a fallback
      if (elements.length === 0) {
        const fallbackResult = this.parseAngularElementWithRegex(
          filePath,
          content
        );
        if (fallbackResult) {
          elements.push(fallbackResult);
        }
      }

      return elements;
    } catch (error) {
      console.error(
        `ts-morph parsing error for ${filePath} in project ${this.projectRootPath}:`,
        error
      );
      const fallbackResult = this.parseAngularElementWithRegex(
        filePath,
        content
      );
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

      switch (decoratorName) {
        case "Component":
          elementType = "component";
          selector = this.extractSelectorFromDecorator(decorator);
          break;
        case "Directive":
          elementType = "directive";
          selector = this.extractSelectorFromDecorator(decorator);
          break;
        case "Pipe":
          elementType = "pipe";
          selector = this.extractPipeNameFromDecorator(decorator);
          break;
      }

      if (elementType && selector) {
        return {
          path: path.relative(this.projectRootPath, filePath),
          name: className,
          selector,
          lastModified: fs.statSync(filePath).mtime.getTime(), // Ok, but content hash is better
          hash: this.generateHash(fileContent), // Use content for hash
          type: elementType,
        };
      }
    }
    return null;
  }

  private extractSelectorFromDecorator(
    decorator: Decorator
  ): string | undefined {
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

      if (
        selectorProperty &&
        selectorProperty.isKind(SyntaxKind.PropertyAssignment)
      ) {
        const propertyAssignment = selectorProperty as PropertyAssignment;
        const initializer = propertyAssignment.getInitializer();

        if (initializer && initializer.isKind(SyntaxKind.StringLiteral)) {
          return (initializer as StringLiteral).getLiteralText();
        }
      }
    } catch (error) {
      console.error("Error extracting selector from decorator:", error);
    }
    return undefined;
  }

  private extractPipeNameFromDecorator(
    decorator: Decorator
  ): string | undefined {
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

      if (nameProperty && nameProperty.isKind(SyntaxKind.PropertyAssignment)) {
        const propertyAssignment = nameProperty as PropertyAssignment;
        const initializer = propertyAssignment.getInitializer();

        if (initializer && initializer.isKind(SyntaxKind.StringLiteral)) {
          return (initializer as StringLiteral).getLiteralText();
        }
      }
    } catch (error) {
      console.error("Error extracting pipe name from decorator:", error);
    }
    return undefined;
  }

  private parseAngularElementWithRegex(
    filePath: string,
    content: string
  ): ComponentInfo | null {
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
    } else if (
      fileName.includes(".directive.") ||
      fileName.includes(".Directive.")
    ) {
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
        path: this.projectRootPath
          ? path.relative(this.projectRootPath, filePath)
          : filePath,
        name: classNameMatch[1],
        selector,
        lastModified: fs.statSync(filePath).mtime.getTime(),
        hash: this.generateHash(content),
        type: elementType,
      };
    }
    return null;
  }

  private async updateFileIndex(
    filePath: string,
    context: vscode.ExtensionContext
  ): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(
          `File not found, cannot update index: ${filePath} for project ${this.projectRootPath}`
        );
        return;
      }
      if (!this.projectRootPath) {
        console.error(
          `AngularIndexer.updateFileIndex: projectRootPath not set for ${filePath}. Aborting update.`
        );
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

      if (
        cachedFile &&
        cachedFile.lastModified >= lastModified &&
        cachedFile.hash === hash
      ) {
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

      const parsedElements = this.parseAngularElementsWithTsMorph(
        filePath,
        content
      );

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
            individualSelectors
          );

          // Index the element under each individual selector
          for (const selector of individualSelectors) {
            this.selectorTrie.insert(selector, elementData);
            console.log(
              `Updated index for ${this.projectRootPath}: ${selector} (${parsed.type}) -> ${parsed.path}`
            );
          }
        });
      } else {
        // Parsing failed or not an Angular element - remove from file cache and trie
        this.fileCache.delete(filePath);
        const sourceFile = this.project.getSourceFile(filePath);
        if (sourceFile) {
          this.project.removeSourceFile(sourceFile); // or sourceFile.forget()
        }
        console.log(
          `No Angular elements found in ${filePath} for ${this.projectRootPath}`
        );
      }
      await this.saveIndexToWorkspace(context);
    } catch (error) {
      console.error(
        `Error updating index for ${filePath} in project ${this.projectRootPath}:`,
        error
      );
    }
  }

  private async removeFromIndex(
    filePath: string,
    context: vscode.ExtensionContext
  ): Promise<void> {
    // Remove from file cache
    const fileInfo = this.fileCache.get(filePath);
    if (fileInfo) {
      for (const element of fileInfo.elements) {
        const individualSelectors = parseAngularSelector(element.selector);
        for (const selector of individualSelectors) {
          this.selectorTrie.remove(selector, filePath);
          console.log(
            `Removed from index for ${this.projectRootPath}: ${selector} from ${filePath}`
          );
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

  async generateFullIndex(
    context: vscode.ExtensionContext
  ): Promise<Map<string, AngularElementData>> {
    if (this.isIndexing) {
      console.log(
        `AngularIndexer (${path.basename(
          this.projectRootPath
        )}): Already indexing, skipping...`
      );
      return new Map(this.selectorTrie.getAllElements().map(e => [e.originalSelector, e]));
    }

    this.isIndexing = true;
    try {
      console.log(
        `AngularIndexer (${path.basename(
          this.projectRootPath
        )}): Starting full index generation...`
      );
      if (!this.projectRootPath) {
        console.error(
          "AngularIndexer.generateFullIndex: projectRootPath not set. Aborting."
        );
        return new Map();
      }

      // Clear existing ts-morph project files before full scan to avoid stale data
      this.project
        .getSourceFiles()
        .forEach((sf) => this.project.removeSourceFile(sf));
      this.fileCache.clear();
      this.selectorTrie.clear();

      const angularFiles = await this.getAngularFilesUsingVSCode();
      console.log(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Found ${
          angularFiles.length
        } Angular files.`
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
          )}): Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            angularFiles.length / batchSize
          )}`
        );
      }

      console.log(
        `AngularIndexer (${path.basename(this.projectRootPath)}): Indexed ${
          this.selectorTrie.size
        } elements.`
      );
      await this.saveIndexToWorkspace(context);
      return new Map(this.selectorTrie.getAllElements().map(e => [e.originalSelector, e]));
    } finally {
      this.isIndexing = false;
    }
  }

  loadFromWorkspace(context: vscode.ExtensionContext): boolean {
    if (
      !this.projectRootPath ||
      !this.workspaceFileCacheKey ||
      !this.workspaceIndexCacheKey
    ) {
      console.error(
        "AngularIndexer.loadFromWorkspace: projectRootPath or cache keys not set. Cannot load."
      );
      return false;
    }
    try {
      const storedCache = context.workspaceState.get<
        Record<string, FileElementsInfo | ComponentInfo>
      >(this.workspaceFileCacheKey);
      const storedIndex = context.workspaceState.get<
        Record<string, AngularElementData>
      >(this.workspaceIndexCacheKey);

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
            value.selectors || parseAngularSelector(value.originalSelector || key)
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
        `AngularIndexer (${path.basename(
          this.projectRootPath
        )}): Error loading index from workspace:`,
        error
      );
    }
    console.log(
      `AngularIndexer (${path.basename(
        this.projectRootPath
      )}): No valid cache found in workspace.`
    );
    return false;
  }

  private async saveIndexToWorkspace(
    context: vscode.ExtensionContext
  ): Promise<void> {
    if (
      !this.projectRootPath ||
      !this.workspaceFileCacheKey ||
      !this.workspaceIndexCacheKey
    ) {
      console.error(
        "AngularIndexer.saveIndexToWorkspace: projectRootPath or cache keys not set. Cannot save."
      );
      return;
    }
    try {
      await context.workspaceState.update(
        this.workspaceFileCacheKey,
        Object.fromEntries(this.fileCache)
      );

      const serializableTrie = Object.fromEntries(this.selectorTrie.getAllElements().map(el => [el.originalSelector, el]));

      await context.workspaceState.update(
        this.workspaceIndexCacheKey,
        serializableTrie
      );
    } catch (error) {
      console.error(
        `AngularIndexer (${path.basename(
          this.projectRootPath
        )}): Error saving index to workspace:`,
        error
      );
    }
  }

  getElement(selector: string): AngularElementData | undefined {
    if (typeof selector !== 'string' || !selector) {
      return undefined;
    }
    return this.selectorTrie.find(selector);
  }

  getAllSelectors(): string[] {
    return this.selectorTrie.getAllSelectors();
  }

  searchWithSelectors(prefix: string): { selector: string; element: AngularElementData }[] {
    return this.selectorTrie.searchWithSelectors(prefix);
  }

  private async getAngularFilesUsingVSCode(): Promise<string[]> {
    try {
      // Updated patterns to support uppercase letters in filenames
      const patterns = [
        "**/*[Cc]omponent.ts",
        "**/*[Dd]irective.ts",
        "**/*[Pp]ipe.ts",
      ];
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
          } else if (
            entry.isFile() &&
            /\.([Cc]omponent|[Dd]irective|[Pp]ipe)\.ts$/.test(entry.name)
          ) {
            angularFiles.push(path.relative(basePath, fullPath));
          }
        }
      } catch (err) {
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
    this.project
      .getSourceFiles()
      .forEach((sf) => this.project.removeSourceFile(sf));
  }
}
