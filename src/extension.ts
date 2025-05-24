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
  private parser: any;
  private fileCache: Map<string, ComponentInfo> = new Map();
  private selectorToElement: Map<string, AngularElementData> = new Map();
  private fileWatcher: vscode.FileSystemWatcher | null = null;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript);
  }

  /**
   * Initialize file watcher for incremental updates
   */
  initializeWatcher(context: vscode.ExtensionContext, projectPath: string) {
    // Clean up existing watcher
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }

    // Watch for Angular file changes (components, directives, pipes)
    const pattern = new vscode.RelativePattern(projectPath, '**/*.{component,directive,pipe}.ts');
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.fileWatcher.onDidCreate((uri) => {
      console.log(`File created: ${uri.fsPath}`);
      this.updateFileIndex(uri.fsPath, projectPath, context);
    });

    this.fileWatcher.onDidChange((uri) => {
      console.log(`File changed: ${uri.fsPath}`);
      this.updateFileIndex(uri.fsPath, projectPath, context);
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
    try {
      const tree = this.parser.parse(content);
      const rootNode = tree.rootNode;

      let selector: string | undefined;
      let elementName: string | undefined;
      let elementType: 'component' | 'directive' | 'pipe' | undefined;
      let pipeName: string | undefined;

      // Find decorator and class export
      this.traverseNode(rootNode, (node) => {
        if (node.type === 'decorator') {
          const decoratorNode = node.children.find((child: any) => child.type === 'call_expression');
          if (decoratorNode) {
            const functionNode = decoratorNode.children.find((child: any) => child.type === 'identifier');
            if (functionNode) {
              const decoratorName = content.slice(functionNode.startIndex, functionNode.endIndex);
              
              if (decoratorName === 'Component') {
                elementType = 'component';
                selector = this.extractSelectorFromDecorator(decoratorNode, content);
              } else if (decoratorName === 'Directive') {
                elementType = 'directive';
                selector = this.extractSelectorFromDecorator(decoratorNode, content);
              } else if (decoratorName === 'Pipe') {
                elementType = 'pipe';
                pipeName = this.extractPipeNameFromDecorator(decoratorNode, content);
              }
            }
          }
        }
      });

      // Find exported class name
      this.traverseNode(rootNode, (node) => {
        if (node.type === 'export_statement') {
          const classNode = node.children.find((child: any) => child.type === 'class_declaration');
          if (classNode) {
            const nameNode = classNode.children.find((child: any) => child.type === 'identifier');
            if (nameNode) {
              elementName = content.slice(nameNode.startIndex, nameNode.endIndex);
            }
          }
        }
      });

      if (elementName && elementType) {
        const finalSelector = elementType === 'pipe' ? pipeName : selector;
        if (finalSelector) {
          return {
            path: path.relative(this.getProjectPath(), filePath),
            name: elementName,
            selector: finalSelector,
            lastModified: fs.statSync(filePath).mtime.getTime(),
            hash: this.generateHash(content),
            type: elementType
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Tree-sitter parsing error for ${filePath}:`, error);
      return this.parseAngularElementWithRegex(filePath, content); // Fallback to regex
    }
  }

  /**
   * Extract selector from @Component or @Directive decorator
   */
  private extractSelectorFromDecorator(decoratorNode: any, content: string): string | undefined {
    const argsNode = decoratorNode.children.find((child: any) => child.type === 'arguments');
    if (argsNode) {
      const objectNode = argsNode.children.find((child: any) => child.type === 'object');
      if (objectNode) {
        let selector: string | undefined;
        this.traverseNode(objectNode, (propNode) => {
          if (propNode.type === 'property_assignment') {
            const nameNode = propNode.children.find((child: any) => child.type === 'property_identifier');
            const valueNode = propNode.children.find((child: any) => child.type === 'string');
            
            if (nameNode && valueNode) {
              const propName = content.slice(nameNode.startIndex, nameNode.endIndex);
              if (propName === 'selector') {
                const selectorValue = content.slice(valueNode.startIndex, valueNode.endIndex);
                selector = selectorValue.slice(1, -1); // Remove quotes
              }
            }
          }
        });
        return selector;
      }
    }
    return undefined;
  }

  /**
   * Extract name from @Pipe decorator
   */
  private extractPipeNameFromDecorator(decoratorNode: any, content: string): string | undefined {
    const argsNode = decoratorNode.children.find((child: any) => child.type === 'arguments');
    if (argsNode) {
      const objectNode = argsNode.children.find((child: any) => child.type === 'object');
      if (objectNode) {
        let pipeName: string | undefined;
        this.traverseNode(objectNode, (propNode) => {
          if (propNode.type === 'property_assignment') {
            const nameNode = propNode.children.find((child: any) => child.type === 'property_identifier');
            const valueNode = propNode.children.find((child: any) => child.type === 'string');
            
            if (nameNode && valueNode) {
              const propName = content.slice(nameNode.startIndex, nameNode.endIndex);
              if (propName === 'name') {
                const nameValue = content.slice(valueNode.startIndex, valueNode.endIndex);
                pipeName = nameValue.slice(1, -1); // Remove quotes
              }
            }
          }
        });
        return pipeName;
      }
    }
    return undefined;
  }

  /**
   * Fallback regex parsing
   */
  private parseAngularElementWithRegex(filePath: string, content: string): ComponentInfo | null {
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
        path: path.relative(this.getProjectPath(), filePath),
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
  private traverseNode(node: any, callback: (node: any) => void) {
    callback(node);
    for (let i = 0; i < node.childCount; i++) {
      this.traverseNode(node.child(i), callback);
    }
  }

  /**
   * Update index for a single file
   */
  private async updateFileIndex(filePath: string, projectPath: string, context: vscode.ExtensionContext): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      const stats = fs.statSync(filePath);
      const lastModified = stats.mtime.getTime();

      // Check if file needs reprocessing
      const cached = this.fileCache.get(filePath);
      if (cached && cached.lastModified >= lastModified) {
        return; // File hasn't changed
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const hash = this.generateHash(content);

      // Check content hash to avoid reprocessing identical content
      if (cached && cached.hash === hash) {
        return;
      }

      // Parse Angular element using Tree-sitter
      const parsed = this.parseAngularElementWithTreeSitter(filePath, content);
      
      if (parsed) {
        // Remove old selector mapping if exists
        if (cached) {
          this.selectorToElement.delete(cached.selector);
        }

        this.fileCache.set(filePath, parsed);
        this.selectorToElement.set(parsed.selector, new AngularElementData(parsed.path, parsed.name, parsed.type));

        console.log(`Updated index for: ${parsed.path} -> ${parsed.selector} (${parsed.type})`);
      } else {
        // Remove from cache if parsing failed
        if (cached) {
          this.fileCache.delete(filePath);
          this.selectorToElement.delete(cached.selector);
        }
      }

      // Persist to workspace state
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
    
    const angularFiles = this.getAngularFiles(projectPath);
    
    // Process files in parallel batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < angularFiles.length; i += batchSize) {
      const batch = angularFiles.slice(i, i + batchSize);
      const batchTasks = batch.map(file => 
        this.updateFileIndex(path.join(projectPath, file), projectPath, context)
      );
      
      // Wait for batch to complete before starting next batch
      await Promise.all(batchTasks);
    }

    console.log(`Indexed ${this.selectorToElement.size} Angular elements using Tree-sitter`);
    return this.selectorToElement;
  }

  /**
   * Load index from workspace state
   */
  loadFromWorkspace(context: vscode.ExtensionContext): boolean {
    try {
      const storedCache = context.workspaceState.get('angularFileCache');
      const storedIndex = context.workspaceState.get('angularSelectorToDataIndex');

      if (storedCache && storedIndex) {
        // Convert plain objects back to Maps
        this.fileCache = new Map(Object.entries(storedCache as Record<string, ComponentInfo>));
        this.selectorToElement = new Map(Object.entries(storedIndex as Record<string, AngularElementData>).map(([key, value]) => [
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

  /**
   * Save index to workspace state
   */
  private async saveIndexToWorkspace(context: vscode.ExtensionContext): Promise<void> {
    try {
      await context.workspaceState.update('angularFileCache', Object.fromEntries(this.fileCache));
      await context.workspaceState.update('angularSelectorToDataIndex', Object.fromEntries(this.selectorToElement));
    } catch (error) {
      console.error('Error saving index to workspace:', error);
    }
  }

  /**
   * Get Angular element by selector
   */
  getElement(selector: string): AngularElementData | undefined {
    return this.selectorToElement.get(selector);
  }

  /**
   * Get all selectors
   */
  getAllSelectors(): IterableIterator<string> {
    return this.selectorToElement.keys();
  }

  /**
   * Get Angular files (components, directives, pipes)
   */
  private getAngularFiles(filePath: string): string[] {
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
            const regexp = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
            return regexp.test(fileName);
          } catch {
            return false;
          }
        });
      } catch {
        return false;
      }
    };

    const traverseDirectory = (dirPath: string, gitIgnorePath?: string) => {
      try {
        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
          const fullPath = path.join(dirPath, file);
          const relativePath = path.relative(filePath, fullPath);

          if (gitIgnorePath && isGitIgnored(relativePath, gitIgnorePath)) {
            return;
          }

          try {
            if (fs.statSync(fullPath).isDirectory()) {
              // Skip node_modules and other common directories
              if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
                traverseDirectory(fullPath, gitIgnorePath);
              }
            } else if (file.match(/\.(component|directive|pipe)\.ts$/)) {
              angularFiles.push(relativePath);
            }
          } catch (error) {
            console.warn(`Error processing file ${fullPath}:`, error);
          }
        });
      } catch (error) {
        console.warn(`Error reading directory ${dirPath}:`, error);
      }
    };

    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          const gitIgnorePath = path.join(filePath, '.gitignore');
          traverseDirectory(filePath, gitIgnorePath);
        } else if (filePath.match(/\.(component|directive|pipe)\.ts$/)) {
          angularFiles.push(path.basename(filePath));
        }
      } catch (error) {
        console.error(`Error processing path ${filePath}:`, error);
      }
    }
    
    console.log(`Found ${angularFiles.length} Angular files.`);
    return angularFiles;
  }

  private getProjectPath(): string {
    return projectPath ?? '';
  }

  dispose() {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
  }
}

// State
let angularIndexer: AngularIndexer;
let interval: any;

// Config
let reindexInterval: number = 60;
let projectPath: string | undefined;

function getConfiguration() { 
  const config = vscode.workspace.getConfiguration('angular-auto-import');
  reindexInterval = config.get('angular-auto-import.index.refreshInterval') ?? 60;
  return config;
}

function getRelativeFilePath(file1: string, file2: string): string {
  return path.relative(path.dirname(file1), file2);
}

function importElementToFile(element: AngularElementData, filePath: string): boolean {
  try {
    const relativePath = getRelativeFilePath(filePath, `${projectPath}/${switchFileType(element.path, '')}`);
    let importStr = `import { ${element.name} } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}';\n`;
    
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    
    // Check if import already exists
    const importRegex = new RegExp(`import\\s*{[^}]*\\b${element.name}\\b[^}]*}\\s*from\\s*['"][^'"]*['"]`, 'g');
    if (importRegex.test(fileContents)) {
      console.log(`${element.name} is already imported`);
      return true;
    }

    let newFileContents = importStr + fileContents;
    newFileContents = addImportToAnnotation(element, newFileContents);

    fs.writeFileSync(filePath, newFileContents);
    
    // Format document after a short delay
    setTimeout(() => {
      vscode.commands.executeCommand('editor.action.formatDocument') // .catch(console.error);
    }, 100);

    return true;
  } catch (e) {
    console.error('Error importing element:', e);
    return false;
  }
}

function addImportToAnnotation(element: AngularElementData, fileContents: string): string {
  const importRegex = /(@Component\({[\s\S]*?imports:\s*\[)([^\]]*?)(\][\s\S]*?}\))/;
  
  if (importRegex.test(fileContents)) {
    return fileContents.replace(importRegex, (match, before, imports, after) => {
      const trimmedImports = imports.trim();
      if (trimmedImports === '') {
        return `${before}${element.name}${after}`;
      } else {
        return `${before}${trimmedImports}, ${element.name}${after}`;
      }
    });
  } else {
    // Add imports array to @Component decorator
    const componentRegex = /(@Component\({)(\s*)/;
    return fileContents.replace(componentRegex, `$1$2imports: [${element.name}],$2`);
  }
}

function switchFileType(filePath: string, newExtension: string): string {
  const fileBaseName = path.basename(filePath, path.extname(filePath));
  const fileDirectory = path.dirname(filePath);

  if (!newExtension) {
    return path.join(fileDirectory, fileBaseName);
  } else {
    return path.join(fileDirectory, `${fileBaseName}.${newExtension}`);
  }
}

function importElement(element?: AngularElementData): boolean {
  if (!element) {
    console.error('Angular element not found. Please check that the provided selector is correct, reindex, and try again.');
    vscode.window.showInformationMessage('Angular element not found. Please reindex and try again.');
    return false;
  }
  
  const currentFile = vscode.window.activeTextEditor?.document.fileName;
  if (!currentFile) {
    vscode.window.showErrorMessage('No active file found.');
    return false;
  }
  
  const activeComponentFile = switchFileType(currentFile, 'ts');
  const success = importElementToFile(element, activeComponentFile);
  
  if (!success) {
    vscode.window.showInformationMessage(`Something went wrong while importing your ${element.type}. Please try again.`);
  } else {
    vscode.window.showInformationMessage(`${element.type} ${element.name} imported successfully.`);
  }
  
  return success;
}

async function setAngularDataIndex(context: vscode.ExtensionContext) {
  if (!angularIndexer) {
    angularIndexer = new AngularIndexer();
  }

  // Try to load from cache first
  if (angularIndexer.loadFromWorkspace(context)) {
    return;
  }

  // If cache is empty, generate full index
  await generateIndex(context);
}

async function generateIndex(context: vscode.ExtensionContext) {
  const folderPath = getProjectPath();
  if (!angularIndexer) {
    angularIndexer = new AngularIndexer();
  }
  
  await angularIndexer.generateFullIndex(folderPath, context);
  
  // Initialize file watcher for incremental updates
  angularIndexer.initializeWatcher(context, folderPath);
}

function getProjectPath(): string {
  const config = getConfiguration();
  projectPath = config.get('angular-auto-import.projectPath');
  
  if (!projectPath) {
    const workspace = vscode.workspace;
    if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
      const firstFolder = workspace.workspaceFolders[0];
      projectPath = firstFolder.uri.fsPath;
    } else {
      console.error('No active folder found.');
      throw new Error('No workspace folder found');
    }
  }
  
  return projectPath;
}

export async function activate(activationContext: vscode.ExtensionContext) {
  try {
    // Get config settings
    getConfiguration();

    // Set the index with optimized indexer
    await setAngularDataIndex(activationContext);

    // Register interval for periodic reindexing (optional, since we have file watchers)
    if (interval) {
      clearInterval(interval);
    }
    
    if (reindexInterval !== 0) {
      interval = setInterval(async () => {
        try {
          await generateIndex(activationContext);
        } catch (error) {
          console.error('Error during periodic reindexing:', error);
        }
      }, Math.floor(reindexInterval) * 1000);
    }

    // Register reindex command
    const reindexCommand = vscode.commands.registerCommand('angular-auto-import.reindex', async () => {
      try {
        await generateIndex(activationContext);
        vscode.window.showInformationMessage('angular-auto-import: Reindex successful.');
      } catch (error) {
        console.error('Reindex error:', error);
        vscode.window.showInformationMessage('angular-auto-import: Something went wrong when reindexing. Some elements may be missing.');
      }
    });
    activationContext.subscriptions.push(reindexCommand);

    // Register quick fix provider
    activationContext.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        { scheme: 'file', language: 'html' }, 
        new QuickfixImportProvider(), 
        {
          providedCodeActionKinds: QuickfixImportProvider.providedCodeActionKinds,
        }
      )
    );

    // Register command to do element importing
    const importCommand = vscode.commands.registerCommand('angular-auto-import.importElement', (selector: string) =>
      importElement(angularIndexer.getElement(selector))
    );
    activationContext.subscriptions.push(importCommand);

    // Register manual import command
    const manualImportCommand = vscode.commands.registerCommand('angular-auto-import.manual.importElement', () => {
      vscode.window
        .showInputBox({
          prompt: 'Enter Angular element selector or pipe name',
          placeHolder: 'e.g., app-component, myPipe, myDirective',
          value: '',
        })
        .then((userInput) => {
          if (userInput) {
            const success = importElement(angularIndexer.getElement(userInput));
            if (!success) {
              vscode.window.showErrorMessage(`Angular element "${userInput}" not found.`);
            }
          }
        });
    });
    activationContext.subscriptions.push(manualImportCommand);

    // Register autocompletion for HTML files
    activationContext.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'html' },
        {
          provideCompletionItems(
            document: vscode.TextDocument,
            position: vscode.Position,
            token: vscode.CancellationToken,
            context: vscode.CompletionContext
          ) {
            const linePrefix = document.lineAt(position).text.slice(0, position.character);
            const suggestions: CompletionItem[] = [];
            
            // Match HTML tags for components and directives
            const tagRegex = /<([^\s>]*)$/;
            const tagMatch = tagRegex.exec(linePrefix);
            
            // Match pipe usage
            const pipeRegex = /\|\s*(\w*)$/;
            const pipeMatch = pipeRegex.exec(linePrefix);
            
            if (tagMatch && tagMatch[1]) {
              const selectorInProgress = tagMatch[1];
              for (const selector of angularIndexer.getAllSelectors()) {
                const element = angularIndexer.getElement(selector);
                if (element && (element.type === 'component' || element.type === 'directive') && 
                    selector.includes(selectorInProgress)) {
                  const item = new CompletionItem(selector, vscode.CompletionItemKind.Class);
                  item.commitCharacters = ['>'];
                  item.documentation = `angular-auto-import: add and import ${element.name} (${element.type}) from ${element.path}`;
                  item.command = { 
                    title: `import ${element.type}`, 
                    command: 'angular-auto-import.importElement', 
                    arguments: [selector] 
                  };
                  suggestions.push(item);
                }
              }
            } else if (pipeMatch && pipeMatch[1]) {
              const pipeNameInProgress = pipeMatch[1];
              for (const selector of angularIndexer.getAllSelectors()) {
                const element = angularIndexer.getElement(selector);
                if (element && element.type === 'pipe' && selector.includes(pipeNameInProgress)) {
                  const item = new CompletionItem(selector, vscode.CompletionItemKind.Function);
                  item.documentation = `angular-auto-import: add and import ${element.name} (pipe) from ${element.path}`;
                  item.command = { 
                    title: 'import pipe', 
                    command: 'angular-auto-import.importElement', 
                    arguments: [selector] 
                  };
                  suggestions.push(item);
                }
              }
            }

            return suggestions;
          },
        }
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
  }
}

export class QuickfixImportProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  // Common Angular diagnostic codes for unknown elements/pipes
  public static readonly fixesDiagnosticCode: number[] = [-998001, -998002, -998003];

  provideCodeActions(
      document: vscode.TextDocument,
      range: vscode.Range,
      context: vscode.CodeActionContext,
      token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (this.isFixableDiagnostic(diagnostic)) {
        const quickFixes = this.createQuickFixesForDiagnostic(document, diagnostic);
        actions.push(...quickFixes);
      }
    }

    // Also provide quick fixes for unknown elements even without specific diagnostics
    const additionalFixes = this.createQuickFixesForRange(document, range);
    actions.push(...additionalFixes);

    return actions;
  }

  private isFixableDiagnostic(diagnostic: vscode.Diagnostic): boolean {
    // Check if diagnostic code matches our fixable codes
    if (diagnostic.code && typeof diagnostic.code === 'number') {
      return QuickfixImportProvider.fixesDiagnosticCode.includes(diagnostic.code);
    }

    // Check if diagnostic message indicates unknown element/pipe
    const message = diagnostic.message.toLowerCase();
    return message.includes('is not a known element') ||
        message.includes('is not a known pipe') ||
        message.includes('unknown element') ||
        message.includes('unknown pipe');
  }

  private createQuickFixesForDiagnostic(
      document: vscode.TextDocument,
      diagnostic: vscode.Diagnostic
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    let selector = document.getText(diagnostic.range).trim();

    // Handle different selector formats
    selector = this.extractSelector(selector);

    if (selector && angularIndexer) {
      const element = angularIndexer.getElement(selector);
      if (element) {
        const action = this.createCodeAction(element, selector, diagnostic);
        if (action) {
          actions.push(action);
        }
      } else {
        // Try to find partial matches
        const partialMatches = this.findPartialMatches(selector);
        partialMatches.forEach(match => {
          const partialAction = this.createCodeAction(match, match.selector, diagnostic);
          if (partialAction) {
            actions.push(partialAction);
          }
        });
      }
    }

    return actions;
  }

  private createQuickFixesForRange(
      document: vscode.TextDocument,
      range: vscode.Range
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    const text = document.getText(range).trim();

    if (!text || !angularIndexer) {
      return actions;
    }

    // Extract potential selectors from the range
    const selectors = this.extractSelectorsFromText(text);

    selectors.forEach(selector => {
      const element = angularIndexer.getElement(selector);
      if (element) {
        const action = this.createCodeAction(element, selector);
        if (action) {
          actions.push(action);
        }
      }
    });

    return actions;
  }

  private extractSelector(text: string): string {
    // Remove HTML tag brackets
    if (text.startsWith('<') && text.endsWith('>')) {
      text = text.slice(1, -1);
    }

    // Remove attributes and get just the tag name
    const tagMatch = text.match(/^([^\s]+)/);
    if (tagMatch) {
      return tagMatch[1];
    }

    // Handle pipe syntax
    const pipeMatch = text.match(/\|\s*(\w+)/);
    if (pipeMatch) {
      return pipeMatch[1];
    }

    return text;
  }

  private extractSelectorsFromText(text: string): string[] {
    const selectors: string[] = [];

    // Extract HTML tag selectors
    const tagRegex = /<([a-zA-Z][a-zA-Z0-9-]*)/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(text)) !== null) {
      selectors.push(tagMatch[1]);
    }

    // Extract pipe selectors
    const pipeRegex = /\|\s*([a-zA-Z][a-zA-Z0-9]*)/g;
    let pipeMatch;
    while ((pipeMatch = pipeRegex.exec(text)) !== null) {
      selectors.push(pipeMatch[1]);
    }

    return [...new Set(selectors)]; // Remove duplicates
  }

  private findPartialMatches(selector: string): Array<{selector: string} & AngularElementData> {
    if (!angularIndexer) {
      return [];
    }

    const matches: Array<{selector: string} & AngularElementData> = [];
    const lowerSelector = selector.toLowerCase();

    for (const availableSelector of angularIndexer.getAllSelectors()) {
      if (availableSelector.toLowerCase().includes(lowerSelector) ||
          lowerSelector.includes(availableSelector.toLowerCase())) {
        const element = angularIndexer.getElement(availableSelector);
        if (element) {
          matches.push({
            selector: availableSelector,
            ...element
          });
        }
      }
    }

    return matches.slice(0, 5); // Limit to 5 suggestions
  }

  private createCodeAction(
      element: AngularElementData,
      selector: string,
      diagnostic?: vscode.Diagnostic
  ): vscode.CodeAction | null {
    const elementType = element.type;
    const actionTitle = `Import ${element.name} (${elementType}) from ${element.path}`;

    const action = new vscode.CodeAction(
        actionTitle,
        vscode.CodeActionKind.QuickFix
    );

    action.command = {
      title: `Import ${elementType}`,
      command: 'angular-auto-import.importElement',
      arguments: [selector]
    };

    if (diagnostic) {
      action.diagnostics = [diagnostic];
    }

    // Set action priority (higher number = higher priority)
    action.isPreferred = element.type === 'component';

    return action;
  }
}