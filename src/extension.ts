/**
 * =================================================================================================
 * VSCode Extension: Angular Auto-Import
 * =================================================================================================
 *
 * A modularly designed extension for automatically importing Angular elements.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { type CommandContext, registerCommands } from "./commands";
import { type ExtensionConfig, getConfiguration, onConfigurationChanged } from "./config";
import { type ProviderContext, registerProviders } from "./providers";
import { AngularIndexer } from "./services";
import * as TsConfigHelper from "./services/tsconfig";
import type { ProcessedTsConfig, ProjectContext } from "./types";
import { clearAllTemplateCache, clearTemplateCache } from "./utils/template-detection";

// Global state
const projectIndexers = new Map<string, AngularIndexer>();
const projectTsConfigs = new Map<string, ProcessedTsConfig | null>();
const projectIntervals = new Map<string, NodeJS.Timeout>();
let extensionConfig: ExtensionConfig;

/**
 * Activates the extension.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    console.log("🚀 Angular Auto-Import: Starting activation...");

    // Initialize configuration
    extensionConfig = getConfiguration();

    // Determine project roots
    const projectRoots = await determineProjectRoots();
    if (projectRoots.length === 0) {
      vscode.window.showErrorMessage("Angular Auto-Import: No project roots could be determined.");
      return;
    }

    // Initialize projects
    await initializeProjects(projectRoots, context);

    // Register providers and commands
    await registerProvidersAndCommands(context);

    // Setup configuration change handler
    const configHandler = onConfigurationChanged(async (newConfig) => {
      extensionConfig = newConfig;
      await handleConfigurationChange(newConfig, context);
    });
    context.subscriptions.push(configHandler);

    // Setup document close handler to clear template cache
    const documentCloseHandler = vscode.workspace.onDidCloseTextDocument((document) => {
      if (document.languageId === "typescript") {
        clearTemplateCache(document.uri.toString());
      }
    });
    context.subscriptions.push(documentCloseHandler);

    console.log("✅ Angular Auto-Import: Extension activated successfully");
    vscode.window.showInformationMessage(`✅ Angular Auto-Import activated for ${projectRoots.length} project(s).`);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("❌ Error activating Angular Auto-Import extension:", err);
    vscode.window.showErrorMessage(`❌ Failed to activate Angular Auto-Import: ${err.message}`);
  }
}

/**
 * Deactivates the extension.
 */
export function deactivate(): void {
  // Clear intervals
  projectIntervals.forEach((intervalId) => clearInterval(intervalId));
  projectIntervals.clear();

  // Dispose indexers
  projectIndexers.forEach((indexer) => indexer.dispose());
  projectIndexers.clear();

  // Clear caches
  projectTsConfigs.clear();
  TsConfigHelper.clearCache();
  clearAllTemplateCache(); // Clear template detection cache

  console.log("Angular Auto-Import extension deactivated and resources cleaned up.");
}

/**
 * Determines the project root directories.
 */
async function determineProjectRoots(): Promise<string[]> {
  let effectiveProjectRoots: string[] = [];

  if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
    effectiveProjectRoots = vscode.workspace.workspaceFolders.map((f) => f.uri.fsPath);

    if (extensionConfig.projectPath && extensionConfig.projectPath.trim() !== "") {
      console.warn("Angular Auto-Import: 'projectPath' setting is ignored when workspace folders are open.");
    }
  } else if (extensionConfig.projectPath && extensionConfig.projectPath.trim() !== "") {
    const resolvedPath = path.resolve(extensionConfig.projectPath);

    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
      effectiveProjectRoots.push(resolvedPath);
      console.log(`Angular Auto-Import: Using configured project path: ${resolvedPath}`);
    } else {
      vscode.window.showErrorMessage(`Angular Auto-Import: Configured projectPath "${resolvedPath}" is invalid.`);
    }
  } else {
    vscode.window.showErrorMessage(
      "Angular Auto-Import: No workspace folder found and no valid project path configured."
    );
  }

  return effectiveProjectRoots;
}

/**
 * Initializes the projects.
 */
async function initializeProjects(projectRoots: string[], context: vscode.ExtensionContext): Promise<void> {
  for (const projectRootPath of projectRoots) {
    console.log(`📁 Initializing project: ${projectRootPath}`);

    try {
      // Initialize TsConfig
      TsConfigHelper.clearCache(projectRootPath);
      const tsConfig = await TsConfigHelper.findAndParseTsConfig(projectRootPath);
      projectTsConfigs.set(projectRootPath, tsConfig);

      if (tsConfig) {
        console.log(`🔧 Tsconfig loaded for ${path.basename(projectRootPath)}.`);
      } else {
        console.log(`⚠️ Tsconfig not found for ${path.basename(projectRootPath)}.`);
      }

      // Initialize indexer
      const indexer = new AngularIndexer();
      projectIndexers.set(projectRootPath, indexer);

      await generateInitialIndexForProject(projectRootPath, indexer, context);

      // Setup periodic reindexing
      if (extensionConfig.indexRefreshInterval > 0) {
        const intervalId = setInterval(
          async () => {
            try {
              console.log(`🔄 Periodic reindexing for ${path.basename(projectRootPath)}...`);
              await generateIndexForProject(projectRootPath, indexer, context);
            } catch (error) {
              console.error(`❌ Error during periodic reindexing:`, error);
            }
          },
          extensionConfig.indexRefreshInterval * 1000 * 60
        );

        projectIntervals.set(projectRootPath, intervalId);
        context.subscriptions.push({
          dispose: () => {
            clearInterval(intervalId);
            projectIntervals.delete(projectRootPath);
          },
        });
      }
    } catch (error) {
      console.error(`Error initializing project ${projectRootPath}:`, error);
    }
  }
}

/**
 * Handles configuration changes.
 */
async function handleConfigurationChange(newConfig: ExtensionConfig, context: vscode.ExtensionContext): Promise<void> {
  console.log("Configuration changed, updating...");

  // Handle refresh interval changes
  if (newConfig.indexRefreshInterval !== extensionConfig.indexRefreshInterval) {
    // Clear existing intervals
    projectIntervals.forEach((intervalId, projectPath) => {
      clearInterval(intervalId);
      projectIntervals.delete(projectPath);
    });

    // Setup new intervals if needed
    if (newConfig.indexRefreshInterval > 0) {
      for (const [projectRootPath, indexer] of projectIndexers) {
        const intervalId = setInterval(
          async () => {
            try {
              console.log(`🔄 Periodic reindexing for ${path.basename(projectRootPath)}...`);
              await generateIndexForProject(projectRootPath, indexer, context);
            } catch (error) {
              console.error(`❌ Error during periodic reindexing:`, error);
            }
          },
          newConfig.indexRefreshInterval * 1000 * 60
        );

        projectIntervals.set(projectRootPath, intervalId);
      }
    }
  }

  // Handle project path changes
  if (newConfig.projectPath !== extensionConfig.projectPath) {
    console.log("Project path changed, reinitializing...");
    // This would require a full reinitialization
    // For now, just log the change
  }
}

/**
 * Generates the initial index for a project.
 */
async function generateInitialIndexForProject(
  projectRootPath: string,
  indexer: AngularIndexer,
  context: vscode.ExtensionContext
): Promise<void> {
  console.log(`GENERATE_INITIAL_INDEX: For project ${projectRootPath}`);
  indexer.setProjectRoot(projectRootPath);

  // Load from workspace cache first, if available and valid
  const loadedFromCache = indexer.loadFromWorkspace(context);

  if (loadedFromCache) {
    console.log(`Initial index loaded from cache for ${projectRootPath}.`);
    console.log(`Performing full index scan for ${projectRootPath} to ensure freshness...`);
    await indexer.generateFullIndex(context);
  } else {
    console.log(`No cache found or cache invalid for ${projectRootPath}. Performing full initial index scan...`);
    await indexer.generateFullIndex(context);
  }

  indexer.initializeWatcher(context);

  const indexSize = Array.from(indexer.getAllSelectors()).length;
  console.log(`📊 Initial index size for ${projectRootPath}: ${indexSize} elements`);

  if (indexSize === 0) {
    console.warn(`⚠️ Index is still empty for ${projectRootPath} after initial scan!`);
  }
}

/**
 * Generates the index for a project.
 */
async function generateIndexForProject(
  projectRootPath: string,
  indexer: AngularIndexer,
  context: vscode.ExtensionContext
): Promise<void> {
  console.log(`GENERATE_INDEX: For project ${projectRootPath}`);
  if (indexer.workspaceFileCacheKey === "" || indexer.workspaceIndexCacheKey === "") {
    console.warn(`generateIndexForProject: Cache keys not set for ${projectRootPath}, attempting to set them now.`);
    indexer.setProjectRoot(projectRootPath);
  }
  await indexer.generateFullIndex(context);

  if (!indexer.fileWatcher) {
    console.log(`Watcher for ${projectRootPath} was not active, initializing.`);
    indexer.initializeWatcher(context);
  }
}

/**
 * Gets the project context for a document.
 */
export function getProjectContextForDocument(document: vscode.TextDocument): ProjectContext | undefined {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (workspaceFolder) {
    const projectRootPath = workspaceFolder.uri.fsPath;
    const indexer = projectIndexers.get(projectRootPath);
    const tsConfig = projectTsConfigs.get(projectRootPath) ?? null;
    if (indexer) {
      return { projectRootPath, indexer, tsConfig };
    } else {
      console.warn(`No indexer found for project: ${projectRootPath} (document: ${document.uri.fsPath})`);
    }
  } else {
    // Fallback for files not directly in a workspace folder but within a known project root
    for (const rootPath of projectIndexers.keys()) {
      if (document.uri.fsPath.startsWith(rootPath + path.sep)) {
        const indexer = projectIndexers.get(rootPath);
        const tsConfig = projectTsConfigs.get(rootPath) ?? null;
        if (indexer) {
          return { projectRootPath: rootPath, indexer, tsConfig };
        }
      }
    }
    console.warn(`Document ${document.uri.fsPath} does not belong to any known workspace folder or project root.`);
  }
  return undefined;
}

/**
 * Registers providers and commands.
 */
async function registerProvidersAndCommands(context: vscode.ExtensionContext): Promise<void> {
  // Create provider context
  const providerContext: ProviderContext = {
    projectIndexers,
    projectTsConfigs,
    extensionConfig,
    extensionContext: context,
  };

  // Register providers first
  registerProviders(context, providerContext);

  // Create command context
  const commandContext: CommandContext = {
    projectIndexers,
    projectTsConfigs,
    extensionConfig,
  };

  // Register commands
  registerCommands(context, commandContext);
}
