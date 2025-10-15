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

/**
 * Generates a comprehensive diagnostics report for all templates in the workspace.
 *
 * @param diagnosticProvider - The diagnostic provider instance
 * @param progress - Optional progress reporter
 * @returns A structured report containing all diagnostic issues grouped by file
 */
export async function generateFullDiagnosticsReport(
  diagnosticProvider: DiagnosticProvider,
  progress?: vscode.Progress<{ message?: string; increment?: number }>
): Promise<DiagnosticsReport> {
  const report: DiagnosticsReport = {
    totalIssues: 0,
    fileReports: [],
    timestamp: new Date(),
  };

  // Find all TypeScript files that might be Angular components
  const tsFiles = await vscode.workspace.findFiles("**/*.ts", "**/node_modules/**");
  const htmlFiles = await vscode.workspace.findFiles("**/*.html", "**/node_modules/**");

  const totalFiles = tsFiles.length + htmlFiles.length;
  let processedFiles = 0;

  // Process TypeScript files (for inline templates)
  for (const tsFileUri of tsFiles) {
    processedFiles++;
    if (progress) {
      progress.report({
        message: `Scanning TypeScript files (${processedFiles}/${totalFiles})...`,
        increment: (1 / totalFiles) * 100,
      });
    }

    try {
      const document = await vscode.workspace.openTextDocument(tsFileUri);
      const fileReport = await generateFileReport(document, "inline", diagnosticProvider);

      if (fileReport.diagnostics.length > 0) {
        report.fileReports.push(fileReport);
        report.totalIssues += fileReport.diagnostics.length;
      }
    } catch (error) {
      logger.error(`[DiagnosticsReporter] Error processing ${tsFileUri.fsPath}:`, error as Error);
    }
  }

  // Process HTML files (external templates)
  for (const htmlFileUri of htmlFiles) {
    processedFiles++;
    if (progress) {
      progress.report({
        message: `Scanning HTML templates (${processedFiles}/${totalFiles})...`,
        increment: (1 / totalFiles) * 100,
      });
    }

    try {
      const document = await vscode.workspace.openTextDocument(htmlFileUri);
      const fileReport = await generateFileReport(document, "external", diagnosticProvider);

      if (fileReport.diagnostics.length > 0) {
        report.fileReports.push(fileReport);
        report.totalIssues += fileReport.diagnostics.length;
      }
    } catch (error) {
      logger.error(`[DiagnosticsReporter] Error processing ${htmlFileUri.fsPath}:`, error as Error);
    }
  }

  return report;
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
