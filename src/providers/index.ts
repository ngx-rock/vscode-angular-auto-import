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
}

/**
 * Registers all VSCode providers for the extension.
 * @param context The extension context.
 * @param providerContext The context to be shared among providers.
 */
export function registerProviders(context: vscode.ExtensionContext, providerContext: ProviderContext): void {
  logger.info("🔌 Registering VSCode providers...");

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
    // setGlobalDiagnosticProvider(diagnosticProvider); // This line is removed

    // Deactivate when the extension is deactivated
    context.subscriptions.push({
      dispose: () => {
        diagnosticProvider.deactivate();
        // setGlobalDiagnosticProvider(null); // This line is removed
      },
    });
  }

  logger.info("✅ All providers registered successfully");
}
