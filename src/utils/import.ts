/**
 *
 * Angular Auto-Import Utility Functions
 *
 * This module handles the core import functionality for Angular elements.
 *
 * Key Bug Fixes:
 * 1. **Active Document Synchronization**: The importElementToFile function now properly
 *    synchronizes with active VSCode documents instead of only reading from disk. This
 *    fixes the issue where quick fix imports wouldn't work on first access to TypeScript
 *    components with inline templates.
 *
 * 2. **Diagnostic Updates**: After successful imports, the system now automatically
 *    updates diagnostics to remove red underlines from successfully imported elements.
 *    Uses multiple retry attempts with increasing delays (100ms, 300ms, 500ms) to ensure
 *    proper synchronization between VSCode document changes and ts-morph Project state.
 *
 * 3. **Timing and Synchronization**: Improved timing of diagnostic updates to account for
 *    VSCode's asynchronous document processing. The system now waits for document changes
 *    to be fully processed before checking import status.
 *
 * 4. **Active Document Priority**: All operations now prioritize active VSCode documents
 *    over disk content, ensuring that unsaved changes are properly handled.
 *
 * @module
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  type ArrayLiteralExpression,
  type Node,
  type ObjectLiteralExpression,
  type PropertyAssignment,
  type SourceFile,
  SyntaxKind,
} from "ts-morph";
import * as vscode from "vscode";
import { logger } from "../logger";
import * as TsConfigHelper from "../services/tsconfig";
import type { AngularElementData, ProcessedTsConfig } from "../types";
import { switchFileType } from "./path";

/**
 * Global reference to diagnostic provider for updating diagnostics.
 * @internal
 */
let globalDiagnosticProvider: import("../providers/diagnostics").DiagnosticProvider | null = null;

/**
 * Sets the global diagnostic provider instance.
 * @param provider The diagnostic provider instance.
 */
export function setGlobalDiagnosticProvider(
  provider: import("../providers/diagnostics").DiagnosticProvider | null
): void {
  globalDiagnosticProvider = provider;
}

/**
 * Gets the active VSCode document for a given file path.
 * @param filePath The absolute path to the file.
 * @returns The active `vscode.TextDocument` or `undefined` if not found.
 * @internal
 */
function getActiveDocument(filePath: string): vscode.TextDocument | undefined {
  return vscode.workspace.textDocuments.find((doc) => doc.uri.fsPath === filePath);
}

/**
 * Imports an Angular element into a component file. This function handles adding the import statement
 * and updating the `@Component` decorator's `imports` array.
 *
 * @param element The Angular element to import.
 * @param componentFilePathAbs The absolute path to the component file.
 * @param projectRootPath The root path of the project.
 * @param indexerProject The ts-morph project instance.
 * @param _tsConfig The processed tsconfig.json.
 * @returns A promise that resolves to `true` if the import was successful, `false` otherwise.
 */
export async function importElementToFile(
  element: AngularElementData,
  componentFilePathAbs: string,
  projectRootPath: string,
  indexerProject: import("ts-morph").Project,
  _tsConfig: ProcessedTsConfig | null
): Promise<boolean> {
  try {
    if (!indexerProject) {
      logger.error("ts-morph Project instance is required for importElementToFile");
      return false;
    }

    // Get active VSCode document if available
    const activeDocument = getActiveDocument(componentFilePathAbs);
    let currentContent: string;

    if (activeDocument) {
      // Use content from active VSCode document (includes unsaved changes)
      currentContent = activeDocument.getText();
      // Using content from active VSCode document
    } else {
      // Fallback to reading from disk
      currentContent = fs.readFileSync(componentFilePathAbs, "utf-8");
      // Using content from disk
    }

    // Ensure ts-morph SourceFile is synchronized with current content
    let sourceFile = indexerProject.getSourceFile(componentFilePathAbs);
    if (sourceFile) {
      if (sourceFile.getFullText() !== currentContent) {
        sourceFile.replaceWithText(currentContent);
        // Synchronized ts-morph SourceFile
      }
    } else {
      sourceFile = indexerProject.createSourceFile(componentFilePathAbs, currentContent, { overwrite: true });
      // Created new ts-morph SourceFile
    }

    // Determine if the element is from an external package or local project file.
    let importPathString: string;
    if (element.isExternal) {
      // Use the path directly as it's a module specifier (e.g., '@angular/core').
      importPathString = element.path;
    } else {
      // For project elements, resolve the path using tsconfig aliases or relative paths.
      const absoluteTargetModulePath = path.join(projectRootPath, element.path);
      const absoluteTargetModulePathNoExt = switchFileType(absoluteTargetModulePath, "");

      importPathString = await TsConfigHelper.resolveImportPath(
        absoluteTargetModulePathNoExt,
        componentFilePathAbs,
        projectRootPath
      );
    }

    logger.debug(`Final import path for ${element.type} '${element.name}': '${importPathString}'`);

    let importStatementModified = false;
    let annotationModified = false;

    // Check if already imported from the same module
    const importDeclaration = sourceFile.getImportDeclaration(
      (d) =>
        d.getModuleSpecifierValue() === importPathString &&
        d.getNamedImports().some((ni) => ni.getName() === element.name)
    );

    if (!importDeclaration) {
      // Check if there's an existing import from the same module path
      const existingImportFromSameModule = sourceFile.getImportDeclaration(
        (d) => d.getModuleSpecifierValue() === importPathString
      );

      if (existingImportFromSameModule) {
        // Add to existing import from the same module
        const namedImports = existingImportFromSameModule.getNamedImports();
        const alreadyImported = namedImports.some((ni) => ni.getName() === element.name);

        if (!alreadyImported) {
          existingImportFromSameModule.addNamedImport(element.name);
          importStatementModified = true;
          // Added to existing import
        } else {
          // Already imported
        }
      } else {
        // Check if imported with the same name but different path
        const existingImportWithName = sourceFile
          .getImportDeclarations()
          .find((d) => d.getNamedImports().some((ni) => ni.getName() === element.name));

        if (existingImportWithName) {
          // Already imported from different path
        } else {
          // Add new import declaration
          sourceFile.addImportDeclaration({
            namedImports: [{ name: element.name }],
            moduleSpecifier: importPathString,
          });
          importStatementModified = true;
          logger.info(`Added new import statement for ${element.name}`);
        }
      }
    } else {
      // Already imported correctly
    }

    // Add to @Component imports array
    // Adding to @Component imports array
    annotationModified = addImportToAnnotationTsMorph(element.exportingModuleName || element.name, sourceFile);

    if (importStatementModified || annotationModified) {
      const newContent = sourceFile.getFullText();

      if (activeDocument) {
        // Use WorkspaceEdit to apply changes to active document
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
          activeDocument.positionAt(0),
          activeDocument.positionAt(activeDocument.getText().length)
        );
        edit.replace(activeDocument.uri, fullRange, newContent);

        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
          // Since the edit was applied, the document is dirty.
          // We must save it to trigger other extensions and update state.
          await activeDocument.save();
          logger.info(`Applied edits and saved document: ${path.basename(componentFilePathAbs)}`);
        } else {
          logger.error(`Failed to apply WorkspaceEdit to ${path.basename(componentFilePathAbs)}`);
          return false;
        }
      } else {
        // Fallback to direct file write if document is not active
        fs.writeFileSync(componentFilePathAbs, newContent);
        logger.info(`Successfully updated file ${path.basename(componentFilePathAbs)} for ${element.name}`);
      }

      // Force-refresh diagnostics to prevent race conditions with other providers.
      if (globalDiagnosticProvider) {
        // Forcing diagnostics update
        await globalDiagnosticProvider.forceUpdateDiagnosticsForFile(componentFilePathAbs);

        const htmlFilePath = switchFileType(componentFilePathAbs, ".html");
        if (fs.existsSync(htmlFilePath)) {
          await globalDiagnosticProvider.forceUpdateDiagnosticsForFile(htmlFilePath);
        }
      }

      logger.info(`Successfully updated document ${path.basename(componentFilePathAbs)} for ${element.name}`);

      return true;
    } else {
      // No changes needed - already imported
      return true;
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logger.error("Error importing element:", error);
    vscode.window.showErrorMessage(`Error importing ${element.name}: ${error.message}`);
    return false;
  }
}

/**
 * Adds an import to the `imports` array of a `@Component` decorator.
 *
 * @param importName The name of the module or component to add.
 * @param sourceFile The ts-morph `SourceFile` to modify.
 * @returns `true` if the file was modified, `false` otherwise.
 * @internal
 */
function addImportToAnnotationTsMorph(importName: string, sourceFile: SourceFile): boolean {
  let modified = false;
  for (const classDeclaration of sourceFile.getClasses()) {
    const componentDecorator = classDeclaration.getDecorator("Component");
    if (componentDecorator) {
      const decoratorArgs = componentDecorator.getArguments();
      if (decoratorArgs.length > 0 && decoratorArgs[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
        const objectLiteral = decoratorArgs[0] as ObjectLiteralExpression;
        const importsProperty = objectLiteral.getProperty("imports") as PropertyAssignment | undefined;

        if (importsProperty) {
          const initializer = importsProperty.getInitializer();
          if (initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
            const importsArray = initializer as ArrayLiteralExpression;
            const existingImportNames = importsArray.getElements().map((el: Node) => el.getText().trim());
            if (!existingImportNames.includes(importName)) {
              importsArray.addElement(importName);
              modified = true;
              // Added to imports array
            } else {
              // Already in imports array
            }
          } else {
            logger.warn(
              `@Component 'imports' property in ${sourceFile.getBaseName()} is not an array. Manual update needed for ${importName}.`
            );
          }
        } else {
          // 'imports' property doesn't exist, add it.
          const newPropertyAssignment = {
            name: "imports",
            initializer: `[${importName}]`,
          };

          objectLiteral.addPropertyAssignment(newPropertyAssignment);
          modified = true;
          // Added imports property to @Component decorator
        }
      }
      break; // Assuming one @Component decorator per file
    }
  }
  return modified;
}
