/**
 * =================================================================================================
 * Angular Auto-Import Code Action Provider
 * =================================================================================================
 */

import * as vscode from "vscode";
import { AngularElementData } from "../types";
import { ProviderContext } from "./index";

/**
 * Provides Code Actions for Angular elements.
 */
export class CodeActionProvider implements vscode.CodeActionProvider {
  constructor(private context: ProviderContext) {}

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    _context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    if (token.isCancellationRequested) {
      return [];
    }

    try {
      const projectContext = this.getProjectContextForDocument(document);
      if (!projectContext) {
        return [];
      }

      const { indexer } = projectContext;
      const actions: vscode.CodeAction[] = [];

      // Get the text under the cursor
      const wordRange = document.getWordRangeAtPosition(range.start);
      if (!wordRange) {
        return [];
      }

      const word = document.getText(wordRange);
      if (!word || word.length < 2) {
        return [];
      }

      // Find matching elements
      const allSelectors = Array.from(indexer.getAllSelectors());
      const matchingElements: AngularElementData[] = [];

      for (const selector of allSelectors) {
        if (selector.toLowerCase().includes(word.toLowerCase())) {
          const element = indexer.getElement(selector);
          if (element) {
            matchingElements.push(element);
          }
        }
      }

      // Create Code Actions for each found element
      for (const element of matchingElements.slice(0, 5)) {
        // Limit to 5 elements
        const action = this.createImportAction(element, document, wordRange);
        if (action) {
          actions.push(action);
        }
      }

      return actions;
    } catch (error) {
      console.error("Error providing code actions:", error);
      return [];
    }
  }

  /**
   * Creates a Code Action to import an element.
   */
  private createImportAction(
    element: AngularElementData,
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction | null {
    try {
      const action = new vscode.CodeAction(
        `Import ${element.name} from ${element.path}`,
        vscode.CodeActionKind.QuickFix
      );

      action.edit = new vscode.WorkspaceEdit();

      // For simplicity, we don't add automatic import for now.
      // This can be extended in the future to generate the import.
      action.edit.replace(document.uri, range, element.name);

      action.isPreferred = true;

      return action;
    } catch (error) {
      console.error(`Error creating import action for ${element.name}:`, error);
      return null;
    }
  }

  /**
   * Gets the project context for a document.
   */
  private getProjectContextForDocument(document: vscode.TextDocument) {
    for (const [projectPath, indexer] of this.context.projectIndexers) {
      if (document.uri.fsPath.startsWith(projectPath)) {
        const tsConfig = this.context.projectTsConfigs.get(projectPath);
        return { indexer, projectRootPath: projectPath, tsConfig };
      }
    }
    return null;
  }
}
