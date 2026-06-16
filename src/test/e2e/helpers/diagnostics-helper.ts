import * as vscode from "vscode";

/**
 * Waits for diagnostics to stabilize (stop changing) for a given URI.
 * Uses event-based approach via `vscode.languages.onDidChangeDiagnostics`.
 *
 * @param uri - The document URI to monitor
 * @param source - Filter diagnostics by source (e.g. "angular-auto-import")
 * @param timeoutMs - Maximum wait time before rejecting
 * @param stableMs - How long diagnostics must remain unchanged to be considered stable
 * @returns The stabilized diagnostics array. On timeout, returns the current snapshot
 * so zero-diagnostic cases can still be asserted by the caller.
 */
export function waitForDiagnosticsToStabilize(
  uri: vscode.Uri,
  source: string,
  timeoutMs = 60000,
  stableMs = 3000
): Promise<vscode.Diagnostic[]> {
  return new Promise((resolve) => {
    let stableTimer: ReturnType<typeof setTimeout> | undefined;

    const getDiagnostics = () => vscode.languages.getDiagnostics(uri).filter((d) => d.source === source);

    const resetStableTimer = () => {
      if (stableTimer) {
        clearTimeout(stableTimer);
      }
      stableTimer = setTimeout(() => {
        disposable.dispose();
        clearTimeout(timeout);
        resolve(getDiagnostics());
      }, stableMs);
    };

    const disposable = vscode.languages.onDidChangeDiagnostics((e) => {
      const affected = e.uris.some((u) => u.toString() === uri.toString());
      if (affected) {
        resetStableTimer();
      }
    });

    const timeout = setTimeout(() => {
      if (stableTimer) {
        clearTimeout(stableTimer);
      }
      disposable.dispose();
      resolve(getDiagnostics());
    }, timeoutMs);

    // Start the initial stable timer in case diagnostics are already present
    resetStableTimer();
  });
}

/**
 * Collects quick fixes for each unique diagnostic code.
 *
 * @param uri - The document URI
 * @param diagnostics - Array of diagnostics to collect quick fixes for
 * @param commandFilter - Filter code actions by command ID
 * @returns Map of diagnostic code to array of CodeActions
 */
export async function collectQuickFixes(
  uri: vscode.Uri,
  diagnostics: vscode.Diagnostic[],
  commandFilter: string
): Promise<Map<string, vscode.CodeAction[]>> {
  const result = new Map<string, vscode.CodeAction[]>();
  const seenCodes = new Set<string>();

  for (const diagnostic of diagnostics) {
    const code = String(diagnostic.code);
    if (seenCodes.has(code)) {
      continue;
    }
    seenCodes.add(code);

    const actions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
      "vscode.executeCodeActionProvider",
      uri,
      diagnostic.range
    );

    if (actions) {
      const filtered = actions.filter((a) => a.command?.command === commandFilter);
      if (filtered.length > 0) {
        result.set(code, filtered);
      }
    }
  }

  return result;
}
