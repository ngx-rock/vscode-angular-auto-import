/**
 * =================================================================================================
 * VSCode Commands Registration
 * =================================================================================================
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import type { ExtensionConfig } from "../config";
import type { AngularIndexer } from "../services";
import * as TsConfigHelper from "../services/tsconfig";
import type { AngularElementData, ProcessedTsConfig } from "../types";
import { getAngularElement, importElementToFile, switchFileType } from "../utils";

/**
 * Context for the commands.
 */
export interface CommandContext {
  projectIndexers: Map<string, AngularIndexer>;
  projectTsConfigs: Map<string, ProcessedTsConfig | null>;
  extensionConfig: ExtensionConfig;
}

/**
 * Registers all extension commands.
 */
export function registerCommands(context: vscode.ExtensionContext, commandContext: CommandContext): void {
  // Re-index command
  const reindexCommand = vscode.commands.registerCommand("angular-auto-import.reindex", async () => {
    console.log("REINDEX_COMMAND: Invoked by user.");
    const activeEditor = vscode.window.activeTextEditor;
    const projectsToReindex: string[] = [];

    if (activeEditor) {
      const projCtx = getProjectContextForDocument(activeEditor.document, commandContext);
      if (projCtx) {
        projectsToReindex.push(projCtx.projectRootPath);
        console.log(`REINDEX_COMMAND: Targeting active editor's project: ${projCtx.projectRootPath}`);
      }
    }

    if (projectsToReindex.length === 0) {
      // If no active editor or not in a known project, reindex all
      commandContext.projectIndexers.forEach((_, projectRootPath) => projectsToReindex.push(projectRootPath));
      if (projectsToReindex.length > 0) {
        console.log(`REINDEX_COMMAND: Targeting all known projects: ${projectsToReindex.join(", ")}`);
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
  const importCmd = vscode.commands.registerCommand("angular-auto-import.importElement", async (selector: string) => {
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
    const element = getAngularElement(selector, indexer);
    await importElementCommandLogic(element, projectRootPath, tsConfig, indexer);
  });
  context.subscriptions.push(importCmd);

  // Manual import command
  // todo: delete
  const manualImportCmd = vscode.commands.registerCommand("angular-auto-import.manual.importElement", async () => {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage("No active editor. Cannot determine project context for manual import.");
      return;
    }
    const projCtx = getProjectContextForDocument(activeEditor.document, commandContext);
    if (!projCtx) {
      vscode.window.showErrorMessage("Could not determine project context for the active file.");
      return;
    }
    const { indexer, projectRootPath, tsConfig } = projCtx;

    const allSelectors = Array.from(indexer.getAllSelectors());
    const userInput = await vscode.window.showInputBox({
      prompt: `Enter Angular element selector or pipe name (for project ${path.basename(projectRootPath)})`,
      placeHolder: `e.g., ${
        allSelectors.length > 0 ? allSelectors.slice(0, Math.min(3, allSelectors.length)).join(", ") : "my-component"
      }`,
    });
    if (userInput) {
      const element = getAngularElement(userInput, indexer);
      const success = await importElementCommandLogic(element, projectRootPath, tsConfig, indexer);
      if (!success && !element) {
        vscode.window.showErrorMessage(
          `❌ Angular element "${userInput}" not found in index for ${path.basename(projectRootPath)}.`
        );
      }
    }
  });
  context.subscriptions.push(manualImportCmd);
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
      console.warn(`No indexer found for project: ${projectRootPath} (document: ${document.uri.fsPath})`);
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
    console.warn(`Document ${document.uri.fsPath} does not belong to any known workspace folder or project root.`);
  }
  return undefined;
}

/**
 * Logic for the import element command.
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
