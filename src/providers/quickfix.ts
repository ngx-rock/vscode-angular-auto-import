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

    const diagnosticsToFix = context.diagnostics.filter((diagnostic) => !!range.intersection(diagnostic.range));

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
    if (!diagnostic || !diagnostic.message) {
      return false;
    }

    // Check diagnostic code
    if (diagnostic.code) {
      const codeStr = String(diagnostic.code);
      if (QuickfixImportProvider.fixesDiagnosticCode.some((c) => String(c) === codeStr)) {
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
      (message.includes("pipe") && (message.includes("could not be found") || message.includes("is not found"))) ||
      message.includes("can't bind to") ||
      message.includes("unknown html tag")
    );
  }

  private async createQuickFixesForDiagnostic(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    indexer: AngularIndexer
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    try {
      const extractedTerm = document.getText(diagnostic.range).trim();
      console.error('XXX diagnostic', diagnostic)
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
        if (match?.[1]) {
          termFromMessage = match[1];
          break;
        }
      }

      const selectorToSearch = this.extractSelector(termFromMessage || extractedTerm);

      if (selectorToSearch) {
        console.log(`[QuickfixImportProvider] Looking for selector: "${selectorToSearch}"`);

        let matchedSelector: string | undefined;
        // Try to find exact match first
        let elementData = getAngularElement(selectorToSearch, indexer);
        matchedSelector = selectorToSearch;

        // If not found, try alternative selector formats for the same element
        if (!elementData) {
          const alternativeSelectors = this.generateAlternativeSelectors(selectorToSearch);

          // If the message suggests a structural directive, also try adding a '*' prefix
          const isStructuralMessage = /structural directive/i.test(message);
          if (isStructuralMessage && !selectorToSearch.startsWith("*")) {
            alternativeSelectors.unshift(`*${selectorToSearch}`);
          }

          console.log(`[QuickfixImportProvider] Trying alternative selectors:`, alternativeSelectors);

          for (const altSelector of alternativeSelectors) {
            const found = getAngularElement(altSelector, indexer);
            if (found) {
              elementData = found;
              matchedSelector = altSelector;
              console.log(`[QuickfixImportProvider] Found element with alternative selector: "${altSelector}"`);
              break;
            }
          }
        } else {
          console.log(`[QuickfixImportProvider] Found exact match for: "${selectorToSearch}"`);
        }

        if (elementData && matchedSelector) {
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

          // Normalize selector for import command (remove '*' prefix for structural directives)
          const commandSelector = matchedSelector.startsWith("*") ? matchedSelector.slice(1) : matchedSelector;
          const action = this.createCodeAction(elementData, diagnostic, isAliasPath, commandSelector);
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
    if (pipeMatch?.[1]) {
      return pipeMatch[1];
    }

    return cleaned.split(/[^a-zA-Z0-9_-]/)[0];
  }

  private generateAlternativeSelectors(selector: string): string[] {
    const alternatives: string[] = [];

    if (!selector || typeof selector !== "string") {
      return alternatives;
    }

    // Try different case variations
    alternatives.push(selector.toLowerCase());
    alternatives.push(selector.toUpperCase());

    // Try camelCase to kebab-case conversion and vice versa
    if (selector.includes("-")) {
      // Convert kebab-case to camelCase
      const camelCase = selector.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      alternatives.push(camelCase);
    } else if (/[A-Z]/.test(selector)) {
      // Convert camelCase to kebab-case
      const kebabCase = selector.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      alternatives.push(kebabCase);
    }

    // Try with app- prefix if not present
    if (!selector.startsWith("app-")) {
      alternatives.push(`app-${selector}`);
    }

    // Try without app- prefix if present
    if (selector.startsWith("app-")) {
      alternatives.push(selector.substring(4));
    }

    // Remove duplicates and the original selector
    return [...new Set(alternatives)].filter((alt) => alt !== selector);
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
