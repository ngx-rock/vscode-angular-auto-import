/**
 *
 * VSCode Commands Registration
 *
 * @module
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import type { ExtensionConfig } from "../config";
import { logger } from "../logger";
import type { AngularIndexer } from "../services";
import * as TsConfigHelper from "../services/tsconfig";
import type { AngularElementData, ProcessedTsConfig } from "../types";
import { importElementToFile, switchFileType } from "../utils";

/**
 * Context object containing shared state and dependencies for extension commands.
 *
 * @interface CommandContext
 * @example
 * ```typescript
 * const commandContext: CommandContext = {
 *   projectIndexers: new Map(),
 *   projectTsConfigs: new Map(),
 *   extensionConfig: getConfiguration()
 * };
 * ```
 */
export interface CommandContext {
  /** Map of project root paths to their corresponding Angular indexers */
  projectIndexers: Map<string, AngularIndexer>;
  /** Map of project root paths to their parsed TypeScript configurations */
  projectTsConfigs: Map<string, ProcessedTsConfig | null>;
  /** Current extension configuration settings */
  extensionConfig: ExtensionConfig;
}

/**
 * Registers all extension commands with the VS Code command registry.
 *
 * This function sets up the following commands:
 * - `angular-auto-import.reindex`: Re-indexes Angular elements for the current or all projects
 * - `angular-auto-import.importElement`: Imports a specific Angular element into the current file
 * - `angular-auto-import.clearCache`: Clears the cached index data for all projects
 *
 * @param context - The VS Code extension context for managing disposables
 * @param commandContext - Shared state and dependencies for commands
 *
 * @example
 * ```typescript
 * export function activate(context: vscode.ExtensionContext) {
 *   const commandContext = createCommandContext();
 *   registerCommands(context, commandContext);
 * }
 * ```
 */
export function registerCommands(context: vscode.ExtensionContext, commandContext: CommandContext): void {
  // Re-index command
  const reindexCommand = vscode.commands.registerCommand("angular-auto-import.reindex", async () => {
    logger.info("Reindex command invoked by user");
    const activeEditor = vscode.window.activeTextEditor;
    const projectsToReindex: string[] = [];

    if (activeEditor) {
      const projCtx = getProjectContextForDocument(activeEditor.document, commandContext);
      if (projCtx) {
        projectsToReindex.push(projCtx.projectRootPath);
        // Targeting active editor's project
      }
    }

    if (projectsToReindex.length === 0) {
      // If no active editor or not in a known project, reindex all
      commandContext.projectIndexers.forEach((_, projectRootPath) => {
        projectsToReindex.push(projectRootPath);
      });
      if (projectsToReindex.length > 0) {
        // Targeting all known projects
      }
    }

    if (projectsToReindex.length === 0) {
      vscode.window.showInformationMessage("Angular Auto-Import: No project found to reindex.");
      return;
    }

    for (const projectRootPath of projectsToReindex) {
      vscode.window.showInformationMessage(`🔄 Angular Auto-Import: Reindexing ${path.basename(projectRootPath)}...`);
      const indexer = commandContext.projectIndexers.get(projectRootPath);
      if (indexer) {
        TsConfigHelper.clearCache(projectRootPath);
        const newTsConfig = await TsConfigHelper.findAndParseTsConfig(projectRootPath);
        commandContext.projectTsConfigs.set(projectRootPath, newTsConfig);
        await generateIndexForProject(projectRootPath, indexer, context);
        const newSize = Array.from(indexer.getAllSelectors()).length;
        vscode.window.showInformationMessage(
          `✅ Reindex of ${path.basename(projectRootPath)} successful. Found ${newSize} elements.`
        );
      } else {
        vscode.window.showWarningMessage(
          `Indexer not found for project ${path.basename(projectRootPath)}. Cannot reindex.`
        );
      }
    }
  });
  context.subscriptions.push(reindexCommand);

  // Import element command
  const importCmd = vscode.commands.registerCommand(
    "angular-auto-import.importElement",
    async (element: AngularElementData) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        vscode.window.showErrorMessage("No active editor. Cannot determine project context for import.");
        return;
      }
      const projCtx = getProjectContextForDocument(activeEditor.document, commandContext);
      if (!projCtx) {
        vscode.window.showErrorMessage("Could not determine project context for the active file.");
        return;
      }
      const { indexer, projectRootPath, tsConfig } = projCtx;
      await importElementCommandLogic(element, projectRootPath, tsConfig, indexer);
    }
  );
  context.subscriptions.push(importCmd);

  // Clear cache command
  const clearCacheCommand = vscode.commands.registerCommand("angular-auto-import.clearCache", async () => {
    logger.info("Clear cache command invoked by user");
    if (commandContext.projectIndexers.size === 0) {
      vscode.window.showInformationMessage("Angular Auto-Import: No active project to clear cache for.");
      return;
    }

    for (const [projectRootPath, indexer] of commandContext.projectIndexers.entries()) {
      await indexer.clearCache(context);
      vscode.window.showInformationMessage(
        `✅ Angular Auto-Import: Cache cleared for project ${path.basename(projectRootPath)}.`
      );
    }
    vscode.window.showInformationMessage("✅ Angular Auto-Import: All project caches have been cleared.");
  });
  context.subscriptions.push(clearCacheCommand);
}

/**
 * Generates or regenerates the Angular element index for a specific project.
 *
 * This function performs a full index generation, including:
 * - Setting up cache keys if not already configured
 * - Scanning for Angular components, directives, and pipes
 * - Initializing file watchers for incremental updates
 *
 * @param projectRootPath - Absolute path to the project root directory
 * @param indexer - The Angular indexer instance for this project
 * @param context - VS Code extension context for cache management
 *
 * @throws Will log warnings if cache keys are not properly configured
 *
 * @example
 * ```typescript
 * await generateIndexForProject('/path/to/project', indexer, context);
 * ```
 */
async function generateIndexForProject(
  projectRootPath: string,
  indexer: AngularIndexer,
  context: vscode.ExtensionContext
): Promise<void> {
  // Generating index for project
  if (indexer.workspaceFileCacheKey === "" || indexer.workspaceIndexCacheKey === "") {
    logger.warn(`Cache keys not set for ${projectRootPath}, attempting to set them now`);
    indexer.setProjectRoot(projectRootPath);
  }
  await indexer.generateFullIndex(context);

  if (!indexer.fileWatcher) {
    // Watcher was not active, initializing
    indexer.initializeWatcher(context);
  }
}

/**
 * Resolves the project context (indexer, root path, and TypeScript config) for a given document.
 *
 * This function attempts to find the appropriate project context by:
 * 1. First checking if the document belongs to a workspace folder
 * 2. If not found, searching through known project roots for a match
 * 3. Returns undefined if no matching project context is found
 *
 * @param document - The VS Code text document to resolve context for
 * @param commandContext - Shared command context containing project mappings
 *
 * @returns Project context object with indexer, root path, and TypeScript config, or undefined if not found
 *
 * @example
 * ```typescript
 * const activeEditor = vscode.window.activeTextEditor;
 * if (activeEditor) {
 *   const projectContext = getProjectContextForDocument(activeEditor.document, commandContext);
 *   if (projectContext) {
 *     // Use projectContext.indexer, projectContext.projectRootPath, etc.
 *   }
 * }
 * ```
 */
function getProjectContextForDocument(
  document: vscode.TextDocument,
  commandContext: CommandContext
):
  | {
      indexer: AngularIndexer;
      projectRootPath: string;
      tsConfig: ProcessedTsConfig | null;
    }
  | undefined {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (workspaceFolder) {
    const projectRootPath = workspaceFolder.uri.fsPath;
    const indexer = commandContext.projectIndexers.get(projectRootPath);
    const tsConfig = commandContext.projectTsConfigs.get(projectRootPath) ?? null;
    if (indexer) {
      return { projectRootPath, indexer, tsConfig };
    } else {
      logger.warn(`No indexer found for project: ${projectRootPath} (document: ${document.uri.fsPath})`);
    }
  } else {
    // Fallback for files not directly in a workspace folder but within a known project root
    for (const rootPath of commandContext.projectIndexers.keys()) {
      if (document.uri.fsPath.startsWith(rootPath + path.sep)) {
        const indexer = commandContext.projectIndexers.get(rootPath);
        const tsConfig = commandContext.projectTsConfigs.get(rootPath) ?? null;
        if (indexer) {
          return { projectRootPath: rootPath, indexer, tsConfig };
        }
      }
    }
    logger.warn(`Document ${document.uri.fsPath} does not belong to any known workspace folder or project root`);
  }
  return undefined;
}

/**
 * Executes the core logic for importing an Angular element into the current file.
 *
 * This function handles the complete import workflow:
 * 1. Validates that the element exists in the index
 * 2. Determines the target TypeScript file (switches from .html to .ts if needed)
 * 3. Verifies the target file exists
 * 4. Performs the actual import operation using ts-morph
 * 5. Shows appropriate user feedback
 *
 * @param elementData - The Angular element data to import (component, directive, or pipe)
 * @param projectRootPath - Absolute path to the project root
 * @param tsConfig - Parsed TypeScript configuration for path resolution
 * @param indexer - Angular indexer containing the ts-morph project instance
 *
 * @returns Promise that resolves to true if import was successful, false otherwise
 *
 * @example
 * ```typescript
 * const success = await importElementCommandLogic(
 *   elementData,
 *   '/path/to/project',
 *   tsConfig,
 *   indexer
 * );
 * if (success) {
 *   logger.info('Import completed successfully');
 * }
 * ```
 */
async function importElementCommandLogic(
  elementData: AngularElementData | undefined,
  projectRootPath: string,
  tsConfig: ProcessedTsConfig | null,
  indexer: AngularIndexer
): Promise<boolean> {
  if (!elementData) {
    vscode.window.showInformationMessage(
      "Angular element not found in index. Please check selector, reindex, and try again."
    );
    return false;
  }

  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    vscode.window.showErrorMessage("No active file found.");
    return false;
  }
  const currentFileAbs = activeEditor.document.fileName;

  let activeComponentFileAbs = currentFileAbs;
  if (currentFileAbs.endsWith(".html")) {
    activeComponentFileAbs = switchFileType(currentFileAbs, ".ts");
  }

  if (!fs.existsSync(activeComponentFileAbs)) {
    vscode.window.showErrorMessage(
      `Component file not found for ${path.basename(currentFileAbs)}. Expected ${path.basename(
        activeComponentFileAbs
      )} or current file is not a .ts file.`
    );
    return false;
  }

  const success = await importElementToFile(
    elementData,
    activeComponentFileAbs,
    projectRootPath,
    indexer.project, // ts-morph Project instance
    tsConfig
  );

  if (success) {
    vscode.window.showInformationMessage(
      `${elementData.type} '${elementData.name}' processed for ${path.basename(activeComponentFileAbs)}.`
    );
  }
  return success;
}
