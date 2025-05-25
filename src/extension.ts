import * as vscode from 'vscode';
import { CompletionItem } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Tree-sitter imports
import Parser from 'tree-sitter';

const TypeScript = require('tree-sitter-typescript').typescript;

interface ComponentInfo {
  path: string; // Relative to project root
  name: string;
  selector: string;
  lastModified: number;
  hash: string;
  type: 'component' | 'directive' | 'pipe';
}

class AngularElementData {
  path: string; // Relative to project root
  name: string;
  type: 'component' | 'directive' | 'pipe';

  constructor(path: string, name: string, type: 'component' | 'directive' | 'pipe') {
    this.path = path;
    this.name = name;
    this.type = type;
  }
}

// --- TsConfigHelper START ---
interface TsConfigPaths {
  [alias: string]: string[];
}

interface TsCompilerOptions {
  baseUrl?: string;
  paths?: TsConfigPaths;
}

interface TsConfigFormat {
  compilerOptions?: TsCompilerOptions;
  extends?: string;
}

interface ProcessedTsConfig {
  absoluteBaseUrl: string; // Absolute path to the baseUrl against which paths should be resolved
  paths: TsConfigPaths;
  sourceFilePath: string; // Absolute path to the primary tsconfig file (e.g., tsconfig.json)
}

class TsConfigHelper {
  private static tsConfigCache: Map<string, ProcessedTsConfig | null> = new Map();

  public static clearCache() {
    this.tsConfigCache.clear();
    console.log('TsConfigHelper cache cleared.');
  }

  private static parseJsonWithComments(jsonString: string, filePath: string): any {
    try {
      let content = jsonString;
      content = content.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
      content = content.replace(/(?<!:)\/\/[^\r\n]*/g, ''); // Remove line comments
      content = content.replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
      return JSON.parse(content);
    } catch (e) {
      console.warn(`Could not parse JSON from ${filePath} (tried stripping comments/commas). Error:`, e);
      try {
        return JSON.parse(jsonString); // Fallback
      } catch (directParseError) {
        console.error(`Direct JSON.parse also failed for ${filePath}:`, directParseError);
        throw directParseError;
      }
    }
  }

  public static async findAndParseTsConfig(projectRoot: string): Promise<ProcessedTsConfig | null> {
    const cacheKey = projectRoot;
    if (this.tsConfigCache.has(cacheKey)) {
      return this.tsConfigCache.get(cacheKey)!;
    }

    console.log(`TsConfigHelper: Searching for tsconfig in: ${projectRoot}`);

    const loadConfig = async (configFilePath: string): Promise<{ config: TsConfigFormat; dir: string } | null> => {
      if (!fs.existsSync(configFilePath)) {
        console.log(`TsConfigHelper: File not found: ${configFilePath}`);
        return null;
      }
      try {
        const fileContent = fs.readFileSync(configFilePath, 'utf-8');
        console.log(`TsConfigHelper: Parsing tsconfig: ${configFilePath}`);
        const config = this.parseJsonWithComments(fileContent, configFilePath) as TsConfigFormat;
        return { config, dir: path.dirname(configFilePath) };
      } catch (e) {
        console.warn(`TsConfigHelper: Error reading or parsing tsconfig file ${configFilePath}:`, e);
        return null;
      }
    };

    let primaryConfigPath: string | undefined;
    const tsConfigNames = ['tsconfig.json', 'tsconfig.base.json']; // tsconfig.json takes precedence

    for (const name of tsConfigNames) {
      const potentialPath = path.join(projectRoot, name);
      if (fs.existsSync(potentialPath)) {
        primaryConfigPath = potentialPath;
        break;
      }
    }

    if (!primaryConfigPath) {
      console.log(`TsConfigHelper: No tsconfig.json or tsconfig.base.json found in ${projectRoot}`);
      this.tsConfigCache.set(cacheKey, null);
      return null;
    }

    console.log(`TsConfigHelper: Found primary tsconfig: ${primaryConfigPath}`);

    let effectiveCompilerOptions: TsCompilerOptions = {};
    let effectiveBaseUrlResolutionDir = path.dirname(primaryConfigPath); // Default to primary config's directory

    // Recursive function to load and merge configs
    const processConfig = async (filePath: string): Promise<{ compilerOptions: TsCompilerOptions; baseUrlDir: string } | null> => {
      const loaded = await loadConfig(filePath);
      if (!loaded) return null;

      let currentCO = loaded.config.compilerOptions || {};
      let currentBaseUrlDir = loaded.dir;

      if (loaded.config.extends) {
        const extendedPath = path.resolve(loaded.dir, loaded.config.extends);
        console.log(`TsConfigHelper: Config ${path.basename(filePath)} extends ${loaded.config.extends}, resolved to: ${extendedPath}`);
        const baseResult = await processConfig(extendedPath);

        if (baseResult) {
          // Merge compilerOptions: current (derived) overrides base
          const mergedCO: TsCompilerOptions = { ...baseResult.compilerOptions, ...currentCO };
          if (baseResult.compilerOptions.paths && currentCO.paths) {
            mergedCO.paths = { ...baseResult.compilerOptions.paths, ...currentCO.paths };
          } else if (baseResult.compilerOptions.paths) {
            mergedCO.paths = baseResult.compilerOptions.paths;
          } else if (currentCO.paths) {
            mergedCO.paths = currentCO.paths;
          }
          currentCO = mergedCO;

          // Determine the baseUrlDir for resolving paths:
          // If the current config defines baseUrl, its directory is used.
          // Otherwise, the baseUrlDir from the extended config is used.
          if (!currentCO.baseUrl) { // If current doesn't have baseUrl, inherit from base
            currentCO.baseUrl = baseResult.compilerOptions.baseUrl;
            currentBaseUrlDir = baseResult.baseUrlDir; // And paths are relative to base's baseUrlDir
          }
          // If currentCO.baseUrl IS defined, currentBaseUrlDir (loaded.dir) is already correct.
        } else {
          console.warn(`TsConfigHelper: Could not load extended tsconfig: ${extendedPath}`);
        }
      }
      return { compilerOptions: currentCO, baseUrlDir: currentBaseUrlDir };
    };

    const result = await processConfig(primaryConfigPath);

    if (!result) {
      console.error(`TsConfigHelper: Failed to process primary tsconfig: ${primaryConfigPath}`);
      this.tsConfigCache.set(cacheKey, null);
      return null;
    }

    effectiveCompilerOptions = result.compilerOptions;
    effectiveBaseUrlResolutionDir = result.baseUrlDir; // This is the directory of the config that effectively defines baseUrl (or where it's inherited from)

    // The final absoluteBaseUrl is `effectiveBaseUrlResolutionDir` + `effectiveCompilerOptions.baseUrl`
    // If `effectiveCompilerOptions.baseUrl` is undefined, it defaults to `.` (meaning `effectiveBaseUrlResolutionDir` itself).
    const absoluteBaseUrl = path.resolve(
        effectiveBaseUrlResolutionDir,
        effectiveCompilerOptions.baseUrl || '.'
    );

    const processedConfig: ProcessedTsConfig = {
      absoluteBaseUrl, // This is the crucial part: the base for resolving path mappings
      paths: effectiveCompilerOptions.paths || {},
      sourceFilePath: primaryConfigPath, // The entry point tsconfig
    };

    this.tsConfigCache.set(cacheKey, processedConfig);
    console.log(`TsConfigHelper: Loaded and parsed tsconfig. Effective BaseUrl for paths: ${absoluteBaseUrl}, Paths:`, JSON.stringify(processedConfig.paths, null, 2));
    return processedConfig;
  }

  // resolveImportPath remains the same as in the previous full code
  public static resolveImportPath(
      absoluteTargetModulePathNoExt: string,
      absoluteCurrentFilePath: string,
      processedTsConfig: ProcessedTsConfig | null,
      projectRoot: string // Fallback if no tsconfig
  ): string {
    if (processedTsConfig && processedTsConfig.paths && Object.keys(processedTsConfig.paths).length > 0) {
      const { absoluteBaseUrl, paths } = processedTsConfig; // absoluteBaseUrl is now correctly determined

      const sortedAliases = Object.keys(paths).sort((a, b) => {
        const aPrefix = a.replace(/\*$/, '');
        const bPrefix = b.replace(/\*$/, '');
        return bPrefix.length - aPrefix.length;
      });

      for (const aliasPattern of sortedAliases) {
        const pathMappings = paths[aliasPattern];

        for (const mappingPattern of pathMappings) {
          let aliasPrefix = aliasPattern;
          let aliasHasWildcard = false;
          if (aliasPattern.endsWith('/*')) {
            aliasPrefix = aliasPattern.slice(0, -2);
            aliasHasWildcard = true;
          } else if (aliasPattern.endsWith('*')) {
            aliasPrefix = aliasPattern.slice(0, -1);
            aliasHasWildcard = true;
          }

          let mappingPrefix = mappingPattern;
          let mappingHasWildcard = false;
          if (mappingPattern.endsWith('/*')) {
            mappingPrefix = mappingPattern.slice(0, -2);
            mappingHasWildcard = true;
          } else if (mappingPattern.endsWith('*')) {
            mappingPrefix = mappingPattern.slice(0, -1);
            mappingHasWildcard = true;
          }

          // IMPORTANT: mappingPrefix (e.g., "libs/core/ui/src/*") is relative to `absoluteBaseUrl`
          const absoluteMappingPrefixTarget = path.resolve(absoluteBaseUrl, mappingPrefix);

          if (aliasHasWildcard && mappingHasWildcard) {
            // Check if absoluteTargetModulePathNoExt starts with absoluteMappingPrefixTarget
            if (absoluteTargetModulePathNoExt.startsWith(absoluteMappingPrefixTarget) &&
                (absoluteTargetModulePathNoExt.length === absoluteMappingPrefixTarget.length ||
                    absoluteTargetModulePathNoExt[absoluteMappingPrefixTarget.length] === path.sep ||
                    absoluteMappingPrefixTarget.endsWith(path.sep)
                )
            ) {
              let targetSuffix = absoluteTargetModulePathNoExt.substring(absoluteMappingPrefixTarget.length);
              if (targetSuffix.startsWith(path.sep)) {
                targetSuffix = targetSuffix.substring(path.sep.length);
              }

              const finalAliasPrefix = (aliasPrefix.endsWith('/') || !targetSuffix) ? aliasPrefix : aliasPrefix + '/';
              const resolvedPath = (finalAliasPrefix + targetSuffix).replace(/\/\//g, '/');
              console.log(`TsConfigHelper: Alias match (wildcard): Target '${absoluteTargetModulePathNoExt}' -> '${resolvedPath}' (via alias '${aliasPattern}' -> mapping '${mappingPattern}' resolved from base '${absoluteBaseUrl}')`);
              return resolvedPath;
            }
          } else if (!aliasHasWildcard && !mappingHasWildcard) {
            // Exact match: target path (without ext) must be the resolved mapping
            if (absoluteTargetModulePathNoExt === absoluteMappingPrefixTarget) {
              console.log(`TsConfigHelper: Alias match (exact): Target '${absoluteTargetModulePathNoExt}' -> '${aliasPattern}' (via mapping '${mappingPattern}' resolved from base '${absoluteBaseUrl}')`);
              return aliasPattern;
            }
          }
        }
      }
    }

    const relativePath = getRelativeFilePath(absoluteCurrentFilePath, absoluteTargetModulePathNoExt);
    console.log(`TsConfigHelper: No alias match for '${absoluteTargetModulePathNoExt}', fallback to relative path: '${relativePath}'`);
    return relativePath;
  }
}
// --- TsConfigHelper END ---


// Enhanced caching and indexing
class AngularIndexer {
  private parser: Parser;
  private fileCache: Map<string, ComponentInfo> = new Map();
  private selectorToElement: Map<string, AngularElementData> = new Map();
  private fileWatcher: vscode.FileSystemWatcher | null = null;
  private projectRootPath: string = '';

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript);
  }

  public setProjectRoot(projectPath: string) {
    this.projectRootPath = projectPath;
    console.log(`AngularIndexer: Project root set to ${projectPath}`);
  }

  initializeWatcher(context: vscode.ExtensionContext, projectPath: string) {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
    if (!this.projectRootPath) {
      this.projectRootPath = projectPath;
    }

    const pattern = new vscode.RelativePattern(projectPath, '**/*.{component,directive,pipe}.ts');
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.fileWatcher.onDidCreate((uri) => {
      console.log(`File created: ${uri.fsPath}`);
      this.updateFileIndex(uri.fsPath, context);
    });

    this.fileWatcher.onDidChange((uri) => {
      console.log(`File changed: ${uri.fsPath}`);
      this.updateFileIndex(uri.fsPath, context);
    });

    this.fileWatcher.onDidDelete((uri) => {
      console.log(`File deleted: ${uri.fsPath}`);
      this.removeFromIndex(uri.fsPath, context);
    });

    context.subscriptions.push(this.fileWatcher);
    console.log(`AngularIndexer: File watcher initialized for pattern ${pattern.pattern}`);
  }

  private generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  private parseAngularElementWithTreeSitter(filePath: string, content: string): ComponentInfo | null {
    if (!this.projectRootPath) {
      console.error("❌ AngularIndexer.projectRootPath is not set. Cannot determine relative path for Tree-sitter parsing.");
      // Fallback or return null if projectRootPath is essential for relative path generation
      return this.parseAngularElementWithRegex(filePath, content);
    }

    try {
      // console.log(`🔍 Parsing file with Tree-sitter: ${path.basename(filePath)}`);
      const tree = this.parser.parse(content);
      const rootNode = tree.rootNode;
      let foundElement: ComponentInfo | null = null;

      const findClassInfo = (classNode: Parser.SyntaxNode): ComponentInfo | null => {
        let elementName: string | undefined;
        let isExported = false;

        if (classNode.parent && classNode.parent.type === 'export_statement') {
          if (classNode.parent.childForFieldName('declaration') === classNode ||
              classNode.parent.children.some(child => child === classNode)) {
            isExported = true;
          }
        }
        // Also handle `export class ...` directly without `export_statement` parent
        // This depends on the grammar, sometimes `export` is a modifier on `class_declaration`
        if (!isExported && classNode.children.some(c => c.type === 'export_keyword')) {
          isExported = true;
        }


        const nameIdentifier = classNode.childForFieldName('name');
        if (nameIdentifier && nameIdentifier.type === 'identifier') {
          elementName = content.slice(nameIdentifier.startIndex, nameIdentifier.endIndex);
        }

        if (!isExported || !elementName) {
          // console.log(`⚠️ Class ${elementName || 'unknown'} in ${path.basename(filePath)} is not exported or has no name`);
          return null;
        }

        // console.log(`✅ Found exported class: ${elementName} in ${path.basename(filePath)}`);

        let selector: string | undefined;
        let elementType: 'component' | 'directive' | 'pipe' | undefined;
        let pipeNameValue: string | undefined;

        const decorators = classNode.children.filter(child => child.type === 'decorator');
        // console.log(`🎨 Found ${decorators.length} decorators for ${elementName}`);

        for (const decoratorNode of decorators) {
          const callExprNode = decoratorNode.firstChild;
          if (callExprNode && callExprNode.type === 'call_expression') {
            const funcIdentNode = callExprNode.childForFieldName('function');
            if (funcIdentNode && funcIdentNode.type === 'identifier') {
              const decoratorName = content.slice(funcIdentNode.startIndex, funcIdentNode.endIndex);
              // console.log(`🏷️ Found decorator: @${decoratorName} for ${elementName}`);

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
            // console.log(`✅ Successfully parsed ${elementType}: ${elementName} with selector: ${finalSelector}`);
            return {
              path: path.relative(this.projectRootPath, filePath),
              name: elementName,
              selector: finalSelector,
              lastModified: fs.statSync(filePath).mtime.getTime(),
              hash: this.generateHash(content),
              type: elementType
            };
          } else {
            // console.log(`⚠️ No selector/name found for ${elementType}: ${elementName} in ${path.basename(filePath)}`);
          }
        }
        return null;
      };

      this.traverseNode(rootNode, (node) => {
        if (foundElement) return; // Already found one element in this file

        if (node.type === 'class_declaration') {
          const info = findClassInfo(node);
          if (info) {
            foundElement = info;
          }
        }
      });

      if (!foundElement) {
        // console.log(`⚠️ Tree-sitter parsing did not find an Angular element in ${path.basename(filePath)}, trying regex fallback`);
        return this.parseAngularElementWithRegex(filePath, content);
      }

      return foundElement;
    } catch (error) {
      console.error(`❌ Tree-sitter parsing error for ${filePath}:`, error);
      return this.parseAngularElementWithRegex(filePath, content); // Fallback on error
    }
  }

  private extractSelectorFromDecorator(decoratorCallExpressionNode: Parser.SyntaxNode, content: string): string | undefined {
    const argsNode = decoratorCallExpressionNode.childForFieldName('arguments');
    if (argsNode) {
      const objectNode = argsNode.children.find((child: Parser.SyntaxNode) => child.type === 'object');
      if (objectNode) {
        for (const propNode of objectNode.children) {
          if (propNode.type === 'property_assignment' || propNode.type === 'pair') {
            const nameNode = propNode.childForFieldName('key') || propNode.children.find(c => c.type === 'property_identifier');
            const valueNode = propNode.childForFieldName('value') || propNode.children.find(c => c.type === 'string');

            if (nameNode && valueNode && (nameNode.type === 'property_identifier' || nameNode.type === 'identifier') && valueNode.type === 'string') {
              const propName = content.slice(nameNode.startIndex, nameNode.endIndex);
              if (propName === 'selector') {
                const selectorValue = content.slice(valueNode.startIndex, valueNode.endIndex);
                return selectorValue.slice(1, -1);
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  private extractPipeNameFromDecorator(decoratorCallExpressionNode: Parser.SyntaxNode, content: string): string | undefined {
    const argsNode = decoratorCallExpressionNode.childForFieldName('arguments');
    if (argsNode) {
      const objectNode = argsNode.children.find((child: Parser.SyntaxNode) => child.type === 'object');
      if (objectNode) {
        for (const propNode of objectNode.children) {
          if (propNode.type === 'property_assignment' || propNode.type === 'pair') {
            const nameNode = propNode.childForFieldName('key') || propNode.children.find(c => c.type === 'property_identifier');
            const valueNode = propNode.childForFieldName('value') || propNode.children.find(c => c.type === 'string');

            if (nameNode && valueNode && (nameNode.type === 'property_identifier' || nameNode.type === 'identifier') && valueNode.type === 'string') {
              const propName = content.slice(nameNode.startIndex, nameNode.endIndex);
              if (propName === 'name') {
                const nameValue = content.slice(valueNode.startIndex, valueNode.endIndex);
                return nameValue.slice(1, -1);
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  private parseAngularElementWithRegex(filePath: string, content: string): ComponentInfo | null {
    if (!this.projectRootPath) {
      console.error("AngularIndexer.projectRootPath is not set for regex parsing. Cannot determine relative path.");
      return null;
    }
    const selectorRegex = /selector:\s*['"]([^'"]*)['"]/;
    const pipeNameRegex = /name:\s*['"]([^'"]*)['"]/;
    const classNameRegex = /export\s+class\s+(\w+)/;
    const fileName = path.basename(filePath);
    let elementType: 'component' | 'directive' | 'pipe';

    if (fileName.includes('.component.')) elementType = 'component';
    else if (fileName.includes('.directive.')) elementType = 'directive';
    else if (fileName.includes('.pipe.')) elementType = 'pipe';
    else return null;

    const classNameMatch = classNameRegex.exec(content);
    if (!classNameMatch?.[1]) return null;

    let selector: string | undefined;
    if (elementType === 'pipe') {
      selector = pipeNameRegex.exec(content)?.[1];
    } else {
      selector = selectorRegex.exec(content)?.[1];
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

  private traverseNode(node: Parser.SyntaxNode, callback: (node: Parser.SyntaxNode) => void) {
    callback(node);
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        this.traverseNode(child, callback);
      }
    }
  }

  private async updateFileIndex(filePath: string, context: vscode.ExtensionContext): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found, cannot update index: ${filePath}`);
        return;
      }
      if (!this.projectRootPath) {
        const globalProjectPath = getGlobalProjectPath();
        if (globalProjectPath) {
          this.setProjectRoot(globalProjectPath);
        } else {
          console.warn(`Project root path not set in AngularIndexer, cannot update index for ${filePath}`);
          return;
        }
      }

      const stats = fs.statSync(filePath);
      const lastModified = stats.mtime.getTime();
      const cached = this.fileCache.get(filePath);

      if (cached && cached.lastModified >= lastModified) return;

      const content = fs.readFileSync(filePath, 'utf-8');
      const hash = this.generateHash(content);

      if (cached && cached.hash === hash) {
        this.fileCache.set(filePath, { ...cached, lastModified });
        return;
      }

      const parsed = this.parseAngularElementWithTreeSitter(filePath, content);

      if (parsed) {
        if (cached && cached.selector !== parsed.selector) { // Selector might change
          this.selectorToElement.delete(cached.selector);
        }
        this.fileCache.set(filePath, parsed);
        this.selectorToElement.set(parsed.selector, new AngularElementData(parsed.path, parsed.name, parsed.type));
        console.log(`Updated index: ${parsed.selector} (${parsed.type}) -> ${parsed.path}`);
      } else {
        if (cached) {
          this.fileCache.delete(filePath);
          this.selectorToElement.delete(cached.selector);
          console.log(`Removed from index (parse failed or no longer valid): ${cached.selector} from ${filePath}`);
        }
      }
      await this.saveIndexToWorkspace(context);
    } catch (error) {
      console.error(`Error updating index for ${filePath}:`, error);
    }
  }

  private async removeFromIndex(filePath: string, context: vscode.ExtensionContext): Promise<void> {
    const cached = this.fileCache.get(filePath);
    if (cached) {
      this.fileCache.delete(filePath);
      this.selectorToElement.delete(cached.selector);
      await this.saveIndexToWorkspace(context);
      console.log(`Removed from index: ${cached.selector} from ${filePath}`);
    }
  }

  async generateFullIndex(projectPath: string, context: vscode.ExtensionContext): Promise<Map<string, AngularElementData>> {
    console.log('AngularIndexer: Starting full index generation...');
    this.setProjectRoot(projectPath);
    this.fileCache.clear();
    this.selectorToElement.clear();

    const angularFiles = this.getAngularFiles(projectPath);
    console.log(`AngularIndexer: Found ${angularFiles.length} potential Angular files for indexing.`);

    const batchSize = 20; // Process in batches
    for (let i = 0; i < angularFiles.length; i += batchSize) {
      const batch = angularFiles.slice(i, i + batchSize);
      const batchTasks = batch.map(file =>
          this.updateFileIndex(path.join(projectPath, file), context) // file is relative, join with projectPath
      );
      await Promise.all(batchTasks);
      console.log(`AngularIndexer: Indexed batch ${i/batchSize + 1} of ${Math.ceil(angularFiles.length/batchSize)}`);
    }

    console.log(`AngularIndexer: Indexed ${this.selectorToElement.size} Angular elements.`);
    await this.saveIndexToWorkspace(context);
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
        console.log(`AngularIndexer: Loaded ${this.selectorToElement.size} elements from workspace cache.`);
        // Ensure projectRootPath is set if loading from cache, it might not be set yet if extension just started
        if (!this.projectRootPath && this.fileCache.size > 0) {
          // Attempt to infer projectRootPath from a cached item if possible, or rely on global currentProjectPath
          const firstCachedItemPath = this.fileCache.values().next().value?.path;
          if (firstCachedItemPath) {
            // This is tricky as cached path is relative. We need absolute path of a file to get project root.
            // For now, rely on global currentProjectPath being set before this.
            const globalProjPath = getGlobalProjectPath();
            if (globalProjPath) this.setProjectRoot(globalProjPath);
          }
        }
        return true;
      }
    } catch (error) {
      console.error('AngularIndexer: Error loading index from workspace:', error);
    }
    console.log('AngularIndexer: No valid cache found in workspace.');
    return false;
  }

  private async saveIndexToWorkspace(context: vscode.ExtensionContext): Promise<void> {
    try {
      await context.workspaceState.update('angularFileCache', Object.fromEntries(this.fileCache));
      await context.workspaceState.update('angularSelectorToDataIndex', Object.fromEntries(this.selectorToElement));
      // console.log('AngularIndexer: Index saved to workspace state.');
    } catch (error) {
      console.error('AngularIndexer: Error saving index to workspace:', error);
    }
  }

  getElement(selector: string): AngularElementData | undefined {
    return this.selectorToElement.get(selector);
  }

  getAllSelectors(): IterableIterator<string> {
    return this.selectorToElement.keys();
  }

  private getAngularFiles(basePath: string): string[] {
    const angularFiles: string[] = [];
    const gitIgnorePath = path.join(basePath, '.gitignore');
    let gitIgnorePatterns: string[] = [];

    if (fs.existsSync(gitIgnorePath)) {
      try {
        const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
        gitIgnorePatterns = gitIgnoreContent.split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
      } catch (e) {
        console.warn("Could not read or parse .gitignore", e);
      }
    }

    // Convert basic gitignore patterns to regex. For robust solution, use a library like 'ignore'.
    const gitIgnoreRegexes = gitIgnorePatterns.map(pattern => {
      // Basic conversion:
      // Ends with / -> directory
      // Starts with / -> root
      // * -> [^/]*
      // ** -> .*
      let regexPattern = pattern;
      if (regexPattern.startsWith('/')) regexPattern = '^' + regexPattern.substring(1); // Anchor to root
      else if (!regexPattern.includes('/')) regexPattern = '(?:^|/)' + regexPattern; // Match anywhere if no slash

      regexPattern = regexPattern
          .replace(/\./g, '\\.')
          .replace(/\*\*/g, '.*') // Greedy match for **
          .replace(/\*/g, '[^/]*') // Non-greedy for * within path segment
          .replace(/\?/g, '[^/]');

      if (regexPattern.endsWith('/')) regexPattern += '.*'; // Match anything inside a dir
      else regexPattern += '(?:$|/.*)'; // Match file or anything inside if it's a dir pattern without trailing /

      try {
        return new RegExp(regexPattern);
      } catch (e) {
        // console.warn(`Invalid gitignore pattern converted to regex: ${pattern}`, e);
        return null;
      }
    }).filter(r => r !== null) as RegExp[];


    const isGitIgnored = (relativePath: string): boolean => {
      // Normalize path separators for comparison
      const normalizedPath = relativePath.replace(/\\/g, '/');
      return gitIgnoreRegexes.some(regex => regex.test(normalizedPath));
    };

    const excludedDirs = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.vscode', '.angular']);

    const traverseDirectory = (currentDirPath: string) => {
      try {
        const files = fs.readdirSync(currentDirPath);
        files.forEach((file) => {
          const fullPath = path.join(currentDirPath, file);
          const relativePathToRoot = path.relative(basePath, fullPath);

          if (isGitIgnored(relativePathToRoot)) {
            return;
          }

          try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              if (!excludedDirs.has(file)) {
                traverseDirectory(fullPath);
              }
            } else if (file.match(/\.(component|directive|pipe)\.ts$/)) {
              angularFiles.push(relativePathToRoot);
            }
          } catch (error) {
            // console.warn(`Skipping ${fullPath} due to stat error:`, error);
          }
        });
      } catch (error) {
        // console.warn(`Error reading directory ${currentDirPath}:`, error);
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
    console.log('AngularIndexer disposed.');
  }
}

// State
let angularIndexer: AngularIndexer;
let interval: NodeJS.Timeout | undefined;
let reindexInterval: number = 60; // Default minutes
let currentProjectPath: string | undefined;
let currentTsConfig: ProcessedTsConfig | null = null;

// Helpers
function getGlobalProjectPath(): string | undefined {
  return currentProjectPath;
}
function getGlobalTsConfig(): ProcessedTsConfig | null {
  return currentTsConfig;
}

function getConfiguration() {
  const config = vscode.workspace.getConfiguration('angular-auto-import');
  reindexInterval = config.get('index.refreshInterval', 60);
  console.log(`Configuration: reindexInterval set to ${reindexInterval} minutes.`);
  return config;
}

function getRelativeFilePath(fromFileAbs: string, toFileAbsNoExt: string): string {
  const relative = path.relative(path.dirname(fromFileAbs), toFileAbsNoExt);
  return relative.startsWith('.') ? relative : `./${relative}`;
}

function importElementToFile(element: AngularElementData, componentFilePathAbs: string): boolean {
  try {
    if (!currentProjectPath) {
      vscode.window.showErrorMessage('Project path is not defined. Cannot import element.');
      return false;
    }

    // element.path is relative to project root, e.g., "src/app/my.component.ts"
    const absoluteTargetModulePath = path.join(currentProjectPath, element.path);
    const absoluteTargetModulePathNoExt = switchFileType(absoluteTargetModulePath, ''); // e.g., /project/src/app/my.component

    const tsConfig = getGlobalTsConfig();
    const importPathString = TsConfigHelper.resolveImportPath(
        absoluteTargetModulePathNoExt,
        componentFilePathAbs,
        tsConfig,
        currentProjectPath
    );
    console.log(`Resolved import path for ${element.name}: '${importPathString}'`);

    let importStr = `import { ${element.name} } from '${importPathString}';\n`;
    const fileContents = fs.readFileSync(componentFilePathAbs, 'utf-8');

    // Escape special characters in importPathString for regex
    const escapedImportPathString = importPathString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const importRegex = new RegExp(
        `import\\s*{[^}]*\\b${element.name}\\b[^}]*}\\s*from\\s*['"]${escapedImportPathString}['"]`, 'g'
    );
    const simplerImportRegex = new RegExp(`import\\s*{[^}]*\\b${element.name}\\b[^}]*}\\s*from`);

    if (simplerImportRegex.test(fileContents)) {
      console.log(`${element.name} seems to be already imported or a class with the same name is imported.`);
      if (importRegex.test(fileContents)) {
        console.log(`${element.name} is already correctly imported from '${importPathString}'.`);
      } else {
        console.log(`${element.name} is imported, but from a different path. Consider manual review if alias is preferred.`);
        // Optionally, here you could offer to replace the existing import if it's not using the preferred alias.
        // For now, we don't automatically replace.
      }
      // Still try to add to @Component.imports if not there
      const newFileContentsWithAnnotation = addImportToAnnotation(element, fileContents);
      if (newFileContentsWithAnnotation !== fileContents) {
        fs.writeFileSync(componentFilePathAbs, newFileContentsWithAnnotation);
        setTimeout(() => vscode.commands.executeCommand('editor.action.formatDocument'), 100);
        console.log(`Added ${element.name} to annotations in ${path.basename(componentFilePathAbs)}.`);
        return true;
      }
      return true; // Already imported, annotations checked
    }

    let newFileContents = importStr + fileContents;
    newFileContents = addImportToAnnotation(element, newFileContents);

    fs.writeFileSync(componentFilePathAbs, newFileContents);
    console.log(`Imported ${element.name} into ${path.basename(componentFilePathAbs)}.`);
    setTimeout(() => vscode.commands.executeCommand('editor.action.formatDocument'), 100);
    return true;
  } catch (e) {
    console.error('Error importing element:', e);
    vscode.window.showErrorMessage(`Error importing ${element.name}: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

function addImportToAnnotation(element: AngularElementData, fileContents: string): string {
  if (element.type === 'pipe') return fileContents; // Pipes are not added to @Component.imports

  const componentDecoratorRegex = /@Component\s*\(\s*(\{[\s\S]*?\})\s*\)/;
  let match = componentDecoratorRegex.exec(fileContents);

  if (!match) return fileContents; // No @Component decorator found

  const decoratorContent = match[1]; // The content inside { ... }
  const decoratorStartIndex = match.index + match[0].indexOf('{');

  const importsArrayRegex = /imports\s*:\s*\[([\s\S]*?)\]/;
  let importsMatch = importsArrayRegex.exec(decoratorContent);

  if (importsMatch) { // 'imports' array exists
    const currentImports = importsMatch[1].trim();
    if (new RegExp(`\\b${element.name}\\b`).test(currentImports)) {
      return fileContents; // Already in imports array
    }
    const newImports = currentImports ? `${currentImports.replace(/,\s*$/, '')}, ${element.name}` : element.name;
    const newDecoratorContent = decoratorContent.substring(0, importsMatch.index) +
        `imports: [${newImports}]` +
        decoratorContent.substring(importsMatch.index + importsMatch[0].length);
    return fileContents.substring(0, decoratorStartIndex) + newDecoratorContent + fileContents.substring(decoratorStartIndex + decoratorContent.length);

  } else { // 'imports' array does not exist, add it
    // Try to add it after common properties, or at the start of the object
    const commonPropsEndRegex = /(selector|templateUrl|styleUrls|styles|template)\s*:\s*[^,}\]]*?(,)?/;
    let lastPropMatch = null;
    let searchIndex = 0;
    let currentMatch;
    while((currentMatch = commonPropsEndRegex.exec(decoratorContent.substring(searchIndex))) !== null) {
      lastPropMatch = currentMatch;
      searchIndex += currentMatch.index + currentMatch[0].length;
    }

    const importsString = `imports: [${element.name}]`;
    let newDecoratorContent;

    if (lastPropMatch) { // Insert after the last common property
      const insertPoint = lastPropMatch.index + lastPropMatch[0].length;
      const prefix = decoratorContent.substring(0, insertPoint);
      const suffix = decoratorContent.substring(insertPoint);
      const separator = (lastPropMatch[2] || prefix.trim().endsWith('{')) ? ' ' : ', '; // Add comma if needed
      newDecoratorContent = prefix + separator + importsString + suffix;
    } else { // Insert at the beginning of the object (after '{')
      const firstBraceIndex = decoratorContent.indexOf('{');
      if (decoratorContent.trim() === '{}' || decoratorContent.trim() === '{ }' ) { // Empty object
        newDecoratorContent = `{ ${importsString} }`;
      } else {
        newDecoratorContent = decoratorContent.substring(0, firstBraceIndex + 1) + ` ${importsString},` + decoratorContent.substring(firstBraceIndex + 1);
      }
    }
    return fileContents.substring(0, decoratorStartIndex) + newDecoratorContent + fileContents.substring(decoratorStartIndex + decoratorContent.length);
  }
}


function switchFileType(filePath: string, newExtensionWithDotOrEmpty: string): string {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseWithoutExt = path.basename(filePath, ext); // e.g., 'my.component' from 'my.component.ts'

  if (newExtensionWithDotOrEmpty === '') {
    return path.join(dir, baseWithoutExt);
  } else {
    const finalExtension = newExtensionWithDotOrEmpty.startsWith('.') ? newExtensionWithDotOrEmpty : `.${newExtensionWithDotOrEmpty}`;
    return path.join(dir, `${baseWithoutExt}${finalExtension}`);
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
  const currentFileAbs = activeEditor.document.fileName;

  // Heuristic: if current file is HTML, find corresponding TS. Otherwise, assume current file is the TS file.
  let activeComponentFileAbs = currentFileAbs;
  if (currentFileAbs.endsWith('.html')) {
    activeComponentFileAbs = switchFileType(currentFileAbs, '.ts');
  }


  if (!fs.existsSync(activeComponentFileAbs)) {
    vscode.window.showErrorMessage(`Component file not found for ${path.basename(currentFileAbs)}. Expected ${path.basename(activeComponentFileAbs)} or current file is not a .ts file.`);
    return false;
  }

  const success = importElementToFile(element, activeComponentFileAbs);

  if (success) {
    vscode.window.showInformationMessage(`${element.type} '${element.name}' (selector: x) imported successfully into ${path.basename(activeComponentFileAbs)}.`);
  } else {
    // importElementToFile should show its own error
  }
  return success;
}

async function setAngularDataIndex(context: vscode.ExtensionContext) {
  if (!angularIndexer) {
    angularIndexer = new AngularIndexer();
  }
  const projectRoot = getGlobalProjectPath(); // Should be set by determineProjectPath via activate
  if (!projectRoot) {
    console.error("Project root not determined. Cannot set angular data index.");
    vscode.window.showErrorMessage("Angular Auto-Import: Project root could not be determined. Indexing aborted.");
    return;
  }
  angularIndexer.setProjectRoot(projectRoot);

  if (angularIndexer.loadFromWorkspace(context)) {
    console.log("Index loaded from workspace cache.");
    angularIndexer.initializeWatcher(context, projectRoot); // Ensure watcher is active
    return;
  }
  console.log("No cache found or cache invalid, performing full index.");
  await generateIndex(context); // This will also initialize watcher
}

async function generateIndex(context: vscode.ExtensionContext) {
  const folderPath = getGlobalProjectPath();
  if (!folderPath) {
    console.error("Project path not available for generating index.");
    vscode.window.showErrorMessage("Angular Auto-Import: Project path not set. Cannot generate index.");
    return;
  }
  if (!angularIndexer) {
    angularIndexer = new AngularIndexer();
  }
  angularIndexer.setProjectRoot(folderPath); // Ensure it's set before indexing

  await angularIndexer.generateFullIndex(folderPath, context);
  angularIndexer.initializeWatcher(context, folderPath); // Initialize/re-initialize watcher
}

function determineProjectPath(): string {
  const config = getConfiguration(); // Ensure config is loaded (for reindexInterval)
  let pathFromConfig = config.get<string>('projectPath');

  if (pathFromConfig && pathFromConfig.trim() !== "") {
    currentProjectPath = path.resolve(pathFromConfig); // Resolve to absolute path
    // Check if this path actually exists
    if (!fs.existsSync(currentProjectPath) || !fs.statSync(currentProjectPath).isDirectory()) {
      vscode.window.showWarningMessage(`Angular Auto-Import: Configured projectPath "${currentProjectPath}" does not exist or is not a directory. Falling back to workspace folder.`);
      pathFromConfig = undefined; // Invalidate to fallback
    } else {
      console.log(`Angular Auto-Import: Using configured project path: ${currentProjectPath}`);
      return currentProjectPath;
    }
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    // Heuristic: if multiple workspace folders, look for one with angular.json or package.json with @angular/core
    let bestGuessProjectRoot = workspaceFolders[0].uri.fsPath;
    if (workspaceFolders.length > 1) {
      for (const folder of workspaceFolders) {
        const angularJsonPath = path.join(folder.uri.fsPath, 'angular.json');
        const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');
        if (fs.existsSync(angularJsonPath)) {
          bestGuessProjectRoot = folder.uri.fsPath;
          break;
        }
        if (fs.existsSync(packageJsonPath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            if (pkg.dependencies?.['@angular/core'] || pkg.devDependencies?.['@angular/core']) {
              bestGuessProjectRoot = folder.uri.fsPath;
              break;
            }
          } catch (e) { /* ignore parse error */ }
        }
      }
    }
    currentProjectPath = bestGuessProjectRoot;
  } else {
    vscode.window.showErrorMessage('Angular Auto-Import: No workspace folder found and no valid project path configured. Please set "angular-auto-import.projectPath" or open a folder.');
    throw new Error('No workspace folder found and no valid project path configured.');
  }
  console.log(`Angular Auto-Import: Using project path: ${currentProjectPath}`);
  return currentProjectPath;
}

export async function activate(activationContext: vscode.ExtensionContext) {
  try {
    console.log('🚀 Angular Auto-Import: Starting activation...');

    getConfiguration(); // Loads reindexInterval, called by determineProjectPath too
    currentProjectPath = determineProjectPath(); // Sets global currentProjectPath

    if (!currentProjectPath) {
      // determineProjectPath should throw or show error if it fails critically
      console.error("Angular Auto-Import: Activation failed, project path could not be determined.");
      return;
    }
    console.log(`📁 Project path determined: ${currentProjectPath}`);

    // Load TsConfig after project path is determined
    TsConfigHelper.clearCache(); // Clear any old cache
    currentTsConfig = await TsConfigHelper.findAndParseTsConfig(currentProjectPath);
    if (currentTsConfig) {
      console.log('🔧 Successfully loaded and processed tsconfig.json for path aliasing.');
    } else {
      console.log('⚠️ Could not load or parse tsconfig.json. Path aliasing will rely on relative paths.');
    }

    angularIndexer = new AngularIndexer();
    // angularIndexer.setProjectRoot(currentProjectPath); // setProjectRoot is called within setAngularDataIndex/generateIndex

    await setAngularDataIndex(activationContext); // This loads from cache or generates full index

    let indexSize = Array.from(angularIndexer.getAllSelectors()).length;
    console.log(`📊 Index size after initial load/index: ${indexSize} elements`);

    if (indexSize === 0 && currentProjectPath) { // Only force reindex if project path is valid
      console.warn('⚠️ Warning: Index is empty after initial load! Forcing reindex...');
      await generateIndex(activationContext); // generateIndex also sets project root and initializes watcher
      indexSize = Array.from(angularIndexer.getAllSelectors()).length;
      console.log(`📊 Index size after forced reindex: ${indexSize} elements`);
    }

    if (interval) clearInterval(interval);
    if (reindexInterval > 0 && currentProjectPath) {
      interval = setInterval(async () => {
        try {
          console.log('🔄 Periodic reindexing triggered...');
          // Reload tsconfig in case it changed
          TsConfigHelper.clearCache();
          if (getGlobalProjectPath()) { // Ensure project path is still valid
            currentTsConfig = await TsConfigHelper.findAndParseTsConfig(getGlobalProjectPath()!);
          }
          await generateIndex(activationContext);
        } catch (error) {
          console.error('❌ Error during periodic reindexing:', error);
        }
      }, reindexInterval * 1000 * 60);
      activationContext.subscriptions.push({ dispose: () => clearInterval(interval) });
    }

    const reindexCommand = vscode.commands.registerCommand('angular-auto-import.reindex', async () => {
      try {
        vscode.window.showInformationMessage('🔄 Angular Auto-Import: Reindexing started...');
        const projPath = getGlobalProjectPath(); // Re-determine or get current
        if (!projPath) {
          vscode.window.showErrorMessage('Angular Auto-Import: Project path not set. Cannot reindex.');
          return;
        }
        // Reload tsconfig
        TsConfigHelper.clearCache();
        currentTsConfig = await TsConfigHelper.findAndParseTsConfig(projPath);

        await generateIndex(activationContext);
        const newSize = Array.from(angularIndexer.getAllSelectors()).length;
        vscode.window.showInformationMessage(`✅ Angular Auto-Import: Reindex successful. Found ${newSize} elements.`);
      } catch (error) {
        console.error('❌ Reindex error:', error);
        vscode.window.showErrorMessage('❌ Angular Auto-Import: Reindexing failed. Check console for details.');
      }
    });
    activationContext.subscriptions.push(reindexCommand);

    activationContext.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { scheme: 'file', language: 'html' },
            new QuickfixImportProvider(angularIndexer), // Pass the indexer instance
            { providedCodeActionKinds: QuickfixImportProvider.providedCodeActionKinds }
        )
    );

    const importCmd = vscode.commands.registerCommand('angular-auto-import.importElement', (selector: string) => {
      if (!angularIndexer) {
        vscode.window.showErrorMessage('❌ Indexer not available.'); return;
      }
      const element = angularIndexer.getElement(selector);
      importElement(element);
    });
    activationContext.subscriptions.push(importCmd);

    const manualImportCmd = vscode.commands.registerCommand('angular-auto-import.manual.importElement', async () => {
      if (!angularIndexer) {
        vscode.window.showErrorMessage('❌ Indexer not available.'); return;
      }
      const allSelectors = Array.from(angularIndexer.getAllSelectors());
      const userInput = await vscode.window.showInputBox({
        prompt: 'Enter Angular element selector or pipe name',
        placeHolder: `e.g., ${allSelectors.length > 0 ? allSelectors.slice(0, Math.min(3, allSelectors.length)).join(', ') : 'my-component'}`,
      });
      if (userInput) {
        const element = angularIndexer.getElement(userInput);
        const success = importElement(element);
        if (!success && !element) {
          vscode.window.showErrorMessage(`❌ Angular element "${userInput}" not found in index.`);
        }
      }
    });
    activationContext.subscriptions.push(manualImportCmd);

    activationContext.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: 'html' },
            {
              provideCompletionItems(document, position) {
                if (!angularIndexer) return [];
                const linePrefix = document.lineAt(position).text.slice(0, position.character);
                const suggestions: CompletionItem[] = [];

                const tagRegex = /<([a-zA-Z0-9-]*)$/;
                const tagMatch = tagRegex.exec(linePrefix);
                const pipeRegex = /\|\s*([a-zA-Z0-9]*)$/;
                const pipeMatch = pipeRegex.exec(linePrefix);

                const currentWordRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9-]+/);
                const currentWord = currentWordRange ? document.getText(currentWordRange) : "";

                for (const selector of angularIndexer.getAllSelectors()) {
                  const element = angularIndexer.getElement(selector);
                  if (!element) continue;

                  let match = false;
                  let itemKind: vscode.CompletionItemKind;
                  let insertText = selector;

                  if (tagMatch && (element.type === 'component' || element.type === 'directive')) {
                    if (selector.toLowerCase().startsWith(tagMatch[1].toLowerCase())) {
                      match = true;
                      itemKind = vscode.CompletionItemKind.Class;
                    }
                  } else if (pipeMatch && element.type === 'pipe') {
                    if (selector.toLowerCase().startsWith(pipeMatch[1].toLowerCase())) {
                      match = true;
                      itemKind = vscode.CompletionItemKind.Function;
                    }
                  } else if (!tagMatch && !pipeMatch && currentWord.length > 0) { // General completion if not in specific context
                    if (selector.toLowerCase().startsWith(currentWord.toLowerCase())) {
                      match = true;
                      itemKind = element.type === 'pipe' ? vscode.CompletionItemKind.Function : vscode.CompletionItemKind.Class;
                      // For general completion, decide if it's a tag or pipe based on context or offer both?
                      // For now, assume if it's a component/directive, user wants to type a tag.
                      // If it's a pipe, they might be typing it after a `|`.
                      // This part might need more sophisticated context detection.
                      // Defaulting to selector for now.
                    }
                  }


                  if (match) {
                    const item = new CompletionItem(selector, itemKind!);
                    item.insertText = insertText; // For tags, just the selector. For pipes, just the name.
                    item.detail = `Angular Auto-Import: ${element.type}`;
                    item.documentation = new vscode.MarkdownString(`Import \`${element.name}\` (${element.type}) from \`${element.path}\`.\n\nSelector/Pipe Name: \`${selector}\``);
                    item.command = {
                      title: `Import ${element.name}`,
                      command: 'angular-auto-import.importElement',
                      arguments: [selector]
                    };
                    suggestions.push(item);
                  }
                }
                return suggestions;
              },
            },
            '<', '|', ' ' // Trigger characters
        )
    );

    console.log('✅ Angular Auto-Import extension activated successfully.');
    indexSize = Array.from(angularIndexer.getAllSelectors()).length; // Get final size
    vscode.window.showInformationMessage(`✅ Angular Auto-Import activated. ${indexSize} elements indexed. Path aliasing ${currentTsConfig ? 'enabled' : 'disabled (tsconfig not found/parsed)'}.`);

  } catch (error) {
    console.error('❌ Error activating Angular Auto-Import extension:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`❌ Failed to activate Angular Auto-Import: ${errorMessage}`);
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
  TsConfigHelper.clearCache();
  console.log('Angular Auto-Import extension deactivated.');
}

export class QuickfixImportProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];
  // Common Angular Language Service error codes for missing components/pipes
  public static readonly fixesDiagnosticCode: (string | number)[] = [
    'NG8001', // '%tag%' is not a known element if '%tag%' is an Angular component.
    'NG8002', // '%attribute%' is not a known attribute of element '%tag%'. (Less direct, but could be a directive)
    'NG8003', // No provider for %token% (Less direct)
    'NG8004', // No provider for %token% found on <element> (Less direct)
    'NG6004', // The pipe '%name%' could not be found!
    -998001, -998002, -998003, // Common codes from some linters/language services for unknown elements/pipes
    70001, // Example from a linter for unknown HTML tag
  ];

  constructor(private indexer: AngularIndexer) {} // Store the indexer instance

  provideCodeActions(
      document: vscode.TextDocument,
      range: vscode.Range | vscode.Selection,
      context: vscode.CodeActionContext,
      token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    if (!this.indexer) {
      console.warn("QuickfixProvider: Indexer not available.");
      return [];
    }
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
    if (diagnostic.source && diagnostic.source.toLowerCase().includes('angular')) { // Prioritize Angular's own diagnostics
      if (diagnostic.code) {
        const codeStr = String(diagnostic.code);
        if (QuickfixImportProvider.fixesDiagnosticCode.some(c => String(c) === codeStr)) {
          return true;
        }
      }
    }
    // Generic message checks as fallback
    const message = diagnostic.message.toLowerCase();
    return message.includes('is not a known element') ||
        (message.includes('pipe') && message.includes('could not be found')) ||
        message.includes('unknown html tag') || // For some HTML linters
        message.includes('unknown element') ||
        message.includes('unknown pipe');
  }

  private createQuickFixesForDiagnostic(
      document: vscode.TextDocument,
      diagnostic: vscode.Diagnostic
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    let extractedTerm = document.getText(diagnostic.range).trim(); // Term directly from diagnostic range
    const message = diagnostic.message;
    let termFromMessage: string | null = null;

    // Try to extract term more reliably from message patterns
    const knownElementMatch = /['"]([^'"]+)['"]\s+is\s+not\s+a\s+known\s+element/i.exec(message);
    if (knownElementMatch && knownElementMatch[1]) {
      termFromMessage = knownElementMatch[1];
    } else {
      const pipeMatch = /(?:pipe|The pipe)\s+['"]([^'"]+)['"]\s+(?:could not be found|is not found)/i.exec(message);
      if (pipeMatch && pipeMatch[1]) {
        termFromMessage = pipeMatch[1];
      } else {
        const unknownHtmlTagMatch = /unknown html tag\s+['"]([^'"]+)['"]/i.exec(message);
        if (unknownHtmlTagMatch && unknownHtmlTagMatch[1]) {
          termFromMessage = unknownHtmlTagMatch[1];
        }
      }
    }

    const selectorToSearch = this.extractSelector(termFromMessage || extractedTerm);

    if (selectorToSearch) {
      const elementData = this.indexer.getElement(selectorToSearch);
      if (elementData) {
        const action = this.createCodeAction(elementData, selectorToSearch, selectorToSearch, diagnostic);
        if (action) actions.push(action);
      } else {
        const partialMatches = this.findPartialMatches(selectorToSearch);
        partialMatches.forEach(matchData => {
          const partialAction = this.createCodeAction(matchData, matchData.selector, selectorToSearch, diagnostic);
          if (partialAction) actions.push(partialAction);
        });
      }
    }
    return actions;
  }

  private extractSelector(text: string): string {
    // Remove < > and attributes if present, e.g. <my-comp ...> -> my-comp
    text = text.replace(/^<([a-zA-Z0-9-]+)[\s\S]*?>?$/, '$1');
    // If it was a pipe expression like 'value | myPipe', text might be 'myPipe'
    const pipeMatch = text.match(/\|\s*([a-zA-Z0-9_-]+)/); // Allow underscore and hyphen in pipe names
    if (pipeMatch && pipeMatch[1]) return pipeMatch[1];

    return text.trim().split(/\s+/)[0]; // Take the first part if there are spaces (e.g. attributes)
  }

  private findPartialMatches(searchTerm: string): Array<AngularElementData & {selector: string}> {
    if (!this.indexer) return [];
    const matches: Array<AngularElementData & {selector: string}> = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    for (const indexedSelector of this.indexer.getAllSelectors()) {
      const element = this.indexer.getElement(indexedSelector);
      if (element) {
        // Prioritize matches where the indexed selector *starts with* the search term (more relevant for typos)
        // or if the search term is a substring of the indexed selector.
        if (indexedSelector.toLowerCase().startsWith(lowerSearchTerm) ||
            indexedSelector.toLowerCase().includes(lowerSearchTerm) ||
            lowerSearchTerm.includes(indexedSelector.toLowerCase())) { // For cases where diagnostic gives a partial name
          matches.push({ ...element, selector: indexedSelector });
        }
      }
    }
    // Sort by relevance: exact start, then includes, then by length
    return matches.sort((a,b) => {
      const aStarts = a.selector.toLowerCase().startsWith(lowerSearchTerm);
      const bStarts = b.selector.toLowerCase().startsWith(lowerSearchTerm);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.selector.length - b.selector.length;
    }).slice(0, 5); // Limit to 5 suggestions
  }

  private createCodeAction(
      element: AngularElementData,
      elementActualSelector: string,
      originalTermFromDiagnostic: string,
      diagnostic?: vscode.Diagnostic
  ): vscode.CodeAction | null {
    const actionTitle = `Import ${element.name} (${element.type}) for <${elementActualSelector}>`;
    const action = new vscode.CodeAction(actionTitle, vscode.CodeActionKind.QuickFix);

    action.command = {
      title: `Import ${element.type} ${element.name}`,
      command: 'angular-auto-import.importElement',
      arguments: [elementActualSelector]
    };

    if (diagnostic) {
      action.diagnostics = [diagnostic];
    }
    // Prefer if it's a direct match for a component/directive or an exact match for a pipe
    action.isPreferred = (elementActualSelector.toLowerCase() === originalTermFromDiagnostic.toLowerCase());
    return action;
  }
}