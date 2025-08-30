import * as vscode from "vscode";
import type { LoggerConfig, LogLevel, LogOutputFormat } from "./types";

export function getLoggerConfig(): LoggerConfig {
  const config = vscode.workspace.getConfiguration("angular-auto-import.logging");

  return {
    enabled: config.get<boolean>("enabled", true),
    level: config.get<LogLevel>("level", "INFO"),
    fileLoggingEnabled: config.get<boolean>("fileLoggingEnabled", false),
    logDirectory: config.get<string | null>("logDirectory", null),
    rotationMaxSize: config.get<number>("rotationMaxSize", 5),
    rotationMaxFiles: config.get<number>("rotationMaxFiles", 5),
    outputFormat: config.get<LogOutputFormat>("outputFormat", "plain"),
  };
}
