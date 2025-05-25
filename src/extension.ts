import * as vscode from 'vscode';
import { CompletionItem } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Tree-sitter imports
import Parser from 'tree-sitter';

const TypeScript = require('tree-sitter-typescript').typescript;

interface ComponentInfo {
  path: string;
  name: string;
  selector: string;
  lastModified: number;
  hash: string;
  type: 'component' | 'directive' | 'pipe';
}

class AngularElementData {
  path: string;
  name: string;
  type: 'component' | 'directive' | 'pipe';

  constructor(path: string, name: string, type: 'component' | 'directive' | 'pipe') {
    this.path = path;
    this.name = name;
    this.type = type;
  }
}

// Enhanced caching and indexing
class AngularIndexer {
  private parser: Parser; // Typed Parser
  private fileCache: Map<string, ComponentInfo> = new Map();
  private selectorToElement: Map<string, AngularElementData> = new Map();
  private fileWatcher: vscode.FileSystemWatcher | null = null;
  private projectRootPath: string = ''; // Store project root path

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript);
  }

  public setProjectRoot(projectPath: string) {
    this.projectRootPath = projectPath;
  }

  /**
   * Initialize file watcher for incremental updates
   */
  initializeWatcher(context: vscode.ExtensionContext, projectPath: string) {
    // Clean up existing watcher
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
    // Ensure projectRootPath is set if not already
    if (!this.projectRootPath) {
      this.projectRootPath = projectPath;
    }

    // Watch for Angular file changes (components, directives, pipes)
    const pattern = new vscode.RelativePattern(projectPath, '**/*.{component,directive,pipe}.ts');
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.fileWatcher.onDidCreate((uri) => {
      console.log(`File created: ${uri.fsPath}`);
      this.updateFileIndex(uri.fsPath, context); // projectPath removed, uses this.projectRootPath
    });

    this.fileWatcher.onDidChange((uri) => {
      console.log(`File changed: ${uri.fsPath}`);
      this.updateFileIndex(uri.fsPath, context); // projectPath removed, uses this.projectRootPath
    });

    this.fileWatcher.onDidDelete((uri) => {
      console.log(`File deleted: ${uri.fsPath}`);
      this.removeFromIndex(uri.fsPath, context);
    });

    context.subscriptions.push(this.fileWatcher);
  }

  /**
   * Generate hash for file content to detect changes
   */
  private generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Parse Angular element using Tree-sitter
   */
  private parseAngularElementWithTreeSitter(filePath: string, content: string): ComponentInfo | null {
    if (!this.projectRootPath) {
      console.error("AngularIndexer.projectRootPath is not set. Cannot determine relative path.");
      // Attempt to use a fallback or simply return null if critical
      // For now, let's assume it should have been set by `activate`
      // If this error occurs, it's a bug in the initialization sequence.
      return this.parseAngularElementWithRegex(filePath, content); // Fallback or could throw
    }
    try {
      const tree = this.parser.parse(content);
      const rootNode = tree.rootNode;
      let foundElement: ComponentInfo | null = null;

      const findClassInfo = (classNode: Parser.SyntaxNode): ComponentInfo | null => {
        let elementName: string | undefined;
        let isExported = false;

        // Check for export: export class MyClass ...
        // For `export class X {}`, class_declaration is typically a child of export_statement.
        if (classNode.parent && classNode.parent.type === 'export_statement') {
          // Check if this class_declaration is the main declaration of the export_statement
          // This handles `export class Foo {}` and `export default class Foo {}`
          if (classNode.parent.childForFieldName('declaration') === classNode ||
              classNode.parent.children.some(child => child === classNode)) { // General check
            isExported = true;
          }
        }

        const nameIdentifier = classNode.childForFieldName('name');
        if (nameIdentifier && nameIdentifier.type === 'identifier') {
          elementName = content.slice(nameIdentifier.startIndex, nameIdentifier.endIndex);
        }

        if (!isExported || !elementName) return null;

        let selector: string | undefined;
        let elementType: 'component' | 'directive' | 'pipe' | undefined;
        let pipeNameValue: string | undefined;

        const decorators = classNode.children.filter(child => child.type === 'decorator');

        for (const decoratorNode of decorators) {
          const callExprNode = decoratorNode.firstChild; // Decorator is @Expr or @Expr()
          if (callExprNode && callExprNode.type === 'call_expression') {
            const funcIdentNode = callExprNode.childForFieldName('function');
            if (funcIdentNode && funcIdentNode.type === 'identifier') {
              const decoratorName = content.slice(funcIdentNode.startIndex, funcIdentNode.endIndex);

              if (decoratorName === 'Component') {
                elementType = 'component';
                selector = this.extractSelectorFromDecorator(callExprNode, content);
                break;
              } else if (decoratorName === 'Directive') {
                elementType = 'directive';
                selector = this.extractSelectorFromDecorator(callExprNode, content);
                break;
              } else if (decoratorName === 'Pipe') {
                elementType = 'pipe';
                pipeNameValue = this.extractPipeNameFromDecorator(callExprNode, content);
                break;
              }
            }
          }
        }

        if (elementName && elementType) {
          const finalSelector = elementType === 'pipe' ? pipeNameValue : selector;
          if (finalSelector) {
            return {
              path: path.relative(this.projectRootPath, filePath),
              name: elementName,
              selector: finalSelector,
              lastModified: fs.statSync(filePath).mtime.getTime(),
              hash: this.generateHash(content),
              type: elementType
            };
          }
        }
        return null;
      };

      this.traverseNode(rootNode, (node) => {
        if (foundElement) return; // Optimization: assume one main Angular element per file

        if (node.type === 'class_declaration') {
          const info = findClassInfo(node);
          if (info) {
            foundElement = info;
          }
        }
      });

      return foundElement;
    } catch (error) {
      console.error(`Tree-sitter parsing error for ${filePath}:`, error);
      return this.parseAngularElementWithRegex(filePath, content); // Fallback to regex
    }
  }

  /**
   * Extract selector from @Component or @Directive decorator
   */
  private extractSelectorFromDecorator(decoratorCallExpressionNode: Parser.SyntaxNode, content: string): string | undefined {
    const argsNode = decoratorCallExpressionNode.childForFieldName('arguments');
    if (argsNode) {
      // Arguments node is typically a parenthesized list, its first significant child is the object literal
      const objectNode = argsNode.children.find((child: Parser.SyntaxNode) => child.type === 'object');
      if (objectNode) {
        for (const propNode of objectNode.children) {
          if (propNode.type === 'property_assignment') { // In some grammars 'pair'
            const nameNode = propNode.childForFieldName('key') || propNode.children.find(c => c.type === 'property_identifier');
            const valueNode = propNode.childForFieldName('value') || propNode.children.find(c => c.type === 'string');

            if (nameNode && valueNode && nameNode.type === 'property_identifier' && valueNode.type === 'string') {
              const propName = content.slice(nameNode.startIndex, nameNode.endIndex);
              if (propName === 'selector') {
                const selectorValue = content.slice(valueNode.startIndex, valueNode.endIndex);
                return selectorValue.slice(1, -1); // Remove quotes
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Extract name from @Pipe decorator
   */
  private extractPipeNameFromDecorator(decoratorCallExpressionNode: Parser.SyntaxNode, content: string): string | undefined {
    const argsNode = decoratorCallExpressionNode.childForFieldName('arguments');
    if (argsNode) {
      const objectNode = argsNode.children.find((child: Parser.SyntaxNode) => child.type === 'object');
      if (objectNode) {
        for (const propNode of objectNode.children) {
          if (propNode.type === 'property_assignment') { // In some grammars 'pair'
            const nameNode = propNode.childForFieldName('key') || propNode.children.find(c => c.type === 'property_identifier');
            const valueNode = propNode.childForFieldName('value') || propNode.children.find(c => c.type === 'string');

            if (nameNode && valueNode && nameNode.type === 'property_identifier' && valueNode.type === 'string') {
              const propName = content.slice(nameNode.startIndex, nameNode.endIndex);
              if (propName === 'name') {
                const nameValue = content.slice(valueNode.startIndex, valueNode.endIndex);
                return nameValue.slice(1, -1); // Remove quotes
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Fallback regex parsing
   */
  private parseAngularElementWithRegex(filePath: string, content: string): ComponentInfo | null {
    if (!this.projectRootPath) {
      console.error("AngularIndexer.projectRootPath is not set for regex parsing.");
      return null; // Cannot determine relative path
    }
    const selectorRegex = /selector:\s*['"]([^'"]*)['"]/;
    const pipeNameRegex = /name:\s*['"]([^'"]*)['"]/;
    const classNameRegex = /export\s+class\s+(\w+)/;

    const fileName = path.basename(filePath);
    let elementType: 'component' | 'directive' | 'pipe';

    if (fileName.includes('.component.')) {
      elementType = 'component';
    } else if (fileName.includes('.directive.')) {
      elementType = 'directive';
    } else if (fileName.includes('.pipe.')) {
      elementType = 'pipe';
    } else {
      return null;
    }

    const classNameMatch = classNameRegex.exec(content);
    if (!classNameMatch?.[1]) {
      return null;
    }

    let selector: string | undefined;
    if (elementType === 'pipe') {
      const pipeNameMatch = pipeNameRegex.exec(content);
      selector = pipeNameMatch?.[1];
    } else {
      const selectorMatch = selectorRegex.exec(content);
      selector = selectorMatch?.[1];
    }

    if (selector) {
      return {
        path: path.relative(this.projectRootPath, filePath),
        name: classNameMatch[1],
        selector,
        lastModified: fs.statSync(filePath).mtime.getTime(),
        hash: this.generateHash(content),
        type: elementType
      };
    }

    return null;
  }

  /**
   * Traverse Tree-sitter node recursively
   */
  private traverseNode(node: Parser.SyntaxNode, callback: (node: Parser.SyntaxNode) => void) {
    callback(node);
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) { // Ensure child is not null
        this.traverseNode(child, callback);
      }
    }
  }

  /**
   * Update index for a single file
   */
  private async updateFileIndex(filePath: string, context: vscode.ExtensionContext): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }
      if (!this.projectRootPath) {
        console.warn(`Project root path not set in AngularIndexer, cannot update index for ${filePath}`);
        // Attempt to set it if global projectPath is available, otherwise this file can't be processed correctly.
        // This situation should ideally be avoided by proper initialization.
        const currentGlobalProjectPath = getGlobalProjectPath(); // Helper to get the global var if available
        if (currentGlobalProjectPath) {
          this.setProjectRoot(currentGlobalProjectPath);
        } else {
          return;
        }
      }


      const stats = fs.statSync(filePath);
      const lastModified = stats.mtime.getTime();

      const cached = this.fileCache.get(filePath);
      if (cached && cached.lastModified >= lastModified) {
        return;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const hash = this.generateHash(content);

      if (cached && cached.hash === hash) {
        // Update lastModified even if hash is same, to prevent re-reading file
        this.fileCache.set(filePath, { ...cached, lastModified });
        return;
      }

      const parsed = this.parseAngularElementWithTreeSitter(filePath, content);

      if (parsed) {
        if (cached) {
          this.selectorToElement.delete(cached.selector);
        }

        this.fileCache.set(filePath, parsed);
        this.selectorToElement.set(parsed.selector, new AngularElementData(parsed.path, parsed.name, parsed.type));

        console.log(`Updated index for: ${parsed.path} -> ${parsed.selector} (${parsed.type})`);
      } else {
        if (cached) {
          this.fileCache.delete(filePath);
          this.selectorToElement.delete(cached.selector);
        }
      }
      await this.saveIndexToWorkspace(context);

    } catch (error) {
      console.error(`Error updating index for ${filePath}:`, error);
    }
  }

  /**
   * Remove file from index
   */
  private async removeFromIndex(filePath: string, context: vscode.ExtensionContext): Promise<void> {
    const cached = this.fileCache.get(filePath);
    if (cached) {
      this.fileCache.delete(filePath);
      this.selectorToElement.delete(cached.selector);
      await this.saveIndexToWorkspace(context);
      console.log(`Removed from index: ${filePath}`);
    }
  }

  /**
   * Initial full index generation
   */
  async generateFullIndex(projectPath: string, context: vscode.ExtensionContext): Promise<Map<string, AngularElementData>> {
    console.log('INDEXING Angular elements with Tree-sitter...');
    this.setProjectRoot(projectPath); // Ensure project root is set

    const angularFiles = this.getAngularFiles(projectPath);

    const batchSize = 10;
    for (let i = 0; i < angularFiles.length; i += batchSize) {
      const batch = angularFiles.slice(i, i + batchSize);
      // Pass context for each updateFileIndex call
      const batchTasks = batch.map(file =>
          this.updateFileIndex(path.join(projectPath, file), context)
      );
      await Promise.all(batchTasks);
    }

    console.log(`Indexed ${this.selectorToElement.size} Angular elements using Tree-sitter`);
    await this.saveIndexToWorkspace(context); // Save once after full index
    return this.selectorToElement;
  }

  loadFromWorkspace(context: vscode.ExtensionContext): boolean {
    try {
      const storedCache = context.workspaceState.get<Record<string, ComponentInfo>>('angularFileCache');
      const storedIndex = context.workspaceState.get<Record<string, AngularElementData>>('angularSelectorToDataIndex');

      if (storedCache && storedIndex) {
        this.fileCache = new Map(Object.entries(storedCache));
        this.selectorToElement = new Map(Object.entries(storedIndex).map(([key, value]) => [
          key,
          new AngularElementData(value.path, value.name, value.type)
        ]));
        console.log(`Loaded ${this.selectorToElement.size} Angular elements from cache`);
        return true;
      }
    } catch (error) {
      console.error('Error loading index from workspace:', error);
    }
    return false;
  }

  private async saveIndexToWorkspace(context: vscode.ExtensionContext): Promise<void> {
    try {
      await context.workspaceState.update('angularFileCache', Object.fromEntries(this.fileCache));
      await context.workspaceState.update('angularSelectorToDataIndex', Object.fromEntries(this.selectorToElement));
    } catch (error) {
      console.error('Error saving index to workspace:', error);
    }
  }

  getElement(selector: string): AngularElementData | undefined {
    return this.selectorToElement.get(selector);
  }

  getAllSelectors(): IterableIterator<string> {
    return this.selectorToElement.keys();
  }

  private getAngularFiles(basePath: string): string[] { // Renamed filePath to basePath for clarity
    const angularFiles: string[] = [];

    const isGitIgnored = (fileName: string, gitIgnorePath: string): boolean => {
      if (!fs.existsSync(gitIgnorePath)) return false;
      try {
        const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
        const gitIgnorePatterns = gitIgnoreContent.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));

        return gitIgnorePatterns.some((pattern) => {
          try {
            // Basic glob to regex: needs improvement for complex patterns
            // Consider using a library like 'micromatch' for robust .gitignore parsing
            const normalizedPattern = pattern.startsWith('/') ? pattern.substring(1) : `**/${pattern}`;
            const regexp = new RegExp(
                '^' +
                normalizedPattern
                    .replace(/\./g, '\\.') // Escape dots
                    .replace(/\*\*/g, '(.+)?') // Match **
                    .replace(/\*/g, '[^/]*') // Match *
                    .replace(/\?/g, '[^/]') + // Match ?
                '$'
            );
            return regexp.test(fileName);
          } catch (e) {
            // console.warn(`Invalid gitignore pattern: ${pattern}`, e);
            return false;
          }
        });
      } catch {
        return false;
      }
    };

    const traverseDirectory = (currentDirPath: string) => {
      try {
        const files = fs.readdirSync(currentDirPath);
        const gitIgnorePath = path.join(basePath, '.gitignore'); // .gitignore is usually at project root

        files.forEach((file) => {
          const fullPath = path.join(currentDirPath, file);
          const relativePathToRoot = path.relative(basePath, fullPath); // Relative to project root for gitignore

          if (isGitIgnored(relativePathToRoot, gitIgnorePath)) {
            return;
          }

          try {
            if (fs.statSync(fullPath).isDirectory()) {
              if (!['node_modules', '.git', 'dist', 'build', 'out', '.vscode'].includes(file)) {
                traverseDirectory(fullPath);
              }
            } else if (file.match(/\.(component|directive|pipe)\.ts$/)) {
              angularFiles.push(relativePathToRoot); // Store path relative to basePath
            }
          } catch (error) {
            // console.warn(`Error processing file/directory ${fullPath}:`, error);
          }
        });
      } catch (error) {
        // console.warn(`Error reading directory ${currentDirPath}:`, error);
      }
    };

    if (fs.existsSync(basePath)) {
      try {
        const stats = fs.statSync(basePath);
        if (stats.isDirectory()) {
          traverseDirectory(basePath);
        } else if (basePath.match(/\.(component|directive|pipe)\.ts$/)) {
          angularFiles.push(path.basename(basePath)); // If basePath is a file itself
        }
      } catch (error) {
        console.error(`Error processing path ${basePath}:`, error);
      }
    }

    console.log(`Found ${angularFiles.length} Angular files.`);
    return angularFiles;
  }

  dispose() {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
  }
}

// State
let angularIndexer: AngularIndexer;
let interval: NodeJS.Timeout | undefined; // Typed interval

// Config
let reindexInterval: number = 60;
let currentProjectPath: string | undefined; // Renamed from projectPath to avoid confusion with local vars

// Helper to access the global project path, primarily for updateFileIndex fallback
function getGlobalProjectPath(): string | undefined {
  return currentProjectPath;
}

function getConfiguration() {
  const config = vscode.workspace.getConfiguration('angular-auto-import');
  reindexInterval = config.get('index.refreshInterval', 60); // Corrected config key
  return config;
}

function getRelativeFilePath(fromFile: string, toFileNoExt: string): string {
  const relative = path.relative(path.dirname(fromFile), toFileNoExt);
  // Ensure it's a relative path for import statements
  return relative.startsWith('.') ? relative : `./${relative}`;
}

function importElementToFile(element: AngularElementData, componentFilePath: string): boolean {
  try {
    if (!currentProjectPath) {
      vscode.window.showErrorMessage('Project path is not defined. Cannot import element.');
      return false;
    }
    // element.path is relative to project root, e.g., "src/app/my.component.ts"
    // switchFileType removes the extension: "src/app/my.component"
    const targetModulePathNoExt = path.join(currentProjectPath, switchFileType(element.path, ''));
    const relativeImportPath = getRelativeFilePath(componentFilePath, targetModulePathNoExt);

    let importStr = `import { ${element.name} } from '${relativeImportPath}';\n`;

    const fileContents = fs.readFileSync(componentFilePath, 'utf-8');

    const importRegex = new RegExp(`import\\s*{[^}]*\\b${element.name}\\b[^}]*}\\s*from\\s*['"]${relativeImportPath}['"]`, 'g');
    const simplerImportRegex = new RegExp(`import\\s*{[^}]*\\b${element.name}\\b[^}]*}\\s*from`); // More generic check

    if (simplerImportRegex.test(fileContents)) {
      console.log(`${element.name} seems to be already imported or a class with the same name is imported.`);
      // Check if it needs to be added to @Component imports anyway
      const newFileContentsWithAnnotation = addImportToAnnotation(element, fileContents);
      if (newFileContentsWithAnnotation !== fileContents) {
        fs.writeFileSync(componentFilePath, newFileContentsWithAnnotation);
        setTimeout(() => vscode.commands.executeCommand('editor.action.formatDocument') , 100);
        return true; // Modified annotations
      }
      return true; // Already imported
    }

    let newFileContents = importStr + fileContents;
    newFileContents = addImportToAnnotation(element, newFileContents);

    fs.writeFileSync(componentFilePath, newFileContents);

    setTimeout(() => vscode.commands.executeCommand('editor.action.formatDocument') , 100);

    return true;
  } catch (e) {
    console.error('Error importing element:', e);
    return false;
  }
}

function addImportToAnnotation(element: AngularElementData, fileContents: string): string {
  // Only add to imports array if it's a Component or Directive (or Module, if supported later)
  if (element.type === 'pipe') {
    return fileContents; // Pipes are typically not added to `imports` array of @Component
  }

  const importRegex = /(@Component\(\s*{[\s\S]*?imports:\s*\[)([^\]]*?)(\][\s\S]*?}\))/;
  const componentDecoratorRegex = /@Component\(\s*{/; // To find where to insert `imports`

  if (importRegex.test(fileContents)) {
    return fileContents.replace(importRegex, (match, before, imports, after) => {
      const trimmedImports = imports.trim();
      // Avoid adding if already present
      if (new RegExp(`\\b${element.name}\\b`).test(trimmedImports)) {
        return match;
      }
      if (trimmedImports === '') {
        return `${before}${element.name}${after}`;
      } else if (trimmedImports.endsWith(',')) {
        return `${before}${trimmedImports} ${element.name}${after}`;
      } else {
        return `${before}${trimmedImports}, ${element.name}${after}`;
      }
    });
  } else if (componentDecoratorRegex.test(fileContents)) {
    // Add imports array to @Component decorator if `imports` doesn't exist
    return fileContents.replace(componentDecoratorRegex, (match) => {
      // Find the first property or the closing brace of the metadata object
      const componentMetadata = fileContents.substring(match.length -1 + fileContents.indexOf(match)); // Get from @Component({
      let insertPosition = componentMetadata.indexOf('}') + fileContents.indexOf(match) + match.length -1; // Default to before closing }

      // Try to insert after `templateUrl: '...',` or similar common properties
      const commonPropsOrder = ['selector', 'templateUrl', 'styleUrls', 'styles', 'template'];
      let lastPropEnd = -1;

      const metadataObjectMatch = /@Component\(\s*({[\s\S]*?})\s*\)/.exec(fileContents);
      if (metadataObjectMatch && metadataObjectMatch[1]) {
        const metadataContent = metadataObjectMatch[1];
        let tempOffset = 0;
        for (const prop of commonPropsOrder) {
          const propRegex = new RegExp(`${prop}:\\s*[^,}\\]]+[,\\s]*`);
          const matchProp = propRegex.exec(metadataContent.substring(tempOffset));
          if (matchProp) {
            lastPropEnd = tempOffset + matchProp.index + matchProp[0].length;
            tempOffset = lastPropEnd;
          }
        }
        if (lastPropEnd !== -1) {
          insertPosition = fileContents.indexOf(metadataObjectMatch[1]) + lastPropEnd;
          const prefix = metadataContent.substring(0, lastPropEnd).trim().endsWith(',') ? ' ' : ', ';
          return fileContents.substring(0, insertPosition) +
              `${prefix}imports: [${element.name}]` +
              fileContents.substring(insertPosition);
        } else { // No common props found, insert at the beginning of the object
          insertPosition = fileContents.indexOf(metadataObjectMatch[1]) + 1; // After {
          return fileContents.substring(0, insertPosition) +
              `imports: [${element.name}], ` +
              fileContents.substring(insertPosition);
        }
      }
      // Fallback if complex regex fails (should not happen if @Component exists)
      return `${match}imports: [${element.name}],\n`;
    });
  }
  return fileContents; // Should not happen if @Component exists
}

function switchFileType(filePath: string, newExtensionWithDot: string): string {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext); // e.g., 'my.component' from 'my.component.ts'

  if (newExtensionWithDot === '') { // Request to remove extension
    return path.join(dir, base);
  } else {
    // Ensure newExtension starts with a dot if it's meant to be an extension
    const finalExtension = newExtensionWithDot.startsWith('.') ? newExtensionWithDot : `.${newExtensionWithDot}`;
    return path.join(dir, `${base}${finalExtension}`);
  }
}


function importElement(element?: AngularElementData): boolean {
  if (!element) {
    vscode.window.showInformationMessage('Angular element not found. Please check selector, reindex, and try again.');
    return false;
  }

  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    vscode.window.showErrorMessage('No active file found.');
    return false;
  }
  const currentFile = activeEditor.document.fileName;

  // Assuming we are in an HTML file, find the corresponding .ts file
  // This heuristic might need adjustment based on project structure
  // e.g. my.component.html -> my.component.ts
  const activeComponentFile = switchFileType(currentFile, '.ts');

  if (!fs.existsSync(activeComponentFile)) {
    vscode.window.showErrorMessage(`Component file not found for ${path.basename(currentFile)}. Expected ${path.basename(activeComponentFile)}.`);
    return false;
  }

  const success = importElementToFile(element, activeComponentFile);

  if (!success) {
    vscode.window.showInformationMessage(`Something went wrong while importing ${element.type} ${element.name}. Please try again or check logs.`);
  } else {
    vscode.window.showInformationMessage(`${element.type} ${element.name} imported successfully into ${path.basename(activeComponentFile)}.`);
  }

  return success;
}

async function setAngularDataIndex(context: vscode.ExtensionContext) {
  if (!angularIndexer) {
    angularIndexer = new AngularIndexer();
  }
  // Determine project path first and set it for the indexer
  const projectRoot = determineProjectPath(); // Renamed from getProjectPath to avoid conflict
  angularIndexer.setProjectRoot(projectRoot);


  if (angularIndexer.loadFromWorkspace(context)) {
    // If loaded from cache, still ensure watcher is initialized with the correct project path
    angularIndexer.initializeWatcher(context, projectRoot);
    return;
  }
  await generateIndex(context);
}

async function generateIndex(context: vscode.ExtensionContext) {
  const folderPath = determineProjectPath(); // Renamed
  if (!angularIndexer) {
    angularIndexer = new AngularIndexer();
  }
  angularIndexer.setProjectRoot(folderPath); // Ensure it's set before indexing

  await angularIndexer.generateFullIndex(folderPath, context);
  angularIndexer.initializeWatcher(context, folderPath);
}

function determineProjectPath(): string { // Renamed from getProjectPath
  const config = getConfiguration(); // Ensure config is loaded
  let pathFromConfig = config.get<string>('projectPath'); // Corrected config key

  if (pathFromConfig && pathFromConfig.trim() !== "") {
    currentProjectPath = pathFromConfig;
  } else {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      currentProjectPath = workspaceFolders[0].uri.fsPath;
    } else {
      vscode.window.showErrorMessage('Angular Auto-Import: No workspace folder found and no project path configured. Please set "angular-auto-import.projectPath" or open a folder.');
      throw new Error('No workspace folder found and no project path configured.');
    }
  }
  console.log(`Angular Auto-Import: Using project path: ${currentProjectPath}`);
  return currentProjectPath;
}

export async function activate(activationContext: vscode.ExtensionContext) {
  try {
    getConfiguration(); // Load configuration settings, including reindexInterval
    currentProjectPath = determineProjectPath(); // Determine and set global currentProjectPath

    angularIndexer = new AngularIndexer();
    // Set project path for the indexer instance *before* any operations that might need it
    angularIndexer.setProjectRoot(currentProjectPath);

    await setAngularDataIndex(activationContext); // This will also init watcher

    if (interval) {
      clearInterval(interval);
    }

    if (reindexInterval > 0) { // Check if interval is positive
      interval = setInterval(async () => {
        try {
          console.log('Periodic reindexing triggered...');
          await generateIndex(activationContext);
        } catch (error) {
          console.error('Error during periodic reindexing:', error);
        }
      }, reindexInterval * 1000 * 60); // Interval is in minutes
    } else {
      console.log('Periodic reindexing is disabled (interval is 0 or less).');
    }

    const reindexCommand = vscode.commands.registerCommand('angular-auto-import.reindex', async () => {
      try {
        vscode.window.showInformationMessage('angular-auto-import: Reindexing started...');
        await generateIndex(activationContext);
        vscode.window.showInformationMessage('angular-auto-import: Reindex successful.');
      } catch (error) {
        console.error('Reindex error:', error);
        vscode.window.showErrorMessage('angular-auto-import: Reindexing failed. Check console for details.');
      }
    });
    activationContext.subscriptions.push(reindexCommand);

    activationContext.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { scheme: 'file', language: 'html' },
            new QuickfixImportProvider(angularIndexer), // Pass indexer
            { providedCodeActionKinds: QuickfixImportProvider.providedCodeActionKinds }
        )
    );

    const importCommand = vscode.commands.registerCommand('angular-auto-import.importElement', (selector: string) => {
      if (!angularIndexer) {
        vscode.window.showErrorMessage('Indexer not available.');
        return;
      }
      importElement(angularIndexer.getElement(selector));
    });
    activationContext.subscriptions.push(importCommand);

    const manualImportCommand = vscode.commands.registerCommand('angular-auto-import.manual.importElement', async () => {
      if (!angularIndexer) {
        vscode.window.showErrorMessage('Indexer not available.');
        return;
      }
      const userInput = await vscode.window.showInputBox({
        prompt: 'Enter Angular element selector or pipe name',
        placeHolder: 'e.g., app-component, myPipe, myDirective',
      });
      if (userInput) {
        const success = importElement(angularIndexer.getElement(userInput));
        if (!success && !angularIndexer.getElement(userInput)) { // Check if element was actually not found
          vscode.window.showErrorMessage(`Angular element "${userInput}" not found in index.`);
        }
      }
    });
    activationContext.subscriptions.push(manualImportCommand);

    activationContext.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: 'html' },
            {
              provideCompletionItems(document, position, token, context) {
                if (!angularIndexer) return [];

                const linePrefix = document.lineAt(position).text.slice(0, position.character);
                const suggestions: CompletionItem[] = [];

                const tagRegex = /<([a-zA-Z0-9-]*)$/; // Allow numbers in tags
                const tagMatch = tagRegex.exec(linePrefix);

                const pipeRegex = /\|\s*([a-zA-Z0-9]*)$/; // Allow numbers in pipe names
                const pipeMatch = pipeRegex.exec(linePrefix);

                if (tagMatch) { // tagMatch[1] can be empty string if just '<'
                  const selectorInProgress = tagMatch[1];
                  for (const selector of angularIndexer.getAllSelectors()) {
                    const element = angularIndexer.getElement(selector);
                    if (element && (element.type === 'component' || element.type === 'directive') &&
                        selector.startsWith(selectorInProgress)) { // Use startsWith for better suggestion flow
                      const item = new CompletionItem(selector, vscode.CompletionItemKind.Class);
                      item.insertText = selector; // Ensure full selector is inserted
                      item.detail = `Angular Auto-Import: ${element.type}`;
                      item.documentation = `Import ${element.name} (${element.type}) from ${element.path}`;
                      item.command = {
                        title: `Import ${element.name}`,
                        command: 'angular-auto-import.importElement',
                        arguments: [selector]
                      };
                      suggestions.push(item);
                    }
                  }
                } else if (pipeMatch) { // pipeMatch[1] can be empty string
                  const pipeNameInProgress = pipeMatch[1];
                  for (const selector of angularIndexer.getAllSelectors()) {
                    const element = angularIndexer.getElement(selector);
                    if (element && element.type === 'pipe' && selector.startsWith(pipeNameInProgress)) {
                      const item = new CompletionItem(selector, vscode.CompletionItemKind.Function);
                      item.insertText = selector;
                      item.detail = `Angular Auto-Import: pipe`;
                      item.documentation = `Import ${element.name} (pipe) from ${element.path}`;
                      item.command = {
                        title: `Import ${element.name}`,
                        command: 'angular-auto-import.importElement',
                        arguments: [selector]
                      };
                      suggestions.push(item);
                    }
                  }
                }
                return suggestions;
              },
            },
            '<', '|' // Trigger characters
        )
    );

    console.log('Angular Auto-Import extension activated successfully');
  } catch (error) {
    console.error('Error activating Angular Auto-Import extension:', error);
    vscode.window.showErrorMessage('Failed to activate Angular Auto-Import extension. Check console for details.');
  }
}

export function deactivate() {
  if (angularIndexer) {
    angularIndexer.dispose();
  }
  if (interval) {
    clearInterval(interval);
    interval = undefined;
  }
  console.log('Angular Auto-Import extension deactivated.');
}

export class QuickfixImportProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];
  public static readonly fixesDiagnosticCode: (string | number)[] = [
    'NG8001', 'NG8002', 'NG8003', 'NG8004', 'NG6004',
    -998001, -998002, -998003
  ];

  constructor(private indexer: AngularIndexer) {}

  provideCodeActions(
      document: vscode.TextDocument,
      range: vscode.Range | vscode.Selection,
      context: vscode.CodeActionContext,
      token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    if (!this.indexer) return [];
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (this.isFixableDiagnostic(diagnostic)) {
        const quickFixes = this.createQuickFixesForDiagnostic(document, diagnostic);
        actions.push(...quickFixes);
      }
    }
    return actions;
  }

  private isFixableDiagnostic(diagnostic: vscode.Diagnostic): boolean {
    if (diagnostic.code) {
      const codeStr = String(diagnostic.code);
      if (QuickfixImportProvider.fixesDiagnosticCode.some(c => String(c) === codeStr)) {
        return true;
      }
    }
    const message = diagnostic.message.toLowerCase();
    return message.includes('is not a known element') ||
        (message.includes('pipe') && message.includes('could not be found')) ||
        message.includes('unknown element') ||
        message.includes('unknown pipe');
  }

  private createQuickFixesForDiagnostic(
      document: vscode.TextDocument,
      diagnostic: vscode.Diagnostic
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    let extractedTerm = document.getText(diagnostic.range).trim();
    const message = diagnostic.message;
    let termFromMessage: string | null = null;

    const knownElementMatch = /['"]([^'"]+)['"]\s+is\s+not\s+a\s+known\s+element/i.exec(message);
    if (knownElementMatch && knownElementMatch[1]) {
      termFromMessage = knownElementMatch[1];
    } else {
      const pipeMatch = /pipe\s+['"]([^'"]+)['"]\s+could\s+not\s+be\s+found/i.exec(message);
      if (pipeMatch && pipeMatch[1]) {
        termFromMessage = pipeMatch[1];
      }
    }

    // selectorToSearch is the term we believe is the problematic selector/pipe name
    const selectorToSearch = this.extractSelector(termFromMessage || extractedTerm);

    if (selectorToSearch) {
      const elementData = this.indexer.getElement(selectorToSearch); // elementData is AngularElementData | undefined
      if (elementData) {
        // Direct match found using selectorToSearch
        // For createCodeAction:
        // - element: elementData
        // - elementActualSelector: selectorToSearch (this is the selector that led to elementData)
        // - originalTermFromDiagnostic: selectorToSearch (this is what we searched for)
        const action = this.createCodeAction(elementData, selectorToSearch, selectorToSearch, diagnostic);
        if (action) actions.push(action);
      } else {
        // No direct match, try partial matches
        const partialMatches = this.findPartialMatches(selectorToSearch);
        partialMatches.forEach(matchData => {
          // matchData is (AngularElementData & {selector: string})
          // For createCodeAction:
          // - element: matchData (which is compatible with AngularElementData)
          // - elementActualSelector: matchData.selector (the actual selector of this partially matched item)
          // - originalTermFromDiagnostic: selectorToSearch (what we originally searched for)
          const partialAction = this.createCodeAction(matchData, matchData.selector, selectorToSearch, diagnostic);
          if (partialAction) actions.push(partialAction);
        });
      }
    }
    return actions;
  }

  private extractSelector(text: string): string {
    if (text.startsWith('<') && text.endsWith('>')) {
      text = text.slice(1, -1);
    }
    const tagMatch = text.match(/^([a-zA-Z0-9-]+)/);
    if (tagMatch) return tagMatch[1];

    const pipeMatch = text.match(/\|\s*([a-zA-Z0-9]+)/);
    if (pipeMatch) return pipeMatch[1];

    return text.trim();
  }

  private findPartialMatches(searchTerm: string): Array<AngularElementData & {selector: string}> {
    if (!this.indexer) return [];
    const matches: Array<AngularElementData & {selector: string}> = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    for (const indexedSelector of this.indexer.getAllSelectors()) {
      const element = this.indexer.getElement(indexedSelector);
      if (element) {
        if (indexedSelector.toLowerCase().includes(lowerSearchTerm) ||
            lowerSearchTerm.includes(indexedSelector.toLowerCase())) {
          matches.push({ ...element, selector: indexedSelector }); // Store the element and its actual selector
        }
      }
    }
    return matches.sort((a,b) => a.selector.length - b.selector.length).slice(0, 5);
  }

  // Corrected signature and implementation
  private createCodeAction(
      element: AngularElementData,             // The data for the Angular element
      elementActualSelector: string,         // The actual selector string of this 'element' from the index
      originalTermFromDiagnostic: string,    // The term extracted from the diagnostic/user input that we searched for
      diagnostic?: vscode.Diagnostic
  ): vscode.CodeAction | null {
    const actionTitle = `Import ${element.name} (${element.type}) [${elementActualSelector}]`;
    const action = new vscode.CodeAction(actionTitle, vscode.CodeActionKind.QuickFix);

    action.command = {
      title: `Import ${element.type} ${element.name}`,
      command: 'angular-auto-import.importElement',
      arguments: [elementActualSelector] // Use the element's actual selector for the import command
    };

    if (diagnostic) {
      action.diagnostics = [diagnostic];
    }

    // An action is "preferred" if it's for a component AND
    // its actual selector exactly matches the term extracted from the diagnostic.
    action.isPreferred = (element.type === 'component' && elementActualSelector === originalTermFromDiagnostic);

    return action;
  }
}