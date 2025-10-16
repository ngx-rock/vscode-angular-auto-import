/**
 * Diagnostics Report Generator
 *
 * A debugging/development tool that scans all Angular templates (both external .html and inline)
 * and collects all diagnostic issues into a comprehensive report.
 *
 * @module
 */

import * as fs from "node:fs";
import * as vscode from "vscode";
import { logger } from "../logger";
import type { DiagnosticProvider } from "../providers/diagnostics";
import { getTsDocument, switchFileType } from "../utils";

/**
 * Report for a single file's diagnostics
 * @public Used as part of DiagnosticsReport
 */
export interface FileReport {
  /** Absolute path to the file */
  filePath: string;
  /** Type of template */
  templateType: "inline" | "external";
  /** Diagnostics found in this file */
  diagnostics: vscode.Diagnostic[];
}

/**
 * Complete diagnostics report for all templates
 */
export interface DiagnosticsReport {
  /** Total number of issues found */
  totalIssues: number;
  /** Reports grouped by file */
  fileReports: FileReport[];
  /** Timestamp when the report was generated */
  timestamp: Date;
}

const BATCH_SIZE = 20; // Process files in batches to manage memory
const GC_PAUSE_MS = 10; // Small pause between batches for garbage collection

/**
 * Generates a comprehensive diagnostics report for all templates in the workspace.
 *
 * @param diagnosticProvider - The diagnostic provider instance
 * @param progress - Optional progress reporter
 * @param token - Optional cancellation token
 * @returns A structured report containing all diagnostic issues grouped by file
 */
export async function generateFullDiagnosticsReport(
  diagnosticProvider: DiagnosticProvider,
  progress?: vscode.Progress<{ message?: string; increment?: number }>,
  token?: vscode.CancellationToken
): Promise<DiagnosticsReport> {
  const report: DiagnosticsReport = {
    totalIssues: 0,
    fileReports: [],
    timestamp: new Date(),
  };

  // Find all TypeScript files that might be Angular components
  const tsFiles = await vscode.workspace.findFiles("**/*.ts", "**/node_modules/**");
  const htmlFiles = await vscode.workspace.findFiles("**/*.html", "**/node_modules/**");

  // Fast pre-filter TypeScript files to reduce memory usage
  const candidateTsFiles = await filterCandidateFiles(tsFiles, token);

  if (token?.isCancellationRequested) {
    throw new Error("Operation cancelled by user");
  }

  const totalFiles = candidateTsFiles.length + htmlFiles.length;

  logger.info(
    `[DiagnosticsReporter] Found ${candidateTsFiles.length} candidate TypeScript files and ${htmlFiles.length} HTML files`
  );

  // Process TypeScript files in batches (for inline templates)
  const tsContext = { processedFiles: 0, totalFiles };
  await processBatchedFiles(candidateTsFiles, "inline", diagnosticProvider, report, progress, token, tsContext);

  // Process HTML files in batches (external templates)
  await processBatchedFiles(htmlFiles, "external", diagnosticProvider, report, progress, token, tsContext);

  return report;
}

/**
 * Processes files in batches to manage memory usage.
 */
async function processBatchedFiles(
  files: vscode.Uri[],
  templateType: "inline" | "external",
  diagnosticProvider: DiagnosticProvider,
  report: DiagnosticsReport,
  progress: vscode.Progress<{ message?: string; increment?: number }> | undefined,
  token: vscode.CancellationToken | undefined,
  context: { processedFiles: number; totalFiles: number }
): Promise<void> {
  const fileTypeLabel = templateType === "inline" ? "TypeScript files" : "HTML templates";

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    if (token?.isCancellationRequested) {
      throw new Error("Operation cancelled by user");
    }

    const batch = files.slice(i, i + BATCH_SIZE);

    for (const fileUri of batch) {
      context.processedFiles++;
      if (progress) {
        progress.report({
          message: `Scanning ${fileTypeLabel} (${context.processedFiles}/${context.totalFiles})...`,
          increment: (1 / context.totalFiles) * 100,
        });
      }

      try {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const fileReport = await generateFileReport(document, templateType, diagnosticProvider);

        if (fileReport.diagnostics.length > 0) {
          report.fileReports.push(fileReport);
          report.totalIssues += fileReport.diagnostics.length;
        }
      } catch (error) {
        logger.error(`[DiagnosticsReporter] Error processing ${fileUri.fsPath}:`, error as Error);
      }
    }

    // Small pause between batches to allow garbage collection
    await new Promise((resolve) => setTimeout(resolve, GC_PAUSE_MS));
  }
}

/**
 * Fast pre-filter TypeScript files to find Angular component candidates.
 * Uses fs.readFile for fast content check without opening VS Code documents.
 *
 * @param files - Array of file URIs to filter
 * @param token - Optional cancellation token
 * @returns Filtered array of candidate files
 */
async function filterCandidateFiles(files: vscode.Uri[], token?: vscode.CancellationToken): Promise<vscode.Uri[]> {
  const candidates: vscode.Uri[] = [];

  for (let i = 0; i < files.length; i++) {
    if (token?.isCancellationRequested) {
      break;
    }

    const file = files[i];

    try {
      // Fast check: read file content and look for @Component and standalone
      const content = await fs.promises.readFile(file.fsPath, "utf-8");

      // Only include files that contain @Component decorator and standalone
      if (content.includes("@Component") && content.includes("standalone")) {
        candidates.push(file);
      }
    } catch (_error) {
      // Skip files that can't be read
      logger.debug(`[DiagnosticsReporter] Could not read file for filtering: ${file.fsPath}`);
    }
  }

  return candidates;
}

/**
 * Generates a diagnostics report for a single file.
 *
 * @param document - The document to analyze
 * @param templateType - Type of template (inline or external)
 * @param diagnosticProvider - The diagnostic provider instance
 * @returns A file report containing all diagnostics for this file
 */
async function generateFileReport(
  document: vscode.TextDocument,
  templateType: "inline" | "external",
  diagnosticProvider: DiagnosticProvider
): Promise<FileReport> {
  const fileReport: FileReport = {
    filePath: document.fileName,
    templateType,
    diagnostics: [],
  };

  try {
    // For TypeScript files, check if they have inline templates
    if (templateType === "inline") {
      // Check if it's a component file with standalone
      const content = document.getText();
      if (!content.includes("@Component") || !content.includes("standalone")) {
        return fileReport;
      }
    }

    // For HTML files, check if corresponding .ts file exists and is standalone
    if (templateType === "external") {
      const componentPath = switchFileType(document.fileName, ".ts");
      if (!fs.existsSync(componentPath)) {
        return fileReport;
      }

      const tsDocument = await getTsDocument(document, componentPath);
      if (!tsDocument) {
        return fileReport;
      }

      // Quick check if it's a standalone component (without full parsing)
      const tsContent = tsDocument.getText();
      if (!tsContent.includes("@Component") || !tsContent.includes("standalone")) {
        return fileReport;
      }
    }

    // Get diagnostics from the diagnostic provider
    // We force update diagnostics for this specific file
    await diagnosticProvider.forceUpdateDiagnosticsForFile(document.fileName);

    // Get the diagnostics that were generated
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    const angularDiagnostics = diagnostics.filter((d) => d.source === "angular-auto-import");

    fileReport.diagnostics = angularDiagnostics;
  } catch (error) {
    logger.error(`[DiagnosticsReporter] Error generating file report for ${document.fileName}:`, error as Error);
  }

  return fileReport;
}
