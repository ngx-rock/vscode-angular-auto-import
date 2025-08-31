import * as vscode from "vscode";
import type { LogEntry, LoggerConfig, Transport } from "./types";

export class ChannelTransport implements Transport {
  private readonly outputChannel: vscode.OutputChannel;
  private readonly config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.outputChannel = vscode.window.createOutputChannel("Angular Auto Import");
  }

  public log(entry: LogEntry): void {
    const message = this.format(entry);
    this.outputChannel.appendLine(message);

    if (entry.level === "ERROR" || entry.level === "FATAL") {
      this.outputChannel.show(true); // Preserve focus on the editor
    }
  }

  private format(entry: LogEntry): string {
    if (this.config.outputFormat === "json") {
      return JSON.stringify(entry, null, 2);
    }

    const { timestamp, level, message, context } = entry;
    let formattedMessage = `[${timestamp}][${level}] ${message}`;

    if (context) {
      try {
        const contextString = JSON.stringify(context, null, 2);
        // Indent context for better readability
        const indentedContext = contextString
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n");
        formattedMessage += `\n${indentedContext}`;
      } catch (error) {
        // Handle circular references in context
        formattedMessage += `\n  Context: [Could not stringify context: ${error}]`;
      }
    }

    return formattedMessage;
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }
}
