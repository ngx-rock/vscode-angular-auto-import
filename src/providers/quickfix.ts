/**
 * =================================================================================================
 * Angular Auto-Import QuickFix Provider
 * =================================================================================================
 */

import * as path from "node:path";
import * as vscode from "vscode";
import type { AngularIndexer } from "../services";
import * as TsConfigHelper from "../services/tsconfig";
import type { AngularElementData } from "../types";
import { getAngularElement } from "../utils";

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

    const diagnosticsToFix = context.diagnostics.filter((diagnostic) => diagnostic.range.contains(range));

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
            const quickFixes = await this.createQuickFixesForDiagnostic(document, diagnostic, indexer);

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
    // Handle our own diagnostics
    if (diagnostic.source === "angular-auto-import") {
      return true;
    }

    // Handle any diagnostic that suggests missing imports - universal pattern matching
    const message = diagnostic.message;
    return message.includes("Can't bind to") || 
           message.includes("is not a known element") ||
           message.includes("is not a known property") ||
           message.includes("isn't a known property");
  }

  private async createQuickFixesForDiagnostic(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    indexer: AngularIndexer
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    try {
      let selectorToSearch: string | null = null;

      if (diagnostic.source === "angular-auto-import") {
        // The diagnostic code is expected to be in the format "type:selector"
        if (typeof diagnostic.code === "string" && diagnostic.code.includes(":")) {
          selectorToSearch = diagnostic.code.split(":")[1];
        }
      } else {
        // Universal pattern matching for any diagnostic source
        const message = diagnostic.message;
        const cantBindMatch = message.match(/Can't bind to '([^']+)'/);
        const notKnownElementMatch = message.match(/'([^']+)' is not a known element/);
        const notKnownPropertyMatch = message.match(/'([^']+)' (?:is not a known property|isn't a known property)/);
        
        if (cantBindMatch) {
          selectorToSearch = cantBindMatch[1];
        } else if (notKnownElementMatch) {
          selectorToSearch = notKnownElementMatch[1];
        } else if (notKnownPropertyMatch) {
          selectorToSearch = notKnownPropertyMatch[1];
        }
      }

      if (selectorToSearch) {
        console.log(`[QuickfixImportProvider] Looking for selector: "${selectorToSearch}"`);

        const elementData = getAngularElement(selectorToSearch, indexer);

        if (elementData) {
          console.log(`[QuickfixImportProvider] Found exact match for: "${selectorToSearch}"`);

          let isAliasPath = false;
          const projCtx = this.getProjectContextForDocument(document);

          if (projCtx && elementData.path) {
            const absoluteTargetModulePath = path.join(projCtx.projectRootPath, elementData.path);
            // ts-morph uses sources files without extension
            const absoluteTargetModulePathNoExt = absoluteTargetModulePath.replace(/\.ts$/, "");

            const importPath = await TsConfigHelper.resolveImportPath(
              absoluteTargetModulePathNoExt,
              document.uri.fsPath,
              projCtx.projectRootPath
            );

            // An alias path will not start with '.', whereas a relative path will.
            isAliasPath = !importPath.startsWith(".");
          }

          // The selector passed to the command must be the one found in the index
          const action = this.createCodeAction(elementData, diagnostic, isAliasPath, selectorToSearch);
          if (action) {
            actions.push(action);
          }
        }
      }
    } catch (error) {
      console.error("QuickfixImportProvider: Error creating quick fixes:", error);
    }

    return actions;
  }

  private createCodeAction(
    element: AngularElementData,
    diagnostic: vscode.Diagnostic,
    isAliasPath: boolean,
    selector: string
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

      const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);

      action.command = {
        title: `Import ${element.name}`,
        command: "angular-auto-import.importElement",
        arguments: [selector],
      };

      action.diagnostics = [diagnostic];
      action.isPreferred = isStandardAngular || isAliasPath;

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
