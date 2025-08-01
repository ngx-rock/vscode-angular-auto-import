/**
 * =================================================================================================
 * Angular Auto-Import QuickFix Provider
 * =================================================================================================
 */

import * as vscode from "vscode";
import type { AngularIndexer } from "../services";

import type { AngularElementData } from "../types";
import { getAngularElementAsync } from "../utils";

import type { ProviderContext } from "./index";

/**
 * Provides QuickFix actions for Angular elements.
 */
export class QuickfixImportProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  constructor(private context: ProviderContext) {}

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<(vscode.Command | vscode.CodeAction)[]> {
    // Check for null context or diagnostics before proceeding
    if (!context || !context.diagnostics || !Array.isArray(context.diagnostics)) {
      return [];
    }

    // Correctly filter diagnostics: an intersection is enough to offer a fix.
    const diagnosticsToFix = context.diagnostics.filter((diagnostic) => diagnostic.range.intersection(range));

    if (diagnosticsToFix.length === 0) {
      return [];
    }

    // Pass the filtered diagnostics to the rest of the function
    const newContext = { ...context, diagnostics: diagnosticsToFix };

    try {
      // Check for cancellation
      if (token?.isCancellationRequested) {
        return [];
      }

      if (!newContext.diagnostics || !Array.isArray(newContext.diagnostics)) {
        return [];
      }

      const projCtx = this.getProjectContextForDocument(document);
      if (!projCtx) {
        return [];
      }

      const { indexer } = projCtx;
      const actions: vscode.CodeAction[] = [];

      for (const diagnostic of newContext.diagnostics) {
        if (!diagnostic || !diagnostic.message) {
          continue;
        }

        try {
          if (this.isFixableDiagnostic(diagnostic)) {
            const quickFixes = await this.createQuickFixesForDiagnostic(diagnostic, indexer);

            actions.push(...quickFixes);
          }
        } catch (error) {
          console.error("QuickfixImportProvider: Error processing diagnostic:", error);
        }
      }

      // Deduplicate actions
      const dedupedActionsMap = new Map<string, vscode.CodeAction>();
      for (const action of actions) {
        const cmd = action.command?.command || "";
        const args = JSON.stringify(action.command?.arguments || []);
        const key = `${cmd}:${args}`;

        if (dedupedActionsMap.has(key)) {
          const existingAction = dedupedActionsMap.get(key);
          if (!existingAction) {
            continue;
          }
          if (action.isPreferred && !existingAction.isPreferred) {
            dedupedActionsMap.set(key, action);
          }
        } else {
          dedupedActionsMap.set(key, action);
        }
      }

      const uniqueActions = Array.from(dedupedActionsMap.values()).sort((a, b) => {
        if (a.isPreferred && !b.isPreferred) {
          return -1;
        }
        if (!a.isPreferred && b.isPreferred) {
          return 1;
        }
        return a.title.localeCompare(b.title);
      });

      return uniqueActions;
    } catch (error) {
      console.error("QuickfixImportProvider: Critical error in provideCodeActions:", error);
      return [];
    }
  }

  private isFixableDiagnostic(diagnostic: vscode.Diagnostic): boolean {
    // Only handle diagnostics from our own provider.
    return diagnostic.source === "angular-auto-import";
  }

  private async createQuickFixesForDiagnostic(
    diagnostic: vscode.Diagnostic,
    indexer: AngularIndexer
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    try {
      if (typeof diagnostic.code !== "string" || !diagnostic.code.includes(":")) {
        return [];
      }

      const diagnosticCodeParts = (diagnostic.code as string).split(":");
      const selectorToSearch = diagnosticCodeParts[1];
      // const encodedData = diagnosticCodeParts[2];

      if (selectorToSearch) {
        let elementData: AngularElementData | null = null;

        elementData = (await getAngularElementAsync(selectorToSearch, indexer)) ?? null;

        if (elementData) {
          // The selector passed to the command must be the one found in the index
          const action = this.createCodeAction(elementData, diagnostic);
          if (action) {
            return [action];
          }
        }
      }
    } catch (error) {
      console.error("QuickfixImportProvider: Error creating quick fixes:", error);
    }

    return actions;
  }

  private createCodeAction(element: AngularElementData, diagnostic: vscode.Diagnostic): vscode.CodeAction | null {
    try {
      const isModule = element.name.endsWith("Module");

      let title: string;
      if (isModule) {
        title = `⟐ Import ${element.name}`;
      } else if (element.isStandalone) {
        title = `⟐ Import ${element.name} (standalone)`;
      } else if (element.exportingModuleName) {
        title = `⟐ Import ${element.name} (via ${element.exportingModuleName})`;
      } else {
        title = `⟐ Import ${element.name}`;
      }

      const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);

      action.command = {
        title: `Import ${element.name}`,
        command: "angular-auto-import.importElement",
        arguments: [element],
      };

      action.diagnostics = [diagnostic];
      action.isPreferred = true;

      return action;
    } catch (error) {
      console.error("Error creating code action:", error);
      return null;
    }
  }

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
