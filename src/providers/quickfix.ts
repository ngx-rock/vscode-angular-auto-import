/**
 * =================================================================================================
 * Angular Auto-Import QuickFix Provider
 * =================================================================================================
 */

import * as vscode from "vscode";
import { AngularElementData } from "../types";
import { getAngularElement } from "../utils";
import { ProviderContext } from "./index";

/**
 * Provides QuickFix actions for Angular elements.
 */
export class QuickfixImportProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  constructor(private context: ProviderContext) {}

  // Common Angular Language Service error codes for missing components/pipes
  public static readonly fixesDiagnosticCode: (string | number)[] = [
    "NG8001", // '%name%' is not a known element (if 'name' is an Angular component)
    "NG8002", // '%name%' is not a known element (if 'name' is an HTML element, but used as component)
    "NG8003", // '%name%' is not a known attribute name (often for directives)
    "NG6004", // The pipe '%name%' could not be found!
    "NG8116", // Structural directive used without corresponding import
    "NG8103", // Missing control flow directive
    "-998116", // A structural directive was used in the template without a corresponding import
    "-998002", // Can't bind to property since it isn't a known property
    "-998004", // No pipe found with name 'pipeName'
    "-998103", // Control flow directive without corresponding import
    "-992011", // Directive appears in imports but is not standalone
    "missing-directive-import",
    "missing-structural-directive-import",
    "missing-component-import",
    "missing-pipe-import",
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    try {
      // Check for cancellation
      if (_token?.isCancellationRequested) {
        return [];
      }

      if (!context.diagnostics || !Array.isArray(context.diagnostics)) {
        return [];
      }

      const projCtx = this.getProjectContextForDocument(document);
      if (!projCtx) {
        return [];
      }

      const { indexer } = projCtx;
      const actions: vscode.CodeAction[] = [];

      for (const diagnostic of context.diagnostics) {
        if (!diagnostic || !diagnostic.message) {
          continue;
        }

        try {
          if (this.isFixableDiagnostic(diagnostic)) {
            const quickFixes = this.createQuickFixesForDiagnostic(
              document,
              diagnostic,
              indexer
            );

            const validQuickFixes = quickFixes.filter((action) => {
              return this.validateCodeAction(action);
            });

            actions.push(...validQuickFixes);
          }
        } catch (error) {
          console.error(
            "QuickfixImportProvider: Error processing diagnostic:",
            error
          );
        }
      }

      // Deduplicate actions
      const dedupedActionsMap = new Map<string, vscode.CodeAction>();
      for (const action of actions) {
        const cmd = action.command?.command || "";
        const args = JSON.stringify(action.command?.arguments || []);
        const key = `${cmd}:${args}`;

        if (dedupedActionsMap.has(key)) {
          const existingAction = dedupedActionsMap.get(key)!;
          if (action.isPreferred && !existingAction.isPreferred) {
            dedupedActionsMap.set(key, action);
          }
        } else {
          dedupedActionsMap.set(key, action);
        }
      }

      const uniqueActions = Array.from(dedupedActionsMap.values()).sort(
        (a, b) => {
          if (a.isPreferred && !b.isPreferred) {
            return -1;
          }
          if (!a.isPreferred && b.isPreferred) {
            return 1;
          }
          return a.title.localeCompare(b.title);
        }
      );

      return uniqueActions;
    } catch (error) {
      console.error(
        "QuickfixImportProvider: Critical error in provideCodeActions:",
        error
      );
      return [];
    }
  }

  private isFixableDiagnostic(diagnostic: vscode.Diagnostic): boolean {
    if (!diagnostic || !diagnostic.message) {
      return false;
    }

    // Check diagnostic code
    if (diagnostic.code) {
      const codeStr = String(diagnostic.code);
      if (
        QuickfixImportProvider.fixesDiagnosticCode.some(
          (c) => String(c) === codeStr
        )
      ) {
        return true;
      }
    }

    // Check source
    if (diagnostic.source === "angular-auto-import") {
      return true;
    }

    // Check message patterns
    const message = diagnostic.message.toLowerCase();
    return (
      message.includes("is not a known element") ||
      message.includes("is not a known attribute") ||
      message.includes("structural directive") ||
      (message.includes("pipe") &&
        (message.includes("could not be found") ||
          message.includes("is not found"))) ||
      message.includes("can't bind to") ||
      message.includes("unknown html tag")
    );
  }

  private createQuickFixesForDiagnostic(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    indexer: any
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    try {
      const extractedTerm = document.getText(diagnostic.range).trim();
      const message = diagnostic.message;
      let termFromMessage: string | null = null;

      // Extract term from various message patterns
      const patterns = [
        /['"]([^'"]+)['"]\s+is\s+not\s+a\s+known\s+element/i,
        /(?:pipe|The pipe)\s+['"]([^'"]+)['"]\s+(?:could not be found|is not found)/i,
        /No pipe found with name\s+['"]([^'"]+)['"]/i,
        /structural directive\s+[`'"]([^`'"]+)[`'"]\s+was used/i,
        /[`'"](\*[a-zA-Z][a-zA-Z0-9]*)[`'"]/i,
        /['"]([^'"]+)['"]\s+is\s+not\s+a\s+known\s+attribute/i,
        /Can't bind to\s+['"]([^'"]+)['"]\s+since it isn't a known property/i,
      ];

      for (const pattern of patterns) {
        const match = pattern.exec(message);
        if (match && match[1]) {
          termFromMessage = match[1];
          break;
        }
      }

      const selectorToSearch = this.extractSelector(
        termFromMessage || extractedTerm
      );

      if (selectorToSearch) {
        const elementData = getAngularElement(selectorToSearch, indexer);

        if (elementData) {
          const action = this.createCodeAction(
            elementData,
            selectorToSearch,
            diagnostic
          );
          if (action) {
            actions.push(action);
          }
        } else {
          // Try partial matches
          const partialMatches = this.findPartialMatches(
            selectorToSearch,
            indexer
          );

          for (const match of partialMatches.slice(0, 3)) {
            const partialAction = this.createCodeAction(
              match,
              match.selector,
              diagnostic
            );
            if (partialAction) {
              actions.push(partialAction);
            }
          }
        }
      }
    } catch (error) {
      console.error(
        "QuickfixImportProvider: Error creating quick fixes:",
        error
      );
    }

    return actions;
  }

  private extractSelector(text: string): string {
    if (!text || typeof text !== "string") {
      return "";
    }

    let cleaned = text.trim();

    // Remove < > and any attributes for tags
    cleaned = cleaned.replace(/^<([a-zA-Z0-9-]+)[\s\S]*?>?$/, "$1");

    // Handle structural directives
    if (cleaned.startsWith("*")) {
      return cleaned;
    }

    // Handle attribute directives
    if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
      cleaned = cleaned.slice(1, -1);
    }

    // For pipes
    const pipeMatch = cleaned.match(/\|\s*([a-zA-Z0-9_-]+)/);
    if (pipeMatch && pipeMatch[1]) {
      return pipeMatch[1];
    }

    return cleaned.split(/[^a-zA-Z0-9_-]/)[0];
  }

  private findPartialMatches(
    searchTerm: string,
    indexer: any
  ): Array<AngularElementData & { selector: string }> {
    const matches: Array<AngularElementData & { selector: string }> = [];

    try {
      const allSelectors = Array.from(indexer.getAllSelectors());
      const seenElements = new Set<string>();

      for (const selector of allSelectors) {
        // Type guard to ensure selector is string
        if (
          typeof selector === "string" &&
          selector.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          const element = getAngularElement(selector, indexer);
          if (element) {
            const elementKey = `${element.name}:${element.type}`;
            if (!seenElements.has(elementKey)) {
              seenElements.add(elementKey);
              matches.push({ ...element, selector });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error finding partial matches:", error);
    }

    return matches.slice(0, 5);
  }

  private createCodeAction(
    element: AngularElementData,
    selector: string,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction | null {
    try {
      const isStandardAngular = element.path.startsWith("@angular/");
      const isModule = element.name.endsWith("Module");

      let title: string;
      if (isModule) {
        title = `Import ${element.name} module`;
      } else if (isStandardAngular) {
        title = `Import ${element.name} (Angular)`;
      } else {
        title = `Import ${element.name} (${element.type})`;
      }

      const action = new vscode.CodeAction(
        title,
        vscode.CodeActionKind.QuickFix
      );

      action.command = {
        title: `Import ${element.name}`,
        command: "angular-auto-import.importElement",
        arguments: [selector],
      };

      action.diagnostics = [diagnostic];
      action.isPreferred = isStandardAngular;

      return action;
    } catch (error) {
      console.error("Error creating code action:", error);
      return null;
    }
  }

  private validateCodeAction(action: any): boolean {
    try {
      return !!(
        action &&
        typeof action === "object" &&
        action.title &&
        typeof action.title === "string" &&
        action.kind &&
        action.command &&
        typeof action.command === "object" &&
        action.command.command &&
        typeof action.command.command === "string" &&
        Array.isArray(action.command.arguments)
      );
    } catch (error) {
      return false;
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
