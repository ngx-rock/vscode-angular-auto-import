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
  isLibraryElement?: boolean; // Optional for backward compatibility with cache
}

class AngularElementData {
  path: string; // Relative to project root
  name: string;
  type: 'component' | 'directive' | 'pipe';
  isLibraryElement: boolean;

  constructor(path: string, name: string, type: 'component' | 'directive' | 'pipe', isLibraryElement: boolean = false) {
    this.path = path;
    this.name = name;
    this.type = type;
    this.isLibraryElement = isLibraryElement;
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

  public static isComponentStandalone(filePath: string, fileContent?: string): boolean {
    const content = fileContent || fs.readFileSync(filePath, 'utf-8');
    const parser = new Parser(); // Consider sharing parser instance if performance becomes an issue
    parser.setLanguage(TypeScript);
    const tree = parser.parse(content);
    const rootNode = tree.rootNode;
    let isStandalone = false;

    function findStandaloneInDecorator(node: Parser.SyntaxNode) {
        if (node.type === 'decorator' && node.firstChild?.type === 'call_expression') {
            const callExpr = node.firstChild;
            const funcIdent = callExpr.childForFieldName('function');
            if (funcIdent && content.slice(funcIdent.startIndex, funcIdent.endIndex) === 'Component') {
                const args = callExpr.childForFieldName('arguments');
                if (args) {
                    const objectNode = args.children.find(child => child.type === 'object');
                    if (objectNode) {
                        for (const propAssignment of objectNode.children) {
                            if (propAssignment.type === 'property_assignment' || propAssignment.type === 'pair') {
                                const keyNode = propAssignment.childForFieldName('key');
                                const valueNode = propAssignment.childForFieldName('value');
                                if (keyNode && valueNode && content.slice(keyNode.startIndex, keyNode.endIndex) === 'standalone') {
                                    if (valueNode.type === 'true' || (valueNode.type === 'identifier' && content.slice(valueNode.startIndex, valueNode.endIndex) === 'true')) {
                                        isStandalone = true;
                                        return; // Found it
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (isStandalone) return;
        for (const child of node.children) {
            if (isStandalone) break;
            findStandaloneInDecorator(child);
        }
    }

    findStandaloneInDecorator(rootNode);
    return isStandalone;
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
      console.error("❌ AngularIndexer.projectRootPath is not set. Cannot determine relative path or library status for Tree-sitter parsing.");
      return this.parseAngularElementWithRegex(filePath, content); // Regex also needs projectRootPath, but call it for consistency
    }

    // Determine if the file is part of a library based on its absolute path
    // A file is a library element if its path includes '/node_modules/' *and* this node_modules is relevant to the project root.
    // Simple check: if 'node_modules' is in the path segments *after* the project root part.
    const relativePathForLibCheck = path.relative(this.projectRootPath, filePath);
    const isLibraryElement = relativePathForLibCheck.includes('node_modules') || filePath.includes(path.sep + 'node_modules' + path.sep);
    // console.log(`File: ${filePath}, Relative: ${relativePathForLibCheck}, IsLibrary: ${isLibraryElement}`);


    try {
      // console.log(`🔍 Parsing file with Tree-sitter: ${path.basename(filePath)}, isLibrary: ${isLibraryElement}`);
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

        // Attempt 1: Parse Decorators
        const decorators = classNode.children.filter(child => child.type === 'decorator');
        for (const decoratorNode of decorators) {
          const callExprNode = decoratorNode.firstChild;
          if (callExprNode && callExprNode.type === 'call_expression') {
            const funcIdentNode = callExprNode.childForFieldName('function');
            if (funcIdentNode && funcIdentNode.type === 'identifier') {
              const decoratorNameText = content.slice(funcIdentNode.startIndex, funcIdentNode.endIndex);
              if (decoratorNameText === 'Component') {
                elementType = 'component';
                selector = this.extractSelectorFromDecorator(callExprNode, content);
                break; 
              } else if (decoratorNameText === 'Directive') {
                elementType = 'directive';
                selector = this.extractSelectorFromDecorator(callExprNode, content);
                break;
              } else if (decoratorNameText === 'Pipe') {
                elementType = 'pipe';
                pipeNameValue = this.extractPipeNameFromDecorator(callExprNode, content);
                break;
              }
            }
          }
        }

        // Attempt 2: Parse static ɵcmp, ɵdir, ɵpipe properties if decorators didn't yield results
        if (elementName && !elementType) { // Only proceed if decorators didn't define the type
            const classBody = classNode.childForFieldName('body'); // class_body in tree-sitter
            if (classBody) {
                for (const memberNode of classBody.children) {
                    if (memberNode.type === 'public_static_field_definition' || memberNode.type === 'field_definition') { // field_definition can also have static keyword
                        let isStatic = memberNode.type === 'public_static_field_definition';
                        if (memberNode.type === 'field_definition') {
                            for (const child of memberNode.children) {
                                if (child.type === 'static_keyword') isStatic = true;
                            }
                        }
                        if (!isStatic) continue;

                        const nameNode = memberNode.childForFieldName('name');
                        const valueNode = memberNode.childForFieldName('value');

                        if (nameNode && valueNode && nameNode.type === 'property_identifier') {
                            const staticPropName = content.slice(nameNode.startIndex, nameNode.endIndex);
                            // console.log(`Found static property: ${staticPropName} in ${elementName}`);
                            
                            if (valueNode.type === 'call_expression') {
                                if (staticPropName === 'ɵcmp') {
                                    elementType = 'component';
                                    selector = this.extractArgumentFromStaticDeclaration(valueNode, 1, content); // Selector is usually 2nd arg (index 1)
                                    // console.log(`Parsed ${elementName} as component via ɵcmp, selector: ${selector}`);
                                    break;
                                } else if (staticPropName === 'ɵdir') {
                                    elementType = 'directive';
                                    selector = this.extractArgumentFromStaticDeclaration(valueNode, 1, content); // Selector is usually 2nd arg (index 1)
                                    // console.log(`Parsed ${elementName} as directive via ɵdir, selector: ${selector}`);
                                    break;
                                } else if (staticPropName === 'ɵpipe') {
                                    elementType = 'pipe';
                                    pipeNameValue = this.extractArgumentFromStaticDeclaration(valueNode, 1, content); // Pipe name is usually 2nd arg (index 1)
                                    // console.log(`Parsed ${elementName} as pipe via ɵpipe, name: ${pipeNameValue}`);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (elementName && elementType) {
          const finalSelector = elementType === 'pipe' ? pipeNameValue : selector;
          if (finalSelector) {
            // console.log(`✅ Successfully parsed ${elementType} (${filePath.endsWith('.d.ts')? 'd.ts' : 'ts'}): ${elementName} with selector: ${finalSelector}`);
            return {
              path: path.relative(this.projectRootPath, filePath), // Store path relative to project root
              name: elementName,
              selector: finalSelector,
              lastModified: fs.statSync(filePath).mtime.getTime(),
              hash: this.generateHash(content),
              type: elementType,
              isLibraryElement: isLibraryElement
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
      // First child of arguments is usually an 'object' node containing properties
      const objectNode = argsNode.children.find((child: Parser.SyntaxNode) => child.type === 'object' || child.type === 'object_pattern');
      if (objectNode) {
        for (const propNode of objectNode.children) {
          // Properties can be 'property_assignment' or 'pair' (in some contexts like JSON-like objects)
          if (propNode.type === 'property_assignment' || propNode.type === 'pair') {
            const nameNode = propNode.childForFieldName('key') || propNode.children.find(c => c.type === 'property_identifier' || c.type === 'identifier');
            const valueNode = propNode.childForFieldName('value');

            if (nameNode && valueNode) {
              const propName = content.slice(nameNode.startIndex, nameNode.endIndex);
              if (propName === 'selector') {
                // Value node can be a 'string' or 'template_string'
                if (valueNode.type === 'string') {
                  const selectorValue = content.slice(valueNode.startIndex, valueNode.endIndex);
                  return selectorValue.slice(1, -1); // Remove quotes
                } else if (valueNode.type === 'template_string') {
                     // Template strings are `template_content` for tree-sitter-typescript
                     // For simple template strings like `selector: \`my-selector\``
                     const templateContent = valueNode.children.find(c => c.type === 'string_fragment' || c.type === 'template_content');
                     if (templateContent) {
                         return content.slice(templateContent.startIndex, templateContent.endIndex);
                     }
                }
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
      const objectNode = argsNode.children.find((child: Parser.SyntaxNode) => child.type === 'object' || child.type === 'object_pattern');
      if (objectNode) {
        for (const propNode of objectNode.children) {
          if (propNode.type === 'property_assignment' || propNode.type === 'pair') {
            const nameNode = propNode.childForFieldName('key') || propNode.children.find(c => c.type === 'property_identifier' || c.type === 'identifier');
            const valueNode = propNode.childForFieldName('value');
            
            if (nameNode && valueNode) {
              const propName = content.slice(nameNode.startIndex, nameNode.endIndex);
              if (propName === 'name') {
                if (valueNode.type === 'string') {
                  const nameValue = content.slice(valueNode.startIndex, valueNode.endIndex);
                  return nameValue.slice(1, -1); // Remove quotes
                } else if (valueNode.type === 'template_string') {
                    const templateContent = valueNode.children.find(c => c.type === 'string_fragment' || c.type === 'template_content');
                    if (templateContent) {
                        return content.slice(templateContent.startIndex, templateContent.endIndex);
                    }
                }
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  // Helper for static ɵcmp, ɵdir, ɵpipe declarations
  private extractArgumentFromStaticDeclaration(callExpressionNode: Parser.SyntaxNode, argumentIndex: number, content: string): string | undefined {
    const argsNode = callExpressionNode.childForFieldName('arguments');
    if (argsNode && argsNode.children.length > argumentIndex) {
        const targetArgNode = argsNode.children[argumentIndex];
        // Argument can be a 'string' (e.g. "my-selector") or 'identifier' (e.g. referring to a const)
        // or template_string
        if (targetArgNode) {
            if (targetArgNode.type === 'string') {
                const argValue = content.slice(targetArgNode.startIndex, targetArgNode.endIndex);
                return argValue.slice(1, -1); // Remove quotes
            } else if (targetArgNode.type === 'template_string') {
                // For simple template strings like \`my-selector\`
                const templateContent = targetArgNode.children.find(c => c.type === 'string_fragment' || c.type === 'template_content');
                if (templateContent) {
                    return content.slice(templateContent.startIndex, templateContent.endIndex);
                }
            }
            // Less commonly, it might be an identifier if the selector is defined as a const elsewhere,
            // or an array_literal (e.g. for `exportAs`). For selectors, we mostly expect strings.
            // console.log(`Static declaration argument type not handled: ${targetArgNode.type} for index ${argumentIndex}`);
        }
    }
    return undefined;
  }

  private parseAngularElementWithRegex(filePath: string, content: string): ComponentInfo | null {
    if (!this.projectRootPath) {
      console.error("AngularIndexer.projectRootPath is not set for regex parsing. Cannot determine relative path or library status.");
      return null;
    }

    const relativePathForLibCheck = path.relative(this.projectRootPath, filePath);
    const isLibraryElement = relativePathForLibCheck.includes('node_modules') || filePath.includes(path.sep + 'node_modules' + path.sep);
    // console.log(`File (regex): ${filePath}, Relative: ${relativePathForLibCheck}, IsLibrary: ${isLibraryElement}`);

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
        path: path.relative(this.projectRootPath, filePath), // Store path relative to project root
        name: classNameMatch[1],
        selector,
        lastModified: fs.statSync(filePath).mtime.getTime(),
        hash: this.generateHash(content),
        type: elementType,
        isLibraryElement: isLibraryElement
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
        if (cached && cached.selector !== parsed.selector) {
          this.selectorToElement.delete(cached.selector);
        }
        this.fileCache.set(filePath, parsed); // parsed now contains isLibraryElement
        this.selectorToElement.set(
            parsed.selector,
            new AngularElementData(parsed.path, parsed.name, parsed.type, parsed.isLibraryElement || false)
        );
        console.log(`Updated index: ${parsed.selector} (${parsed.type}${parsed.isLibraryElement ? ', lib' : ''}) -> ${parsed.path}`);
      } else {
        if (cached) {
          this.fileCache.delete(filePath);
          this.selectorToElement.delete(cached.selector);
          console.log(`Removed from index (parse failed/no longer valid): ${cached.selector} from ${filePath}`);
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
        // Ensure isLibraryElement is handled, defaulting to false if not present in old cache
        this.selectorToElement = new Map(Object.entries(storedIndex).map(([key, value]) => [
          key,
          new AngularElementData(value.path, value.name, value.type, value.isLibraryElement || false)
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
    const projectAngularFiles: string[] = []; // For files relative to project root
    const libraryAngularFiles: string[] = []; // For absolute paths from node_modules

    // --- Part 1: Scan project files (excluding node_modules initially) ---
    const gitIgnorePath = path.join(basePath, '.gitignore');
    let gitIgnorePatterns: string[] = [];

    if (fs.existsSync(gitIgnorePath)) {
      try {
        const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
        gitIgnorePatterns = gitIgnoreContent.split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
      } catch (e) {
        console.warn("Could not read or parse .gitignore for project files", e);
      }
    }

    const gitIgnoreRegexes = gitIgnorePatterns.map(pattern => {
      let regexPattern = pattern;
      if (regexPattern.startsWith('/')) regexPattern = '^' + regexPattern.substring(1);
      else if (!regexPattern.includes('/')) regexPattern = '(?:^|/)' + regexPattern;
      regexPattern = regexPattern.replace(/\./g, '\\.').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]');
      if (regexPattern.endsWith('/')) regexPattern += '.*';
      else regexPattern += '(?:$|/.*)';
      try { return new RegExp(regexPattern); } catch (e) { return null; }
    }).filter(r => r !== null) as RegExp[];

    const isGitIgnored = (relativePath: string): boolean => {
      const normalizedPath = relativePath.replace(/\\/g, '/');
      return gitIgnoreRegexes.some(regex => regex.test(normalizedPath));
    };

    const projectExcludedDirs = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.vscode', '.angular']); // Standard exclusions for project scan

    const traverseProjectDirectory = (currentDirPath: string) => {
      try {
        const files = fs.readdirSync(currentDirPath);
        files.forEach((file) => {
          const fullPath = path.join(currentDirPath, file);
          const relativePathToRoot = path.relative(basePath, fullPath);

          if (isGitIgnored(relativePathToRoot)) return;

          try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              if (!projectExcludedDirs.has(file)) { // Use project specific exclusions
                traverseProjectDirectory(fullPath);
              }
            } else if (file.match(/\.(component|directive|pipe)\.ts$/)) {
              projectAngularFiles.push(relativePathToRoot); // Store relative path for project files
            }
          } catch (statError) {
            // console.warn(`Skipping ${fullPath} in project scan due to stat error:`, statError);
          }
        });
      } catch (readDirError) {
        // console.warn(`Error reading project directory ${currentDirPath}:`, readDirError);
      }
    };

    if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
      console.log(`AngularIndexer: Scanning project path for Angular files: ${basePath}`);
      traverseProjectDirectory(basePath);
      console.log(`AngularIndexer: Found ${projectAngularFiles.length} potential Angular files in project (excluding node_modules).`);
    }

    // --- Part 2: Scan node_modules for library files ---
    console.log(`AngularIndexer: Starting scan of node_modules dependencies in ${basePath}`);
    const packageJsonPath = path.join(basePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);
        // As per requirement, only 'dependencies'. If 'devDependencies' are needed, they can be added.
        const dependencies = packageJson.dependencies || {};

        for (const depName in dependencies) {
          const libPath = path.join(basePath, 'node_modules', depName);
          if (!fs.existsSync(libPath) || !fs.statSync(libPath).isDirectory()) {
            // console.log(`AngularIndexer: Dependency ${depName} not found or not a directory at ${libPath}`);
            continue;
          }

          const libPackageJsonPath = path.join(libPath, 'package.json');
          let libPackageJson: any = {};
          if (fs.existsSync(libPackageJsonPath)) {
            try {
                 libPackageJson = JSON.parse(fs.readFileSync(libPackageJsonPath, 'utf-8'));
            } catch (e) {
                console.warn(`AngularIndexer: Could not parse package.json for ${depName}`, e);
            }
          }
            
          const entryPointDirectories: Set<string> = new Set(); // Stores absolute paths to directories to scan

          const addDirContainingFile = (filePathField: string | undefined) => {
            if (filePathField) {
              const dir = path.dirname(path.resolve(libPath, filePathField)); 
              if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
                entryPointDirectories.add(dir);
              }
            }
          };
            
          const addDirIfExists = (dirPathField: string | undefined) => {
              if (dirPathField) {
                  const absoluteDirPath = path.resolve(libPath, dirPathField);
                  if(fs.existsSync(absoluteDirPath) && fs.statSync(absoluteDirPath).isDirectory()){
                      entryPointDirectories.add(absoluteDirPath);
                  }
              }
          };

          addDirContainingFile(libPackageJson.typings);
          addDirContainingFile(libPackageJson.types);
          addDirContainingFile(libPackageJson.module);
          addDirContainingFile(libPackageJson.main); 

          if (libPackageJson.exports) {
            const exportsField = libPackageJson.exports;
            if (typeof exportsField === 'string') {
              addDirContainingFile(exportsField);
            } else if (typeof exportsField === 'object' && exportsField !== null) {
              Object.values(exportsField).forEach((value: any) => {
                if (typeof value === 'string') {
                  addDirContainingFile(value);
                } else if (typeof value === 'object' && value !== null) {
                  addDirContainingFile(value.types);
                  addDirContainingFile(value.import);
                  addDirContainingFile(value.default);
                }
              });
            }
          }
            
          if (entryPointDirectories.size === 0) { 
              const commonLibDirs = ['dist', 'lib', 'esm2015', 'fesm2015', 'esm5', 'fesm5', 'bundles', 'src', 'out', 'release'];
              commonLibDirs.forEach(dir => addDirIfExists(dir));
          }
          entryPointDirectories.add(libPath); // Always consider the root

          const scannedFilesForLib = new Set<string>(); 
          const visitedDirsForLib = new Set<string>();

          const traverseLibraryDirectory = (currentLibScanPath: string, depth: number = 0) => {
            if (depth > 7 || visitedDirsForLib.has(currentLibScanPath)) { 
                return; 
            }
            visitedDirsForLib.add(currentLibScanPath);

            try {
              const items = fs.readdirSync(currentLibScanPath);
              items.forEach((item) => {
                const fullItemPath = path.resolve(currentLibScanPath, item); 
                
                if (item === 'node_modules' || item === '.git' || item.startsWith('.')) { 
                    return;
                }

                try {
                  const stat = fs.statSync(fullItemPath);
                  if (stat.isDirectory()) {
                    const lowerItem = item.toLowerCase();
                    if (!['test', 'tests', 'doc', 'docs', 'e2e', 'examples', '__tests__', 'spec', 'fixture', 'fixtures', 'demo', 'sample', 'samples', 'assets', 'coverage', 'scripts', 'tools', 'benchmark', 'jest', 'storybook', '.github', '.husky'].includes(lowerItem)) {
                      traverseLibraryDirectory(fullItemPath, depth + 1);
                    }
                  } else if (stat.isFile() && (fullItemPath.endsWith('.d.ts') || fullItemPath.endsWith('.ts'))) {
                    // Prioritize .d.ts by checking for it first, or by specific logic if needed.
                    // For now, just add if it matches the extension and potentially content.
                    // The filename check is loose; parsing will confirm.
                    if (item.match(/(\.component|\.directive|\.pipe)\.(d\.ts|ts)$/) || contentMightBeAngular(fullItemPath, fullItemPath.endsWith('.d.ts'))) {
                       if(!scannedFilesForLib.has(fullItemPath)){ 
                          libraryAngularFiles.push(fullItemPath); 
                          scannedFilesForLib.add(fullItemPath);
                       }
                    }
                  }
                } catch (itemStatError: any) {
                  // console.warn(`Skipping ${fullItemPath} in library ${depName} due to stat error:`, itemStatError.code || itemStatError.message);
                }
              });
            } catch (libDirError: any) {
              // console.warn(`Error reading library directory ${currentLibScanPath} for ${depName}:`, libDirError.code || libDirError.message);
            }
          };
            
          const contentMightBeAngular = (filePath: string, isDts: boolean): boolean => {
              try {
                  const content = fs.readFileSync(filePath, 'utf-8');
                  if (isDts) {
                      return content.includes('@Component') || content.includes('@Directive') || content.includes('@Pipe') ||
                             content.includes('ngComponentDef') || content.includes('ngDirectiveDef') || content.includes('ngPipeDef') ||
                             (content.includes('selector:') && content.includes('class ')) || 
                             (content.includes('template:') && content.includes('class '));
                  } else {
                      return content.includes('@Component') || content.includes('@Directive') || content.includes('@Pipe');
                  }
              } catch (e) {
                  // console.warn(`Could not read ${filePath} for content check:`, e);
                  return false; 
              }
          };

          const uniqueEntryPoints = Array.from(entryPointDirectories);
          uniqueEntryPoints.forEach(entryDir => {
            traverseLibraryDirectory(entryDir);
          });

          if (scannedFilesForLib.size > 0) {
              console.log(`AngularIndexer: Found ${scannedFilesForLib.size} potential Angular files in library ${depName}.`);
          }

        }
      } catch (packageJsonError) {
        console.error(`AngularIndexer: Error reading or parsing project package.json at ${packageJsonPath}:`, packageJsonError);
      }
    } else {
        console.log(`AngularIndexer: No package.json found at ${packageJsonPath}, skipping node_modules scan.`);
    }
    console.log(`AngularIndexer: Total library files found: ${libraryAngularFiles.length}`);
    return [...projectAngularFiles, ...libraryAngularFiles];
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

function importStandaloneBuiltInElement(className: string, sourcePackage: string, targetFilePathAbs: string): boolean {
  try {
    if (!fs.existsSync(targetFilePathAbs)) {
      vscode.window.showErrorMessage(`Target file not found: ${targetFilePathAbs}`);
      return false;
    }
    let fileContents = fs.readFileSync(targetFilePathAbs, 'utf-8');
    const importStatement = `import { ${className} } from '${sourcePackage}';`;

    // Check if the exact import already exists
    const escapedPackage = sourcePackage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const importRegex = new RegExp(`import\\s*{[^}]*\\b${className}\\b[^}]*}\\s*from\\s*['"]${escapedPackage}['"]`);
    if (importRegex.test(fileContents)) {
      console.log(`${className} from ${sourcePackage} is already imported in ${path.basename(targetFilePathAbs)}.`);
      return true; // Already imported
    }

    // Add the import statement
    // Basic: add to the top. More sophisticated: add after last import.
    const lines = fileContents.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^import\s+.*\s+from\s+['"].*['"];?$/)) {
        lastImportIndex = i;
      }
    }
    lines.splice(lastImportIndex + 1, 0, importStatement);
    fileContents = lines.join('\n');

    fs.writeFileSync(targetFilePathAbs, fileContents);
    console.log(`Imported ${className} from ${sourcePackage} into ${path.basename(targetFilePathAbs)}.`);
    // Formatting might be needed, can be triggered by a command
    // setTimeout(() => vscode.commands.executeCommand('editor.action.formatDocument'), 100); // Delay formatting until after all changes

    // Step 2: Add to @Component.imports array if it's a standalone component
    // We need to re-read content as it was modified by adding ES6 import
    fileContents = fs.readFileSync(targetFilePathAbs, 'utf-8');
    // We also need to ensure this component is indeed standalone before modifying its imports.
    // Assuming the command/caller ensures this check, or we add it here.
    // For now, let's assume this function is called when it's known to be a standalone component.
    // A shared parser instance would be ideal if this function is called frequently.
    const parser = new Parser();
    parser.setLanguage(TypeScript);
    const updatedFileContents = addSymbolToComponentImportsArray(className, fileContents, parser);

    if (updatedFileContents !== fileContents) {
        fs.writeFileSync(targetFilePathAbs, updatedFileContents);
        console.log(`Added ${className} to @Component.imports in ${path.basename(targetFilePathAbs)}.`);
    }

    setTimeout(() => vscode.commands.executeCommand('editor.action.formatDocument'), 100);
    return true;

  } catch (e) {
    console.error(`Error importing built-in element ${className} or updating imports array:`, e);
    vscode.window.showErrorMessage(`Error importing ${className}: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

// Helper function to add a symbol to the @Component decorator's 'imports' array
// Similar to addImportToAnnotation but specifically for `imports: []` and takes className directly.
function addSymbolToComponentImportsArray(symbolName: string, fileContent: string, parser: Parser): string {
  const tree = parser.parse(fileContent);
  const rootNode = tree.rootNode;
  let newFileContent = fileContent;
  let componentDecoratorNode: Parser.SyntaxNode | null = null;
  let decoratorObjectNode: Parser.SyntaxNode | null = null;

  // Find @Component decorator
  rootNode.children.forEach(node => {
    if (node.type === 'export_statement' && node.firstChild?.type === 'class_declaration') { // export class ...
        node.firstChild.children.forEach(classChild => {
            if (classChild.type === 'decorator' && classChild.firstChild?.type === 'call_expression') {
                const callExpr = classChild.firstChild;
                const funcIdent = callExpr.childForFieldName('function');
                if (funcIdent && fileContent.slice(funcIdent.startIndex, funcIdent.endIndex) === 'Component') {
                    componentDecoratorNode = callExpr;
                }
            }
        });
    } else if (node.type === 'class_declaration') { // class ... (might have decorator)
        node.children.forEach(classChild => {
            if (classChild.type === 'decorator' && classChild.firstChild?.type === 'call_expression') {
                const callExpr = classChild.firstChild;
                const funcIdent = callExpr.childForFieldName('function');
                if (funcIdent && fileContent.slice(funcIdent.startIndex, funcIdent.endIndex) === 'Component') {
                    componentDecoratorNode = callExpr;
                }
            }
        });
    }
  });
  
  if (!componentDecoratorNode) return fileContent; // No @Component decorator found

  const argsNode = componentDecoratorNode.childForFieldName('arguments');
  if (argsNode) {
    decoratorObjectNode = argsNode.children.find(child => child.type === 'object') || null;
  }

  if (!decoratorObjectNode) return fileContent; // No object literal in @Component arguments

  let importsArrayNode: Parser.SyntaxNode | null = null;
  let importsArrayContent = "";
  let importsPropertyExists = false;

  for (const propNode of decoratorObjectNode.children) {
    if (propNode.type === 'property_assignment' || propNode.type === 'pair') {
      const keyNode = propNode.childForFieldName('key');
      if (keyNode && fileContent.slice(keyNode.startIndex, keyNode.endIndex) === 'imports') {
        importsPropertyExists = true;
        const valueNode = propNode.childForFieldName('value');
        if (valueNode && valueNode.type === 'array') {
          importsArrayNode = valueNode;
          // Check if symbolName is already in the imports array
          for(const elementNode of importsArrayNode.children) {
            if (elementNode.type === 'identifier' && fileContent.slice(elementNode.startIndex, elementNode.endIndex) === symbolName) {
              return fileContent; // Already imported
            }
          }
          importsArrayContent = fileContent.slice(importsArrayNode.startIndex + 1, importsArrayNode.endIndex - 1).trim();
        }
        break;
      }
    }
  }

  const decoratorObjectStartIndex = decoratorObjectNode.startIndex;
  const decoratorObjectEndIndex = decoratorObjectNode.endIndex;
  const originalDecoratorText = fileContent.slice(decoratorObjectStartIndex, decoratorObjectEndIndex);
  let newDecoratorText = originalDecoratorText;

  if (importsArrayNode) { // 'imports' array exists
    const newImportsList = importsArrayContent ? `${importsArrayContent.replace(/,\s*$/, '')}, ${symbolName}` : symbolName;
    const importsArrayStartIndex = importsArrayNode.startIndex - decoratorObjectStartIndex;
    const importsArrayEndIndex = importsArrayNode.endIndex - decoratorObjectStartIndex;
    newDecoratorText = originalDecoratorText.substring(0, importsArrayStartIndex + 1) + newImportsList + originalDecoratorText.substring(importsArrayEndIndex -1);

  } else { // 'imports' array does not exist, or 'imports' property itself doesn't exist
    const newImportsProperty = `imports: [${symbolName}]`;
    if (decoratorObjectNode.children.filter(c => c.type !== '{' && c.type !== '}').length === 0 ) { // Empty object {}
        newDecoratorText = `{ ${newImportsProperty} }`;
    } else {
        // Find a place to insert the new 'imports' property.
        // Attempt to insert after 'standalone: true' or 'templateUrl' or 'selector'
        let lastKnownPropEndIndex = -1;
        const commonProps = ['standalone', 'selector', 'templateUrl', 'styleUrls', 'template', 'styles'];
        for (const propNode of decoratorObjectNode.children) {
            if (propNode.type === 'property_assignment' || propNode.type === 'pair') {
                const keyNode = propNode.childForFieldName('key');
                if (keyNode && commonProps.includes(fileContent.slice(keyNode.startIndex, keyNode.endIndex))) {
                    lastKnownPropEndIndex = propNode.endIndex - decoratorObjectStartIndex;
                }
            }
        }

        if (lastKnownPropEndIndex !== -1) {
            // Insert after the last known property
            const before = originalDecoratorText.substring(0, lastKnownPropEndIndex);
            const after = originalDecoratorText.substring(lastKnownPropEndIndex);
            // Check if a comma is needed
            const needsComma = !before.trim().endsWith(',') && !before.trim().endsWith('{');
            newDecoratorText = before + (needsComma ? ',' : '') + ` ${newImportsProperty}` + after;
        } else {
            // Insert at the beginning of the object (after '{')
            const firstBraceIndex = originalDecoratorText.indexOf('{');
            const before = originalDecoratorText.substring(0, firstBraceIndex + 1);
            const after = originalDecoratorText.substring(firstBraceIndex + 1);
            const needsComma = after.trim().length > 0 && !after.trim().startsWith('}') && !after.trim().startsWith(',');
            newDecoratorText = before + ` ${newImportsProperty}` + (needsComma ? ',' : '') + after;
        }
    }
  }
  
  newFileContent = fileContent.substring(0, decoratorObjectStartIndex) + newDecoratorText + fileContent.substring(decoratorObjectEndIndex);
  return newFileContent;
}


function importElementToFile(element: AngularElementData, componentFilePathAbs: string): boolean {
  try {
    if (!currentProjectPath) {
      vscode.window.showErrorMessage('Project path is not defined. Cannot import element.');
      return false;
    }

    let importPathString: string;

    if (element.isLibraryElement) {
      // element.path is relative to project root, e.g., "../node_modules/my-lib/..." or "node_modules/my-lib/..."
      // Need to extract 'my-lib' or '@scope/my-lib'
      const pathSegments = element.path.replace(/\\/g, '/').split('/'); // Normalize and split
      let nodeModulesIndex = -1;
      for(let i = 0; i < pathSegments.length; i++) {
        if (pathSegments[i] === 'node_modules') {
          nodeModulesIndex = i;
          break;
        }
      }

      if (nodeModulesIndex !== -1 && pathSegments.length > nodeModulesIndex + 1) {
        const firstSegmentAfterNodeModules = pathSegments[nodeModulesIndex + 1];
        if (firstSegmentAfterNodeModules.startsWith('@')) { // Scoped package
          if (pathSegments.length > nodeModulesIndex + 2) {
            importPathString = `${firstSegmentAfterNodeModules}/${pathSegments[nodeModulesIndex + 2]}`;
          } else {
            // This case implies a path like ".../node_modules/@scope" which is incomplete
            console.warn(`Potentially incomplete scoped package name for ${element.name} from path ${element.path}. Defaulting to the scope name.`);
            importPathString = firstSegmentAfterNodeModules; 
          }
        } else { // Non-scoped package
          importPathString = firstSegmentAfterNodeModules;
        }
      } else {
        console.error(`Could not determine library name for ${element.name} from path ${element.path}. Falling back to relative pathing.`);
        // Fallback to old behavior if library name extraction fails (should be rare)
        const absoluteTargetModulePath = path.join(currentProjectPath, element.path);
        const absoluteTargetModulePathNoExt = switchFileType(absoluteTargetModulePath, '');
        const tsConfig = getGlobalTsConfig();
        importPathString = TsConfigHelper.resolveImportPath(absoluteTargetModulePathNoExt, componentFilePathAbs, tsConfig, currentProjectPath);
      }
      console.log(`Resolved library import path for ${element.name}: '${importPathString}' from element path ${element.path}`);

    } else { // Project local element (not a library element)
      const absoluteTargetModulePath = path.join(currentProjectPath, element.path);
      const absoluteTargetModulePathNoExt = switchFileType(absoluteTargetModulePath, '');
      const tsConfig = getGlobalTsConfig();
      importPathString = TsConfigHelper.resolveImportPath(
          absoluteTargetModulePathNoExt,
          componentFilePathAbs,
          tsConfig,
          currentProjectPath
      );
      console.log(`Resolved project import path for ${element.name}: '${importPathString}'`);
    }

    let importStr = `import { ${element.name} } from '${importPathString}';\n`;
    const fileContents = fs.readFileSync(componentFilePathAbs, 'utf-8');

    // Regex to check if the exact element from the exact path is already imported
    const escapedImportPathString = importPathString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const specificImportRegex = new RegExp(
        `import\\s*{[^}]*\\b${element.name}\\b[^}]*}\\s*from\\s*['"]${escapedImportPathString}['"]`, 'g'
    );

    // Simpler regex to check if the element name is imported from *anywhere*
    const generalImportRegex = new RegExp(`import\\s*{[^}]*\\b${element.name}\\b[^}]*}\\s*from`);

    if (generalImportRegex.test(fileContents)) {
      console.log(`${element.name} seems to be already imported or a class with the same name is imported.`);
      if (specificImportRegex.test(fileContents)) {
        console.log(`${element.name} is already correctly imported from '${importPathString}'.`);
      } else {
        console.log(`${element.name} is imported, but from a different path. Consider manual review.`);
        // Potentially, we could offer to replace the import, but for now, we don't.
      }
      // Still try to add to @Component.imports if not there, as it might be imported but not used in template.
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
  let activeComponentTsFileAbs = currentFileAbs;
  if (currentFileAbs.endsWith('.html')) {
    activeComponentTsFileAbs = switchFileType(currentFileAbs, '.ts');
  }


  if (!fs.existsSync(activeComponentTsFileAbs)) {
    vscode.window.showErrorMessage(`Component file not found for ${path.basename(currentFileAbs)}. Expected ${path.basename(activeComponentTsFileAbs)} or current file is not a .ts file.`);
    return false;
  }

  const success = importElementToFile(element, activeComponentTsFileAbs);

  if (success) {
    vscode.window.showInformationMessage(`${element.type} '${element.name}' (selector: ${element.selector}) imported successfully into ${path.basename(activeComponentTsFileAbs)}.`);
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

    // Command to import regular indexed elements
    const importElementCmd = vscode.commands.registerCommand('angular-auto-import.importElement', (selector: string) => {
      if (!angularIndexer) {
        vscode.window.showErrorMessage('❌ Indexer not available.'); return;
      }
      const element = angularIndexer.getElement(selector);
      if (element) { // Check if element is found
        importElement(element); // Calls the original importElement function
      } else {
        vscode.window.showErrorMessage(`Element with selector '${selector}' not found in index.`);
      }
    });
    activationContext.subscriptions.push(importElementCmd);

    // Command to import built-in standalone elements (NgIf, AsyncPipe, etc.)
    const importBuiltInCmd = vscode.commands.registerCommand('angular-auto-import.importBuiltInElement', (params: {className: string, sourcePackage: string, activeHtmlFileUri?: vscode.Uri }) => {
        const { className, sourcePackage, activeHtmlFileUri } = params;
        if (!className || !sourcePackage) {
            vscode.window.showErrorMessage('Missing className or sourcePackage for built-in import.');
            return;
        }
        let targetTsFile: string | undefined;
        const activeEditor = vscode.window.activeTextEditor;

        if (activeHtmlFileUri) { // If URI is passed (e.g. from quick fix on HTML)
            targetTsFile = switchFileType(activeHtmlFileUri.fsPath, '.ts');
        } else if (activeEditor) { // Fallback to active editor (e.g. from completion item in TS file)
            targetTsFile = activeEditor.document.fileName;
            if (targetTsFile.endsWith('.html')) {
                 targetTsFile = switchFileType(targetTsFile, '.ts');
            }
        }

        if (targetTsFile && fs.existsSync(targetTsFile)) {
            importStandaloneBuiltInElement(className, sourcePackage, targetTsFile);
        } else {
            vscode.window.showErrorMessage(`Could not determine target TypeScript file to import ${className}.`);
        }
    });
    activationContext.subscriptions.push(importBuiltInCmd);


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
                const activeHtmlFile = document.uri.fsPath;
                const activeComponentTsFile = switchFileType(activeHtmlFile, '.ts');
                let isCurrentComponentStandalone = false;
                if (fs.existsSync(activeComponentTsFile)) {
                    isCurrentComponentStandalone = AngularIndexer.isComponentStandalone(activeComponentTsFile);
                }


                const tagRegex = /<([a-zA-Z0-9-]*)$/;
                const tagMatch = tagRegex.exec(linePrefix);
                const pipeRegex = /\|\s*([a-zA-Z0-9_]*)$/; // Allow underscore for pipe names
                const pipeMatch = pipeRegex.exec(linePrefix);
                const attributeRegex = /\s+([a-zA-Z0-9-\*\[\]\(\)]*)$/; // For *ngIf, [ngClass], (click), etc.
                const attributeMatch = attributeRegex.exec(linePrefix);


                const currentWordRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9-*\[\]\(\)]+/);
                const currentWord = currentWordRange ? document.getText(currentWordRange) : "";

                // 1. Suggestions from indexed elements (custom components/directives/pipes)
                for (const selector of angularIndexer.getAllSelectors()) {
                  const element = angularIndexer.getElement(selector);
                  if (!element) continue;

                  let match = false;
                  let itemKind: vscode.CompletionItemKind = vscode.CompletionItemKind.Class;
                  let insertText = selector;

                  if (tagMatch && (element.type === 'component' || element.type === 'directive')) { // Directive can be on tag
                    if (selector.toLowerCase().startsWith(tagMatch[1].toLowerCase())) match = true;
                  } else if (pipeMatch && element.type === 'pipe') {
                    if (selector.toLowerCase().startsWith(pipeMatch[1].toLowerCase())) {
                        match = true;
                        itemKind = vscode.CompletionItemKind.Function;
                    }
                  } else if (attributeMatch && (element.type === 'directive' || element.type === 'component') && currentWord.length > 0) {
                    // For attributes like [myDir] or *myStructuralDir
                    // Remove brackets/asterisk for matching if selector is just the name
                    const simpleSelector = selector.replace(/[\[\]\*]/g, '');
                    const simpleCurrentWord = currentWord.replace(/[\[\]\*]/g, '');
                    if (simpleSelector.toLowerCase().startsWith(simpleCurrentWord.toLowerCase())) match = true;
                  }
                   else if (!tagMatch && !pipeMatch && !attributeMatch && currentWord.length > 0) { 
                    // General typing, could be start of a tag or attribute
                     if (selector.toLowerCase().startsWith(currentWord.toLowerCase())) {
                        match = true;
                        itemKind = element.type === 'pipe' ? vscode.CompletionItemKind.Function : vscode.CompletionItemKind.Class;
                     }
                  }

                  if (match) {
                    const item = new CompletionItem(selector, itemKind);
                    item.insertText = insertText; 
                    item.detail = `Auto-Import: ${element.type} (${element.isLibraryElement ? 'library' : 'local'})`;
                    item.documentation = new vscode.MarkdownString(`Import \`${element.name}\` (${element.type}) from \`${element.isLibraryElement ? element.path.split(path.sep+'node_modules'+path.sep)[1]?.split(path.sep)[0] : element.path}\`.\n\nSelector/Name: \`${selector}\``);
                    item.command = {
                      title: `Import ${element.name}`,
                      command: 'angular-auto-import.importElement',
                      arguments: [selector]
                    };
                    suggestions.push(item);
                  }
                }

                // 2. Suggestions for built-in Angular standalone elements (NgIf, AsyncPipe, etc.)
                if (isCurrentComponentStandalone) {
                    for (const builtIn of BUILTIN_ANGULAR_ELEMENT_LIST) {
                        let match = false;
                        let itemKind: vscode.CompletionItemKind = builtIn.type === 'directive' ? vscode.CompletionItemKind.Struct : vscode.CompletionItemKind.Function;
                        let insertText = ""; // Will be determined by templateMatcher
                        let matchedTemplateKeyword = "";

                        // Try to match based on template usage context
                        if (pipeMatch && builtIn.type === 'pipe' && builtIn.templateMatcher?.test(pipeMatch[1])) {
                            match = true;
                            insertText = pipeMatch[1].match(builtIn.templateMatcher)![0]; // Use the matched part for insertion
                            matchedTemplateKeyword = insertText;
                        } else if (attributeMatch && builtIn.type === 'directive' && builtIn.templateMatcher?.test(attributeMatch[1])) {
                            match = true;
                            insertText = attributeMatch[1].match(builtIn.templateMatcher)![0];
                             // For structural directives, ensure '*' is part of insert text if that's how it's matched
                            if (insertText.startsWith('ng') && !attributeMatch[1].startsWith('*') && (builtIn.className === 'NgIf' || builtIn.className === 'NgForOf')) {
                                // This is tricky. If user types `ngIf` we suggest `*ngIf`.
                                // If they type `*ngIf` it matches directly.
                                // For now, let's assume the matcher includes the syntax if needed.
                                // Example: templateMatcher for NgIf could be /\*?ngIf/i
                            }
                            matchedTemplateKeyword = insertText;
                        } else if (tagMatch && builtIn.type === 'directive' && builtIn.templateMatcher?.test(tagMatch[1])) {
                            // Less common for built-ins like NgIf to be suggested this way, but possible for NgOptimizedImage
                             match = true;
                             insertText = tagMatch[1].match(builtIn.templateMatcher)![0];
                             matchedTemplateKeyword = insertText;
                        } else if (!pipeMatch && !attributeMatch && !tagMatch && currentWord.length > 0 && builtIn.templateMatcher?.test(currentWord)) {
                            // General typing, check if current word matches any part of template usage
                            match = true;
                            insertText = currentWord.match(builtIn.templateMatcher)![0];
                            matchedTemplateKeyword = insertText;
                        }


                        if (match && matchedTemplateKeyword) {
                             // Refine insertText based on common usage
                            if (builtIn.className === 'NgIf' && !matchedTemplateKeyword.startsWith('*')) insertText = `*${matchedTemplateKeyword}`;
                            if (builtIn.className === 'NgForOf' && !matchedTemplateKeyword.startsWith('*')) insertText = `*${matchedTemplateKeyword}`;
                            if (builtIn.type === 'pipe' && pipeMatch && pipeMatch[1].length >=2 ) insertText = matchedTemplateKeyword; // User already typing pipe name
                            else if (builtIn.type === 'pipe') insertText = builtIn.templateMatcher!.source.replace(/\\/g, '').split('|')[0]; // Default to first alias

                            const item = new CompletionItem(`${insertText} (${builtIn.type})`, itemKind);
                            item.insertText = new vscode.SnippetString( (builtIn.className === 'NgIf' || builtIn.className === 'NgForOf') && !insertText.startsWith('*') ? `*${insertText}` : insertText );
                            item.detail = `Built-in Standalone: ${builtIn.type}`;
                            item.documentation = new vscode.MarkdownString(`Import \`${builtIn.className}\` from \`${builtIn.sourcePackage}\` (used as \`${insertText}\`).`);
                            item.command = {
                                title: `Import ${builtIn.className}`,
                                command: 'angular-auto-import.importBuiltInElement',
                                arguments: [{ className: builtIn.className, sourcePackage: builtIn.sourcePackage, activeHtmlFileUri: document.uri }]
                            };
                            // Ensure it's suggested if user is typing something that matches
                            if (currentWord && builtIn.templateMatcher.test(currentWord)) {
                                suggestions.push(item);
                            } else if ( (pipeMatch && builtIn.type === 'pipe') || (attributeMatch && builtIn.type === 'directive')) {
                                suggestions.push(item); // Suggest if context matches (e.g. after '|')
                            }
                        }
                    }
                }
                return suggestions;
              },
            },
            '<', '|', ' ', '*', '[' // Trigger characters
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

import { BUILTIN_ANGULAR_ELEMENT_LIST } from './angular-builtins'; // Import the list

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
    // Add more codes if necessary based on linter outputs
  ];

  constructor(private indexer: AngularIndexer) {} // Store the indexer instance

  provideCodeActions(
      document: vscode.TextDocument,
      range: vscode.Range | vscode.Selection,
      context: vscode.CodeActionContext,
      token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    if (!this.indexer && !BUILTIN_ANGULAR_ELEMENT_LIST) { // Check both
      console.warn("QuickfixProvider: Indexer or BuiltInElements not available.");
      return [];
    }
    const actions: vscode.CodeAction[] = [];
    const activeHtmlFile = document.uri; // URI of the HTML file
    const correspondingTsFile = switchFileType(activeHtmlFile.fsPath, '.ts');
    let isCurrentComponentStandalone = false;
    if (fs.existsSync(correspondingTsFile)) {
        isCurrentComponentStandalone = AngularIndexer.isComponentStandalone(correspondingTsFile);
    }


    for (const diagnostic of context.diagnostics) {
      if (this.isFixableDiagnostic(diagnostic)) {
        const extractedTerm = this.extractTermFromDiagnostic(document, diagnostic);
        if (extractedTerm) {
            // 1. Check indexed custom elements
            if (this.indexer) {
                const elementData = this.indexer.getElement(extractedTerm.originalTerm); // Try original term first
                if (elementData) {
                    const action = this.createCodeActionForIndexedElement(elementData, extractedTerm.originalTerm, diagnostic);
                    if (action) actions.push(action);
                } else {
                    // Try variations if direct match fails (e.g. with/without brackets)
                    const variations = this.generateSearchVariations(extractedTerm.term);
                    for (const variation of variations) {
                        const elData = this.indexer.getElement(variation);
                        if (elData) {
                             const action = this.createCodeActionForIndexedElement(elData, variation, diagnostic);
                             if (action) actions.push(action);
                             break; // Found a match
                        }
                    }
                    // Also try partial matches from indexer
                    const partialMatches = this.findPartialMatchesInIndex(extractedTerm.term);
                     partialMatches.forEach(matchData => {
                        const partialAction = this.createCodeActionForIndexedElement(matchData, matchData.selector, diagnostic);
                        if (partialAction) actions.push(partialAction);
                    });
                }
            }

            // 2. Check built-in standalone elements IF the current component is standalone
            if (isCurrentComponentStandalone) {
                for (const builtIn of BUILTIN_ANGULAR_ELEMENT_LIST) {
                    if (builtIn.templateMatcher && builtIn.templateMatcher.test(extractedTerm.term)) {
                        const action = this.createCodeActionForBuiltIn(builtIn, extractedTerm.term, diagnostic, activeHtmlFile);
                        if (action) actions.push(action);
                    }
                }
            }
        }
      }
    }
    return actions;
  }

  private isFixableDiagnostic(diagnostic: vscode.Diagnostic): boolean {
    if (diagnostic.source && diagnostic.source.toLowerCase().includes('angular')) {
      if (diagnostic.code && QuickfixImportProvider.fixesDiagnosticCode.some(c => String(c) === String(diagnostic.code))) {
        return true;
      }
    }
    const message = diagnostic.message.toLowerCase();
    return message.includes('is not a known element') ||
           (message.includes('pipe') && message.includes('could not be found')) ||
           message.includes('unknown html tag') ||
           message.includes('unknown element') ||
           message.includes('the property') && message.includes('does not exist on type') && (message.includes('ngif') || message.includes('ngfor')) || // For *ngIf, *ngFor issues
           message.includes('unknown pipe');
  }

  private extractTermFromDiagnostic(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): { term: string, originalTerm: string } | null {
    let extractedTerm = document.getText(diagnostic.range).trim();
    const originalTerm = extractedTerm; // Keep the very original text from diagnostic range

    // More robust extraction from message patterns
    const knownElementMatch = /['"]([^'"]+)['"]\s+is\s+not\s+a\s+known\s+element/i.exec(diagnostic.message);
    if (knownElementMatch && knownElementMatch[1]) extractedTerm = knownElementMatch[1];

    const pipeMatch = /(?:pipe|The pipe)\s+['"]([^'"]+)['"]\s+(?:could not be found|is not found)/i.exec(diagnostic.message);
    if (pipeMatch && pipeMatch[1]) extractedTerm = pipeMatch[1];
    
    const unknownHtmlTagMatch = /unknown html tag\s+['"]([^'"]+)['"]/i.exec(diagnostic.message);
    if (unknownHtmlTagMatch && unknownHtmlTagMatch[1]) extractedTerm = unknownHtmlTagMatch[1];

    // For structural directives like *ngIf="...", diagnostic range might be just "ngIf" or the expression.
    // We need to ensure we get the directive name itself.
    if (diagnostic.message.includes("property 'ngIf' does not exist")) extractedTerm = "ngIf";
    if (diagnostic.message.includes("property 'ngFor' does not exist")) extractedTerm = "ngFor";


    // Remove <, >, attributes, quotes, etc.
    // Example: <my-comp ... -> my-comp
    // Example: [myDir]="..." -> myDir
    // Example: *myDir -> myDir
    // Example: 'myPipe' -> myPipe
    let term = extractedTerm.replace(/^<([\w-]+)[\s\S]*?>?$/, '$1'); // Tag
    term = term.replace(/^\[([\w-]+)\][\s\S]*$/, '$1'); // Attribute [input]
    term = term.replace(/^\(([\w-]+)\)[\s\S]*$/, '$1'); // Attribute (output)
    term = term.replace(/^\*([\w-]+)[\s\S]*$/, '$1');   // Structural *ngIf
    term = term.replace(/['"`]/g, ''); // Remove quotes for pipes or string attributes

    return { term: term.split(/\s+/)[0], originalTerm }; // Take the first part if there are spaces
  }
  
  private generateSearchVariations(term: string): string[] {
    const variations = new Set<string>();
    variations.add(term);
    // If term is 'myDir', search for '[myDir]' or '*myDir' etc.
    // If term is '[myDir]', search for 'myDir'
    if (term.startsWith('[') && term.endsWith(']')) variations.add(term.slice(1, -1));
    else variations.add(`[${term}]`);

    if (term.startsWith('*')) variations.add(term.slice(1));
    else variations.add(`*${term}`);
    
    return Array.from(variations);
  }


  private findPartialMatchesInIndex(searchTerm: string): Array<AngularElementData & {selector: string}> {
    // Remove < > and attributes if present, e.g. <my-comp ...> -> my-comp
    text = text.replace(/^<([a-zA-Z0-9-]+)[\s\S]*?>?$/, '$1');
    // If it was a pipe expression like 'value | myPipe', text might be 'myPipe'
    const pipeMatch = text.match(/\|\s*([a-zA-Z0-9_-]+)/); // Allow underscore and hyphen in pipe names
    if (pipeMatch && pipeMatch[1]) return pipeMatch[1];

    return text.trim().split(/\s+/)[0]; // Take the first part if there are spaces (e.g. attributes)
  }

  private findPartialMatchesInIndex(searchTerm: string): Array<AngularElementData & {selector: string}> { // Renamed from findPartialMatches
    if (!this.indexer) return [];
    const matches: Array<AngularElementData & {selector: string}> = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    for (const indexedSelector of this.indexer.getAllSelectors()) {
      const element = this.indexer.getElement(indexedSelector);
      if (element) {
        const lowerIndexedSelector = indexedSelector.toLowerCase();
        if (lowerIndexedSelector.startsWith(lowerSearchTerm) ||
            lowerIndexedSelector.includes(lowerSearchTerm) ||
            lowerSearchTerm.includes(lowerIndexedSelector)) {
          matches.push({ ...element, selector: indexedSelector });
        }
      }
    }
    return matches.sort((a,b) => {
      const aStarts = a.selector.toLowerCase().startsWith(lowerSearchTerm);
      const bStarts = b.selector.toLowerCase().startsWith(lowerSearchTerm);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.selector.length - b.selector.length;
    }).slice(0, 3); // Limit suggestions
  }

  private createCodeActionForIndexedElement(
      element: AngularElementData,
      matchedSelector: string, // The selector string that matched (could be a variation)
      diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const actionTitle = `Import ${element.name} (${element.type}) ${element.isLibraryElement ? 'from ' + element.path.split(path.sep+'node_modules'+path.sep)[1]?.split(path.sep)[0] : ''}`;
    const action = new vscode.CodeAction(actionTitle, vscode.CodeActionKind.QuickFix);
    action.command = {
      title: `Import ${element.type} ${element.name}`,
      command: 'angular-auto-import.importElement',
      arguments: [matchedSelector] // Use the matched selector for the command
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true; // Custom elements are usually preferred
    return action;
  }

  private createCodeActionForBuiltIn(
      builtIn: BuiltInAngularElement,
      termFromDiagnostic: string,
      diagnostic: vscode.Diagnostic,
      activeHtmlFileUri: vscode.Uri
  ): vscode.CodeAction {
    const actionTitle = `Import ${builtIn.className} from ${builtIn.sourcePackage} (for ${termFromDiagnostic})`;
    const action = new vscode.CodeAction(actionTitle, vscode.CodeActionKind.QuickFix);
    action.command = {
        title: `Import ${builtIn.className}`,
        command: 'angular-auto-import.importBuiltInElement',
        arguments: [{ className: builtIn.className, sourcePackage: builtIn.sourcePackage, activeHtmlFileUri }]
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true; // Built-ins are often what the user wants for common tasks
    return action;
  }
}