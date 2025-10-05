/**
 * Utility functions for managing project context and document-to-project mapping.
 *
 * @module
 */

import * as path from "node:path";
import * as vscode from "vscode";
import type { AngularIndexer } from "../services/indexer";
import type { ProjectContext } from "../types/angular";
import type { ProcessedTsConfig } from "../types/tsconfig";

/**
 * Finds the project context (indexer and tsConfig) for a given document.
 * First tries to find by workspace folder, then falls back to checking all known project roots.
 *
 * @param document The document to find the project context for.
 * @param projectIndexers Map of project root paths to their indexers.
 * @param projectTsConfigs Map of project root paths to their tsConfigs.
 * @returns The project context or undefined if not found.
 */
export function getProjectContextForDocument(
  document: vscode.TextDocument,
  projectIndexers: Map<string, AngularIndexer>,
  projectTsConfigs: Map<string, ProcessedTsConfig | null>
): ProjectContext | undefined {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (workspaceFolder) {
    const projectRootPath = workspaceFolder.uri.fsPath;
    const indexer = projectIndexers.get(projectRootPath);
    const tsConfig = projectTsConfigs.get(projectRootPath) ?? null;
    if (indexer) {
      return { projectRootPath, indexer, tsConfig };
    }
  } else {
    for (const rootPath of projectIndexers.keys()) {
      if (document.uri.fsPath.startsWith(rootPath + path.sep)) {
        const indexer = projectIndexers.get(rootPath);
        const tsConfig = projectTsConfigs.get(rootPath) ?? null;
        if (indexer) {
          return { projectRootPath: rootPath, indexer, tsConfig };
        }
      }
    }
  }
  return undefined;
}
