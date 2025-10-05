/**
 * Manages extension settings and configuration.
 *
 * This module provides utilities for reading and monitoring VS Code extension settings,
 * specifically for the Angular Auto-Import extension configuration.
 *
 * @module
 */
import * as vscode from "vscode";

/**
 * Configuration interface for the Angular Auto-Import extension.
 *
 * Contains all user-configurable settings that control the behavior
 * of the Angular Auto-Import extension.
 *
 * @interface ExtensionConfig
 *
 * @example
 * ```typescript
 * const config: ExtensionConfig = {
 *   projectPath: '/path/to/project',
 *   indexRefreshInterval: 60,
 *   diagnosticsEnabled: true,
 *   diagnosticsSeverity: 'warning'
 * };
 * ```
 */
export interface ExtensionConfig {
  /**
   * Optional path to a specific Angular project.
   * When null, the extension will auto-detect projects in the workspace.
   */
  projectPath: string | null;
  /**
   * Interval in seconds for automatic index refresh.
   * Set to 0 to disable automatic refresh.
   * @default 60
   */
  indexRefreshInterval: number;
  /**
   * Whether to enable auto-completion suggestions for Angular elements.
   * @default true
   */
  completionEnabled: boolean;
  /**
   * Whether to enable diagnostic messages for missing imports.
   * @default true
   */
  diagnosticsEnabled: boolean;
  /**
   * Severity level for diagnostic messages.
   * Valid values: 'error', 'warning', 'information', 'hint'
   * @default 'warning'
   */
  diagnosticsSeverity: string;
  /**
   * Logging configuration settings.
   */
  logging: {
    /**
     * Whether logging is enabled.
     * @default true
     */
    enabled: boolean;
    /**
     * Logging level threshold.
     * @default 'INFO'
     */
    level: string;
    /**
     * Whether file logging is enabled.
     * @default false
     */
    fileLoggingEnabled: boolean;
    /**
     * Directory for log files.
     * @default null
     */
    logDirectory: string | null;
    /**
     * Maximum log file size in MB before rotation.
     * @default 5
     */
    rotationMaxSize: number;
    /**
     * Maximum number of log files to keep.
     * @default 5
     */
    rotationMaxFiles: number;
    /**
     * Log output format.
     * @default 'plain'
     */
    outputFormat: string;
  };
}

/**
 * Retrieves the current extension configuration from VS Code settings.
 *
 * Reads all Angular Auto-Import related settings from the VS Code configuration
 * and returns them as a structured configuration object with appropriate defaults.
 *
 * @returns The current extension configuration with all settings
 *
 * @example
 * ```typescript
 * const config = getConfiguration();
 * if (config.diagnosticsEnabled) {
 *   // Enable diagnostics features
 * }
 * ```
 */
export function getConfiguration(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration("angular-auto-import");

  return {
    projectPath: config.get<string | null>("projectPath", null),
    indexRefreshInterval: config.get<number>("index.refreshInterval", 60),
    completionEnabled: config.get<boolean>("completion.enabled", true),
    diagnosticsEnabled: config.get<boolean>("diagnostics.enabled", true),
    diagnosticsSeverity: config.get<string>("diagnostics.severity", "warning"),
    logging: {
      enabled: config.get<boolean>("logging.enabled", true),
      level: config.get<string>("logging.level", "INFO"),
      fileLoggingEnabled: config.get<boolean>("logging.fileLoggingEnabled", false),
      logDirectory: config.get<string | null>("logging.logDirectory", null),
      rotationMaxSize: config.get<number>("logging.rotationMaxSize", 5),
      rotationMaxFiles: config.get<number>("logging.rotationMaxFiles", 5),
      outputFormat: config.get<string>("logging.outputFormat", "plain"),
    },
  };
}

/**
 * Registers a callback to be invoked when Angular Auto-Import configuration changes.
 *
 * This function sets up a configuration change listener that will call the provided
 * callback whenever any Angular Auto-Import settings are modified by the user.
 *
 * @param callback - Function to call when configuration changes, receives the new configuration
 * @returns A disposable that can be used to unregister the listener
 *
 * @example
 * ```typescript
 * const disposable = onConfigurationChanged((newConfig) => {
 *   console.log('Configuration updated:', newConfig);
 *   // Update extension behavior based on new config
 * });
 *
 * // Later, to stop listening:
 * disposable.dispose();
 * ```
 */
export function onConfigurationChanged(callback: (config: ExtensionConfig) => void): vscode.Disposable {
  return vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("angular-auto-import")) {
      callback(getConfiguration());
    }
  });
}
