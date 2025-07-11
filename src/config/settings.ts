/**
 * Manages extension settings and configuration.
 */
import * as vscode from "vscode";

export interface ExtensionConfig {
  projectPath: string | null;
  indexRefreshInterval: number;
  diagnosticsEnabled: boolean;
  diagnosticsSeverity: string;
}

export function getConfiguration(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration("angular-auto-import");

  return {
    projectPath: config.get<string | null>("projectPath", null),
    indexRefreshInterval: config.get<number>("index.refreshInterval", 60),
    diagnosticsEnabled: config.get<boolean>("diagnostics.enabled", true),
    diagnosticsSeverity: config.get<string>("diagnostics.severity", "warning"),
  };
}

export function onConfigurationChanged(callback: (config: ExtensionConfig) => void): vscode.Disposable {
  return vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("angular-auto-import")) {
      callback(getConfiguration());
    }
  });
}
