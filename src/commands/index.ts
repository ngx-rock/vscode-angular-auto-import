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
      const result = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Angular Auto-Import: Reindexing ${path.basename(projectRootPath)}`,
          cancellable: false,
        },
        async (progress) => {
          const indexer = commandContext.projectIndexers.get(projectRootPath);
          if (indexer) {
            TsConfigHelper.clearCache(projectRootPath);
            const newTsConfig = await TsConfigHelper.findAndParseTsConfig(projectRootPath);
            commandContext.projectTsConfigs.set(projectRootPath, newTsConfig);
            await generateIndexForProject(projectRootPath, indexer, context, progress);
            const newSize = Array.from(indexer.getAllSelectors()).length;
            return { newSize, success: true };
          }
          return { newSize: 0, success: false };
        }
      );

      if (result.success) {
        vscode.window.showInformationMessage(
          `✅ Reindex of ${path.basename(projectRootPath)} successful. Found ${result.newSize} elements.`
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
    const { projectIndexers } = commandContext;
    const projectCount = projectIndexers.size;

    if (projectCount === 0) {
      vscode.window.showInformationMessage("Angular Auto-Import: No active project to clear cache for.");
      return;
    }

    for (const [, indexer] of projectIndexers) {
      await indexer.clearCache(context);
    }

    if (projectCount === 1) {
      const [projectRootPath] = projectIndexers.keys();
      vscode.window.showInformationMessage(
        `✅ Angular Auto-Import: Cache cleared for project ${path.basename(projectRootPath)}.`
      );
    } else {
      vscode.window.showInformationMessage(`✅ Angular Auto-Import: Cache cleared for all ${projectCount} projects.`);
    }
  });
  context.subscriptions.push(clearCacheCommand);

  // Show logs command
  const showLogsCommand = vscode.commands.registerCommand("angular-auto-import.showLogs", async () => {
    logger.info("Show logs command invoked by user");

    try {
      // Show the Angular Auto Import output channel
      const choice = await vscode.window.showInformationMessage(
        "View Angular Auto Import logs:",
        { modal: false },
        "📋 Output Channel",
        "📁 Log Files"
      );

      if (choice === "📋 Output Channel") {
        // Show VS Code Output panel with Angular Auto Import channel
        await vscode.commands.executeCommand("workbench.action.output.toggleOutput");
        // The logger's ChannelTransport will ensure the channel is visible
      } else if (choice === "📁 Log Files") {
        // Open log directory if file logging is enabled
        const config = commandContext.extensionConfig;
        if (config.logging?.fileLoggingEnabled) {
          const logDir = config.logging.logDirectory || path.join(context.globalStorageUri.fsPath, "logs");
          if (fs.existsSync(logDir)) {
            await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(logDir), true);
          } else {
            vscode.window.showWarningMessage(
              "Log directory not found. File logging might be disabled or not initialized yet."
            );
          }
        } else {
          vscode.window.showInformationMessage("File logging is disabled. Enable it in settings to create log files.");
        }
      }
    } catch (error) {
      logger.error("Error in showLogs command:", error as Error);
      vscode.window.showErrorMessage("Failed to show logs. Check the extension output for details.");
    }
  });
  context.subscriptions.push(showLogsCommand);

  // Show performance metrics command
  const showMetricsCommand = vscode.commands.registerCommand("angular-auto-import.showPerformanceMetrics", async () => {
    logger.info("Show performance metrics command invoked by user");

    try {
      const metrics = logger.getPerformanceMetrics();
      const heapUsedMb = Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024);
      const heapTotalMb = Math.round(metrics.memoryUsage.heapTotal / 1024 / 1024);
      const rssMb = Math.round(metrics.memoryUsage.rss / 1024 / 1024);
      const externalMb = Math.round(metrics.memoryUsage.external / 1024 / 1024);

      // Count indexed elements across all projects
      let totalElements = 0;
      let totalProjects = 0;
      let projectDetails = "";

      for (const [projectPath, indexer] of commandContext.projectIndexers.entries()) {
        const elements = indexer.getAllSelectors().length;
        totalElements += elements;
        totalProjects++;
        projectDetails += `\n• ${path.basename(projectPath)}: ${elements} elements`;
      }

      const metricsReport = `🔍 **Angular Auto Import - Performance Metrics**

📊 **Memory Usage:**
• Heap Used: ${heapUsedMb} MB
• Heap Total: ${heapTotalMb} MB  
• RSS: ${rssMb} MB
• External: ${externalMb} MB

⚡ **CPU Usage:**
• User: ${Math.round(metrics.cpuUsage.user / 1000)} ms
• System: ${Math.round(metrics.cpuUsage.system / 1000)} ms

🗂️ **Indexing Stats:**
• Projects: ${totalProjects}
• Total Elements: ${totalElements}${projectDetails}

💡 **Tips:**
• If memory usage is high (>100MB), try clearing cache
• Check logs for performance timers of slow operations
• Large projects may need more memory for indexing`;

      const panel = vscode.window.createWebviewPanel(
        "angularAutoImportMetrics",
        "Angular Auto Import - Performance Metrics",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: false,
          localResourceRoots: [],
        }
      );

      // Add disposal handler
      context.subscriptions.push(panel);

      panel.webview.html = getWebviewContent(metricsReport);
    } catch (error) {
      logger.error("Error in showPerformanceMetrics command:", error as Error);
      vscode.window.showErrorMessage("Failed to show performance metrics. Check the extension output for details.");
    }
  });
  context.subscriptions.push(showMetricsCommand);
}

/**
 * Generates secure and rich HTML content for the performance metrics webview.
 * It transforms a markdown-like report string into a styled HTML document.
 *
 * @param metricsReport - The formatted metrics report string
 * @returns HTML string for the webview
 */
function getWebviewContent(metricsReport: string): string {
  // Sanitize to prevent any accidental HTML injection from metric values
  const sanitizedReport = metricsReport.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Convert markdown-like syntax to HTML
  let htmlContent = sanitizedReport
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
    .replace(/^🔍 (.*)$/gm, "<h1>$1</h1>") // Main title
    .replace(/^(📊|⚡|🗂️|💡) (.*)$/gm, "<h2>$1 $2</h2>") // Section headers
    .replace(/^• (.*)$/gm, "<li>$1</li>"); // List items

  // Wrap consecutive list items in a <ul> tag
  htmlContent = htmlContent.replace(/(<li>(.|\n)*?<\/li>)/gs, "<ul>$1</ul>").replace(/<\/ul>\s*<ul>/gs, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
    <title>Performance Metrics</title>
    <style>
        body { 
            font-family: var(--vscode-font-family), 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: var(--vscode-font-size, 13px);
            padding: 20px;
            line-height: 1.6;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
        }
        h1 {
          font-size: 1.5em;
          font-weight: 600;
          border-bottom: 1px solid var(--vscode-separator-foreground);
          padding-bottom: 8px;
          margin: 0 0 20px 0;
        }
        h2 {
          font-size: 1.2em;
          font-weight: 600;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        ul {
          list-style-type: none;
          padding-left: 5px;
          margin: 0;
        }
        li {
          position: relative;
          padding-left: 15px;
          margin-bottom: 5px;
        }
        li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--vscode-focusBorder);
        }
        .refresh-info {
            margin-top: 25px;
            padding: 10px;
            background: var(--vscode-textBlockQuote-background);
            border-radius: 3px;
            border-left: 3px solid var(--vscode-textBlockQuote-border);
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    ${htmlContent}
    <div class="refresh-info">
        💡 To refresh metrics, run the command again from the Command Palette (Ctrl/Cmd + Shift + P)
    </div>
</body>
</html>`;
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
 * @param progress - Optional progress reporter for the index generation
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
  context: vscode.ExtensionContext,
  progress?: vscode.Progress<{ message?: string; increment?: number }>
): Promise<void> {
  // Generating index for project
  if (indexer.workspaceFileCacheKey === "" || indexer.workspaceIndexCacheKey === "") {
    logger.warn(`Cache keys not set for ${projectRootPath}, attempting to set them now`);
    indexer.setProjectRoot(projectRootPath);
  }
  await indexer.generateFullIndex(context, progress);

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
