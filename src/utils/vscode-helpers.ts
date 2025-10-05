/**
 * VS Code Helper Utilities
 * @module
 */

import * as vscode from "vscode";
import { logger } from "../logger";

/**
 * Opens a TypeScript document by path, or returns the current document if paths match
 * @param currentDocument - The currently active document
 * @param componentPath - The path to the TypeScript file to open
 * @returns The opened TextDocument or null if it couldn't be opened
 */
export async function getTsDocument(
  currentDocument: vscode.TextDocument,
  componentPath: string
): Promise<vscode.TextDocument | null> {
  if (currentDocument.fileName === componentPath) {
    return currentDocument;
  }
  const tsDocUri = vscode.Uri.file(componentPath);
  try {
    return await vscode.workspace.openTextDocument(tsDocUri);
  } catch (error) {
    logger.error(`Could not open TS document: ${componentPath}`, error as Error);
    return null;
  }
}
