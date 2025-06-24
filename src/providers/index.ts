/**
 * =================================================================================================
 * VSCode Providers Registration
 * =================================================================================================
 */

import * as vscode from "vscode";
import type { ExtensionConfig } from "../config";
import type { AngularIndexer } from "../services";
import type { ProcessedTsConfig } from "../types";
import { setGlobalDiagnosticProvider } from "../utils/import";
import { CodeActionProvider } from "./code-actions";
import { CompletionProvider } from "./completion";
import { DiagnosticProvider } from "./diagnostics";
import { QuickfixImportProvider } from "./quickfix";

/**
 * Context for the providers.
 */
export interface ProviderContext {
  projectIndexers: Map<string, AngularIndexer>;
  projectTsConfigs: Map<string, ProcessedTsConfig | null>;
  extensionConfig: ExtensionConfig;
  extensionContext: vscode.ExtensionContext;
}

/**
 * Registers all VSCode providers.
 */
export function registerProviders(context: vscode.ExtensionContext, providerContext: ProviderContext): void {
  console.log("🔌 Registering VSCode providers...");

  // Completion Provider
  const completionProvider = new CompletionProvider(providerContext);
  const completionDisposable = vscode.languages.registerCompletionItemProvider(
    [
      { scheme: "file", language: "html" },
      { scheme: "file", language: "typescript" },
    ],
    completionProvider,
    "<",
    "|",
    " ",
    "[",
    "*" // Trigger characters
  );
  context.subscriptions.push(completionDisposable);

  // Code Action Provider
  const codeActionProvider = new CodeActionProvider(providerContext);
  const codeActionDisposable = vscode.languages.registerCodeActionsProvider(
    [
      { scheme: "file", language: "typescript" },
      { scheme: "file", language: "html" },
    ],
    codeActionProvider,
    {
      providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.SourceOrganizeImports],
    }
  );
  context.subscriptions.push(codeActionDisposable);

  // Quickfix Provider
  const quickfixProvider = new QuickfixImportProvider(providerContext);
  const quickfixDisposable = vscode.languages.registerCodeActionsProvider(
    [
      { scheme: "file", language: "html" },
      { scheme: "file", language: "typescript" },
    ],
    quickfixProvider,
    {
      providedCodeActionKinds: QuickfixImportProvider.providedCodeActionKinds,
    }
  );
  context.subscriptions.push(quickfixDisposable);

  // Diagnostic Provider (if enabled)
  if (providerContext.extensionConfig.diagnosticsEnabled) {
    const diagnosticProvider = new DiagnosticProvider(providerContext);
    diagnosticProvider.activate();

    // Set global diagnostic provider for import utils
    setGlobalDiagnosticProvider(diagnosticProvider);

    // Deactivate when the extension is deactivated
    context.subscriptions.push({
      dispose: () => {
        diagnosticProvider.deactivate();
        setGlobalDiagnosticProvider(null);
      },
    });
  }

  console.log("✅ All providers registered successfully");
}
