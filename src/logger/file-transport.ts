import * as fs from "node:fs/promises";
import * as path from "node:path";
import type * as vscode from "vscode";
import type { LogEntry, LoggerConfig, Transport } from "./types";

export class FileTransport implements Transport {
  private readonly config: LoggerConfig;
  private readonly context: vscode.ExtensionContext;
  private logDirectory!: string;
  private logFilePath!: string;
  private readonly buffer: LogEntry[] = [];
  private isWriting = false;
  private readonly flushInterval: NodeJS.Timeout;

  constructor(config: LoggerConfig, context: vscode.ExtensionContext) {
    this.config = config;
    this.context = context;
    this.initialize();
    this.flushInterval = setInterval(() => this.flush(), 5000); // Flush every 5 seconds
  }

  private async initialize(): Promise<void> {
    if (this.config.logDirectory) {
      this.logDirectory = this.config.logDirectory;
    } else if (this.context.storageUri) {
      this.logDirectory = path.join(this.context.storageUri.fsPath, "logs");
    } else {
      console.error("FileTransport: Cannot determine log directory. Disabling file logging.");
      return;
    }

    this.logFilePath = path.join(this.logDirectory, "extension.log");

    try {
      await fs.mkdir(this.logDirectory, { recursive: true });
    } catch (error) {
      console.error(`FileTransport: Failed to create log directory at ${this.logDirectory}`, error);
    }
  }

  public log(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length > 50) {
      // Flush if buffer is getting large
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.isWriting || this.buffer.length === 0) {
      return;
    }

    this.isWriting = true;
    const entriesToWrite = this.buffer.splice(0);
    const logContent = `${entriesToWrite.map((e) => JSON.stringify(e)).join("\n")}\n`;

    try {
      await this.checkRotation();
      await fs.appendFile(this.logFilePath, logContent, "utf8");
    } catch (error) {
      console.error("FileTransport: Failed to write to log file.", error);
      // Put entries back in buffer to retry later
      this.buffer.unshift(...entriesToWrite);
    } finally {
      this.isWriting = false;
    }
  }

  private async checkRotation(): Promise<void> {
    try {
      const stats = await fs.stat(this.logFilePath);
      const fileSizeInMb = stats.size / (1024 * 1024);

      if (fileSizeInMb > this.config.rotationMaxSize) {
        await this.rotate();
      }
    } catch (error) {
      // If file doesn't exist, it's fine.
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("FileTransport: Error checking log file stats.", error as Error);
      }
    }
  }

  private async rotate(): Promise<void> {
    await this.flush(); // Ensure buffer is empty before rotating

    const maxFiles = this.config.rotationMaxFiles;
    const baseLogPath = this.logFilePath.slice(0, -4); // remove .log

    try {
      // First, delete the oldest log file if we're at the limit
      const oldestLogFile = `${baseLogPath}.${maxFiles - 1}.log`;
      try {
        await fs.unlink(oldestLogFile);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
          throw e;
        }
      }

      // Shift all other log files up by one
      for (let i = maxFiles - 2; i >= 0; i--) {
        const currentFile = i === 0 ? this.logFilePath : `${baseLogPath}.${i}.log`;
        const newFile = `${baseLogPath}.${i + 1}.log`;
        try {
          await fs.rename(currentFile, newFile);
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
            throw e;
          }
        }
      }
    } catch (error) {
      console.error("FileTransport: Failed to rotate log files.", error);
    }
  }

  public async dispose(): Promise<void> {
    clearInterval(this.flushInterval);
    await this.flush();
  }
}
