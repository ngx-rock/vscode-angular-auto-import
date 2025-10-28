/**
 *
 * VSCode Providers Registration
 *
 * @module
 */

import * as vscode from "vscode";
import type { ExtensionConfig } from "../config";
import { logger } from "../logger";
import type { AngularIndexer } from "../services";
import type { ProcessedTsConfig } from "../types";
import { CompletionProvider } from "./completion";
import { DefinitionProvider } from "./definition";
import { DiagnosticProvider } from "./diagnostics";
import { QuickfixImportProvider } from "./quickfix";

/**
 * Context for the providers.
 */
export interface ProviderContext {
  /**
   * A map of project root paths to their corresponding `AngularIndexer` instances.
   */
  projectIndexers: Map<string, AngularIndexer>;
  /**
   * A map of project root paths to their corresponding processed `tsconfig.json` files.
   */
  projectTsConfigs: Map<string, ProcessedTsConfig | null>;
  /**
   * The current extension configuration.
   */
  extensionConfig: ExtensionConfig;
  /**
   * The extension context.
   */
  extensionContext: vscode.ExtensionContext;
  /**
   * The diagnostic provider instance (optional, set after registration).
   */
  diagnosticProvider?: DiagnosticProvider;
}

/**
 * Registers all VSCode providers for the extension.
 * @param context The extension context.
 * @param providerContext The context to be shared among providers.
 */
export function registerProviders(
  context: vscode.ExtensionContext,
  providerContext: ProviderContext
): DiagnosticProvider | undefined {
  logger.info("🔌 Registering VSCode providers...");

  // Completion Provider (always register, filtering is done internally)
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
  context.subscriptions.push(completionProvider);

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

  // Definition Provider
  const definitionProvider = new DefinitionProvider(providerContext);
  const definitionDisposable = vscode.languages.registerDefinitionProvider(
    [
      { scheme: "file", language: "html" },
      { scheme: "file", language: "typescript" },
    ],
    definitionProvider
  );
  context.subscriptions.push(definitionDisposable);

  let diagnosticProvider: DiagnosticProvider | undefined;

  // Diagnostic Provider (always create unless disabled)
  const diagnosticsMode = providerContext.extensionConfig.diagnosticsMode;
  if (diagnosticsMode !== "disabled") {
    diagnosticProvider = new DiagnosticProvider(providerContext);
    diagnosticProvider.activate();

    // Add to provider context so QuickFix and Fix All can access it
    providerContext.diagnosticProvider = diagnosticProvider;

    // Deactivate when the extension is deactivated
    context.subscriptions.push({
      dispose: () => {
        diagnosticProvider?.deactivate();
      },
    });
  }

  logger.info("✅ All providers registered successfully");
  return diagnosticProvider;
}
