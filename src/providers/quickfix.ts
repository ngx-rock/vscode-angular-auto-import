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
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    const diagnosticsToFix = context.diagnostics.filter(
      (diagnostic) => !!range.intersection(diagnostic.range)
    );

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
        console.log(`[QuickfixImportProvider] Looking for selector: "${selectorToSearch}"`);
        
        // Try to find exact match first
        let elementData = getAngularElement(selectorToSearch, indexer);

        // If not found, try alternative selector formats for the same element
        if (!elementData) {
          const alternativeSelectors = this.generateAlternativeSelectors(selectorToSearch);
          console.log(`[QuickfixImportProvider] Trying alternative selectors:`, alternativeSelectors);
          
          for (const altSelector of alternativeSelectors) {
            elementData = getAngularElement(altSelector, indexer);
            if (elementData) {
              console.log(`[QuickfixImportProvider] Found element with alternative selector: "${altSelector}"`);
              break;
            }
          }
        } else {
          console.log(`[QuickfixImportProvider] Found exact match for: "${selectorToSearch}"`);
        }

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
          // Try partial matches only if no exact match found
          const partialMatches = this.findPartialMatches(
            selectorToSearch,
            indexer
          );

          // Only show partial matches if we have very few or very relevant ones
          for (const match of partialMatches.slice(0, 2)) { // Reduced to max 2
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
    return [...new Set(alternatives)].filter(alt => alt !== selector);
  }

  private findPartialMatches(
    searchTerm: string,
    indexer: any
  ): Array<AngularElementData & { selector: string }> {
    const matches: Array<AngularElementData & { selector: string; score: number }> = [];

    try {
      const allSelectors = Array.from(indexer.getAllSelectors());
      const seenElements = new Set<string>();
      const searchTermLower = searchTerm.toLowerCase();

      for (const selector of allSelectors) {
        if (typeof selector !== "string") {continue;}
        
        const selectorLower = selector.toLowerCase();
        let score = 0;

        // 1. Exact match (highest priority)
        if (selectorLower === searchTermLower) {
          score = 1000;
        }
        // 2. Exact prefix match
        else if (selectorLower.startsWith(searchTermLower)) {
          score = 900;
        }
        // 3. Exact suffix match
        else if (selectorLower.endsWith(searchTermLower)) {
          score = 800;
        }
        // 4. Contains the full search term as a whole word
        else if (selectorLower.includes(searchTermLower)) {
          // Check if it's a word boundary match (better than partial word match)
          const regex = new RegExp(`\\b${searchTermLower.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\\b`);
          if (regex.test(selectorLower)) {
            score = 700;
          } else {
            score = 600;
          }
        }
        // 5. Fuzzy match: check if search term parts are present in order
        else {
          const searchParts = searchTermLower.split(/[-_]/);
          if (searchParts.length > 1) {
            let allPartsFound = true;
            let lastIndex = -1;
            
            for (const part of searchParts) {
              const index = selectorLower.indexOf(part, lastIndex + 1);
              if (index === -1) {
                allPartsFound = false;
                break;
              }
              lastIndex = index;
            }
            
            if (allPartsFound) {
              // Score based on how many parts match and their positions
              score = 400 + (searchParts.length * 10);
            }
          }
        }

        // Only include if there's a meaningful match
        if (score > 0) {
          const element = getAngularElement(selector, indexer);
          if (element) {
            const elementKey = `${element.name}:${element.type}`;
            if (!seenElements.has(elementKey)) {
              seenElements.add(elementKey);
              matches.push({ ...element, selector, score });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error finding partial matches:", error);
    }

    // Sort by score (highest first) and return top results
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Reduced from 5 to 3 for more focused results
      .map(({ score, ...match }) => match); // Remove score from final result
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
