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

export class AngularIndexer {
  project: Project; // Made public for access in importElementToFile
  private fileCache: Map<string, FileElementsInfo> = new Map();
  private selectorToElement: Map<string, AngularElementData> = new Map();
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
      const cached = this.fileCache.get(filePath);

      // Read content once
      const content = fs.readFileSync(filePath, "utf-8");
      const hash = this.generateHash(content);

      if (
        cached &&
        cached.lastModified >= lastModified &&
        cached.hash === hash
      ) {
        // If modification time is same or older, and hash is same, no need to parse
        // Update lastModified just in case it was touched without content change
        if (cached.lastModified < lastModified) {
          const updatedCache: FileElementsInfo = {
            ...cached,
            lastModified: lastModified,
          };
          this.fileCache.set(filePath, updatedCache);
        }
        return;
      }

      const parsedElements = this.parseAngularElementsWithTsMorph(
        filePath,
        content
      );

      // Remove all existing entries from this file from the selector index
      const elementsToRemove: string[] = [];
      for (const [selector, elementData] of this.selectorToElement.entries()) {
        if (path.resolve(this.projectRootPath, elementData.path) === filePath) {
          elementsToRemove.push(selector);
        }
      }
      elementsToRemove.forEach((selector) =>
        this.selectorToElement.delete(selector)
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
            this.selectorToElement.set(selector, elementData);
            console.log(
              `Updated index for ${this.projectRootPath}: ${selector} (${parsed.type}) -> ${parsed.path}`
            );
          }
        });
      } else {
        // Parsing failed or not an Angular element - remove from file cache
        this.fileCache.delete(filePath);

        // Also remove from ts-morph project if it was there
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
    this.fileCache.delete(filePath);

    // Remove all elements from this file from the selector index
    const elementsToRemove: string[] = [];
    for (const [selector, elementData] of this.selectorToElement.entries()) {
      if (path.resolve(this.projectRootPath, elementData.path) === filePath) {
        elementsToRemove.push(selector);
      }
    }

    elementsToRemove.forEach((selector) => {
      this.selectorToElement.delete(selector);
      console.log(
        `Removed from index for ${this.projectRootPath}: ${selector} from ${filePath}`
      );
    });

    // Remove from ts-morph project
    const sourceFile = this.project.getSourceFile(filePath);
    if (sourceFile) {
      this.project.removeSourceFile(sourceFile);
    }

    if (elementsToRemove.length > 0) {
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
      return this.selectorToElement;
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
      this.selectorToElement.clear();

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
          this.selectorToElement.size
        } elements.`
      );
      await this.saveIndexToWorkspace(context);
      return this.selectorToElement;
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

        this.selectorToElement = new Map(
          Object.entries(storedIndex).map(([key, value]) => [
            key,
            new AngularElementData(
              value.path,
              value.name,
              value.type,
              value.originalSelector || key, // Use originalSelector if available, fallback to key
              value.selectors ||
                parseAngularSelector(value.originalSelector || key)
            ),
          ])
        );
        // Note: This does not repopulate the ts-morph Project.
        // A full scan or lazy loading of files into ts-morph Project is still needed if AST is required later.
        // For now, the index is used for lookups, and files are added to ts-morph Project on demand (e.g. during updateFileIndex or importElementToFile).
        console.log(
          `AngularIndexer (${path.basename(this.projectRootPath)}): Loaded ${
            this.selectorToElement.size
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
      await context.workspaceState.update(
        this.workspaceIndexCacheKey,
        Object.fromEntries(this.selectorToElement)
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
    return this.selectorToElement.get(selector);
  }

  getAllSelectors(): IterableIterator<string> {
    return this.selectorToElement.keys();
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
    this.selectorToElement.clear();
    // Note: Should we dispose the ts-morph Project as well? It doesn't have a dispose method, but we can clear its files
    this.project
      .getSourceFiles()
      .forEach((sf) => this.project.removeSourceFile(sf));
  }
}
