import * as vscode from 'vscode';
import { CompletionItem } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Tree-sitter imports
import Parser from 'tree-sitter';

const TypeScript = require('tree-sitter-typescript').typescript;

interface ComponentInfo {
  path: string;
  componentName: string;
  selector: string;
  lastModified: number;
  hash: string;
}

class ComponentData {
  path: string;
  componentName: string;

  constructor(path: string, componentName: string) {
    this.path = path;
    this.componentName = componentName;
  }
}

// Enhanced caching and indexing
class ComponentIndexer {
  private parser: any;
  private fileCache: Map<string, ComponentInfo> = new Map();
  private selectorToComponent: Map<string, ComponentData> = new Map();
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

    // Watch for component file changes
    const pattern = new vscode.RelativePattern(projectPath, '**/*.component.ts');
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
   * Parse component using Tree-sitter
   */
  private parseComponentWithTreeSitter(filePath: string, content: string): { selector?: string; componentName?: string } | null {
    try {
      const tree = this.parser.parse(content);
      const rootNode = tree.rootNode;

      let selector: string | undefined;
      let componentName: string | undefined;

      // Query for @Component decorator
      const componentQuery = `
        (decorator
          (call_expression
            function: (identifier) @decorator_name
            arguments: (arguments
              (object
                (property_assignment
                  name: (property_identifier) @prop_name
                  value: (string) @prop_value
                )*
              )
            )
          )
        )
        (#eq? @decorator_name "Component")
      `;

      // Query for class export
      const classQuery = `
        (export_statement
          (class_declaration
            name: (identifier) @class_name
          )
        )
      `;

      // Find selector in @Component decorator
      this.traverseNode(rootNode, (node) => {
        if (node.type === 'decorator') {
          const decoratorNode = node.children.find((child: any) => child.type === 'call_expression');
          if (decoratorNode) {
            const functionNode = decoratorNode.children.find((child: any) => child.type === 'identifier');
            if (functionNode && content.slice(functionNode.startIndex, functionNode.endIndex) === 'Component') {
              // Found @Component decorator, now find selector
              const argsNode = decoratorNode.children.find((child: any) => child.type === 'arguments');
              if (argsNode) {
                const objectNode = argsNode.children.find((child: any) => child.type === 'object');
                if (objectNode) {
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
                }
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
              componentName = content.slice(nameNode.startIndex, nameNode.endIndex);
            }
          }
        }
      });

      return selector && componentName ? { selector, componentName } : null;
    } catch (error) {
      console.error(`Tree-sitter parsing error for ${filePath}:`, error);
      return this.parseComponentWithRegex(content); // Fallback to regex
    }
  }

  /**
   * Fallback regex parsing (original method)
   */
  private parseComponentWithRegex(content: string): { selector?: string; componentName?: string } | null {
    const selectorRegex = /selector: '([^(?<!\\)']*)',/;
    const componentNameRegex = /export class ([\S]*)/;

    const selectorMatch = selectorRegex.exec(content);
    const componentNameMatch = componentNameRegex.exec(content);

    if (selectorMatch?.[1] && componentNameMatch?.[1]) {
      return {
        selector: selectorMatch[1],
        componentName: componentNameMatch[1]
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
      const stats = fs.statSync(filePath);
      const lastModified = stats.mtime.getTime();
      const relativePath = path.relative(projectPath, filePath);

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

      // Parse component using Tree-sitter
      const parsed = this.parseComponentWithTreeSitter(filePath, content);
      
      if (parsed && parsed.selector && parsed.componentName) {
        // Remove old selector mapping if exists
        if (cached) {
          this.selectorToComponent.delete(cached.selector);
        }

        // Add new mapping
        const componentInfo: ComponentInfo = {
          path: relativePath,
          componentName: parsed.componentName,
          selector: parsed.selector,
          lastModified,
          hash
        };

        this.fileCache.set(filePath, componentInfo);
        this.selectorToComponent.set(parsed.selector, new ComponentData(relativePath, parsed.componentName));

        console.log(`Updated index for: ${relativePath} -> ${parsed.selector}`);
      } else {
        // Remove from cache if parsing failed
        if (cached) {
          this.fileCache.delete(filePath);
          this.selectorToComponent.delete(cached.selector);
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
      this.selectorToComponent.delete(cached.selector);
      await this.saveIndexToWorkspace(context);
      console.log(`Removed from index: ${filePath}`);
    }
  }

  /**
   * Initial full index generation
   */
  async generateFullIndex(projectPath: string, context: vscode.ExtensionContext): Promise<Map<string, ComponentData>> {
    console.log('INDEXING with Tree-sitter...');
    
    const componentFiles = this.getTypescriptFiles(projectPath);
    const tasks: Promise<void>[] = [];

    // Process files in parallel batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < componentFiles.length; i += batchSize) {
      const batch = componentFiles.slice(i, i + batchSize);
      const batchTasks = batch.map(file => 
        this.updateFileIndex(path.join(projectPath, file), projectPath, context)
      );
      tasks.push(...batchTasks);
      
      // Wait for batch to complete before starting next batch
      await Promise.all(batchTasks);
    }

    console.log(`Indexed ${this.selectorToComponent.size} components using Tree-sitter`);
    return this.selectorToComponent;
  }

  /**
   * Load index from workspace state
   */
  loadFromWorkspace(context: vscode.ExtensionContext): boolean {
    try {
      const storedCache = context.workspaceState.get('componentFileCache') as Map<string, ComponentInfo>;
      const storedIndex = context.workspaceState.get('componentSelectorToDataIndex') as Map<string, ComponentData>;

      if (storedCache && storedIndex) {
        this.fileCache = new Map(Object.entries(storedCache));
        this.selectorToComponent = new Map(Object.entries(storedIndex));
        console.log(`Loaded ${this.selectorToComponent.size} components from cache`);
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
      await context.workspaceState.update('componentFileCache', Object.fromEntries(this.fileCache));
      await context.workspaceState.update('componentSelectorToDataIndex', Object.fromEntries(this.selectorToComponent));
    } catch (error) {
      console.error('Error saving index to workspace:', error);
    }
  }

  /**
   * Get component by selector
   */
  getComponent(selector: string): ComponentData | undefined {
    return this.selectorToComponent.get(selector);
  }

  /**
   * Get all selectors
   */
  getAllSelectors(): IterableIterator<string> {
    return this.selectorToComponent.keys();
  }

  /**
   * Get typescript component files (unchanged from original)
   */
  private getTypescriptFiles(filePath: string): string[] {
    const tsFiles: string[] = [];

    const isGitIgnored = (fileName: string, gitIgnorePath: string): boolean => {
      if (!fs.existsSync(gitIgnorePath)) return false;

      const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
      const gitIgnorePatterns = gitIgnoreContent.split('\n').filter(Boolean);

      return gitIgnorePatterns.some((pattern) => {
        const regexp = new RegExp(pattern.replace(/\*/g, '.*'));
        return regexp.test(fileName);
      });
    };

    const traverseDirectory = (dirPath: string, gitIgnorePath?: string) => {
      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const relativePath = path.relative(filePath, fullPath);

        if (gitIgnorePath && isGitIgnored(relativePath, gitIgnorePath)) {
          return;
        }

        if (fs.statSync(fullPath).isDirectory()) {
          traverseDirectory(fullPath, gitIgnorePath);
        } else if (file.endsWith('component.ts')) {
          tsFiles.push(relativePath);
        }
      });
    };

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        const gitIgnorePath = path.join(filePath, '.gitignore');
        traverseDirectory(filePath, gitIgnorePath);
      } else if (filePath.endsWith('component.ts')) {
        tsFiles.push(path.basename(filePath));
      }
    }
    console.log(`Found ${tsFiles.length} component files.`);
    return tsFiles;
  }

  dispose() {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
  }
}

// State
let componentIndexer: ComponentIndexer;
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

function importComponentToFile(component: ComponentData, filePath: string): boolean {
  try {
    let importStr: string;
    importStr = `import { ${component.componentName} } from '${getRelativeFilePath(
      filePath,
      `${projectPath}/${switchFileType(component.path, '')}`
    )}'\n`;
    const fileContents = fs.readFileSync(filePath);
    let newFileContents = importStr + fileContents.toString();
    newFileContents = addImportToAnnotation(component, newFileContents);

    fs.writeFileSync(filePath, newFileContents);
    setTimeout(() => vscode.commands.executeCommand('editor.action.formatDocument', filePath), 0);

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function addImportToAnnotation(component: ComponentData, fileContents: string) {
  const importRegex = /(@Component\({[\s\S]*imports: \[(\s*))([^}]*}\))/;
  if (importRegex.test(fileContents.toString())) {
    const isImportsEmptyRegex = /(@Component\({[\s\S]*imports: \[(\s*)\])([^}]*}\))/;
    let fileWithImport: string;
    if (isImportsEmptyRegex.test(fileContents)) {
      fileWithImport = fileContents.toString().replace(importRegex, `$1${component.componentName}$2$3`);
    } else {
      fileWithImport = fileContents.toString().replace(importRegex, `$1${component.componentName}, $2$3`);
    }
    return fileWithImport;
  } else {
    const componentRegex = /(@Component\({(\s*))/;
    return fileContents.toString().replace(componentRegex, `$1imports: [${component.componentName}],$2`);
  }
}

function switchFileType(filePath: string, newExtension: string): string {
  const path = require('path');
  const fileBaseName = path.basename(filePath, path.extname(filePath));
  const fileDirectory = path.dirname(filePath);

  let newFilePath;
  if (!newExtension) {
    newFilePath = path.join(fileDirectory, `${fileBaseName}`);
  } else {
    newFilePath = path.join(fileDirectory, `${fileBaseName}.${newExtension}`);
  }

  return newFilePath;
}

function importComponent(component?: ComponentData): boolean {
  if (!component) {
    console.error('Component not found. Please check that the provided selector is correct, reindex, and try again.');
    vscode.window.showInformationMessage('Component not found. Please reindex and try again.');
    return false;
  }
  const currentFile = vscode.window.activeTextEditor?.document.fileName;
  if (!currentFile) {
    return false;
  }
  const activeComponentFile = switchFileType(currentFile, 'ts');
  const success = importComponentToFile(component, activeComponentFile);
  if (!success) {
    vscode.window.showInformationMessage('Something went wrong while importing your component. Please try again.');
  }
  return success;
}

async function setComponentDataIndex(context: vscode.ExtensionContext) {
  if (!componentIndexer) {
    componentIndexer = new ComponentIndexer();
  }

  // Try to load from cache first
  if (componentIndexer.loadFromWorkspace(context)) {
    return;
  }

  // If cache is empty, generate full index
  await generateIndex(context);
}

async function generateIndex(context: vscode.ExtensionContext) {
  const folderPath = getProjectPath();
  if (!componentIndexer) {
    componentIndexer = new ComponentIndexer();
  }
  
  await componentIndexer.generateFullIndex(folderPath, context);
  
  // Initialize file watcher for incremental updates
  componentIndexer.initializeWatcher(context, folderPath);
}

function getProjectPath(): string {
  const config = getConfiguration();
  projectPath = config.get('angular-auto-import.projectPath');
  if (!projectPath) {
    const workspace = vscode.workspace;
    if (workspace.workspaceFolders) {
      const firstFolder = workspace.workspaceFolders[0];
      const folderUri = firstFolder.uri;
      const folderPath = folderUri.fsPath;
      projectPath = folderPath;
    } else {
      console.error('No active folder found.');
    }
  }
  return projectPath ?? '';
}

export async function activate(activationContext: vscode.ExtensionContext) {
  // Get config settings
  getConfiguration();

  // Set the index with optimized indexer
  await setComponentDataIndex(activationContext);

  // Register interval for periodic reindexing (optional, since we have file watchers)
  if (!!interval) {
    clearInterval(interval);
  }
  if (reindexInterval !== 0) {
    interval = setInterval(async () => {
      await generateIndex(activationContext);
    }, Math.floor(reindexInterval) * 1000);
  }

  const reindexCommand = vscode.commands.registerCommand('angular-auto-import.reindex', async () => {
    try {
      await generateIndex(activationContext);
      vscode.window.showInformationMessage('angular-auto-import: Reindex successful.');
    } catch {
      vscode.window.showInformationMessage('angular-auto-import: Something went wrong when reindexing. Some components may be missing.');
    }
  });
  activationContext.subscriptions.push(reindexCommand);

  // File creation handler (redundant now with file watcher, but keeping for compatibility)
  activationContext.subscriptions.push(
    vscode.workspace.onDidCreateFiles((event) => {
      // File watcher will handle this automatically
    })
  );

  // Register quick fix
  activationContext.subscriptions.push(
    vscode.languages.registerCodeActionsProvider({ scheme: 'file', language: 'html' }, new QuickfixImportProvider(), {
      providedCodeActionKinds: QuickfixImportProvider.providedCodeActionKinds,
    })
  );

  // Register command to do component importing
  const importCommand = vscode.commands.registerCommand('angular-auto-import.importComponent', (componentSelector: string) =>
    importComponent(componentIndexer.getComponent(componentSelector))
  );
  activationContext.subscriptions.push(importCommand);

  const manualImportCommand = vscode.commands.registerCommand('angular-auto-import.manual.importComponent', (componentSelector: string) => {
    vscode.window
      .showInputBox({
        prompt: 'Enter your argument',
        placeHolder: 'Type here...',
        value: '',
      })
      .then((userInput) => {
        const success = importComponent(componentIndexer.getComponent(userInput ?? ''));
        if (success) {
          vscode.window.showInformationMessage('Component imported successfully.');
        }
        return;
      });
  });

  activationContext.subscriptions.push(manualImportCommand);

  // Register autocompletion
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
          const openMarkerRegex = /<([^\s>]*)$/;
          const suggestions: CompletionItem[] = [];
          const match = openMarkerRegex.exec(linePrefix);
          
          if (match && match[1]) {
            const selectorInProgress = match[1];
            for (const selector of componentIndexer.getAllSelectors()) {
              if (selector.includes(selectorInProgress)) {
                const component = componentIndexer.getComponent(selector);
                const item = new CompletionItem(selector);
                item.commitCharacters = ['>'];
                item.documentation = `angular-auto-import: add and import ${component?.componentName} from ${component?.path}`;
                item.command = { title: 'import component', command: 'angular-auto-import.importComponent', arguments: [selector] };
                suggestions.push(item);
              }
            }
          }

          return suggestions;
        },
      }
    )
  );
}

export function deactivate() {
  if (componentIndexer) {
    componentIndexer.dispose();
  }
  if (interval) {
    clearInterval(interval);
  }
}

export class QuickfixImportProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];
  public static readonly fixesDiagnosticCode: number[] = [-998001];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    for (const diagnostic of context.diagnostics) {
      if (diagnostic.code && typeof diagnostic.code === 'number' && QuickfixImportProvider.fixesDiagnosticCode.includes(diagnostic.code)) {
        let selector = document.getText(diagnostic.range);
        if (selector.startsWith('<') && selector.endsWith('>')) {
          selector = selector.slice(1, selector.length - 1);
          const component = componentIndexer.getComponent(selector);
          if (component) {
            const fix = new vscode.CodeAction(
              `angular-auto-import: Import component ${component.componentName} from ${component.path}`,
              vscode.CodeActionKind.QuickFix
            );
            fix.command = { title: 'import component', command: 'angular-auto-import.importComponent', arguments: [selector] };
            fix.diagnostics = [diagnostic];
            return [fix];
          }
        }
      }
    }
    return [];
  }
}