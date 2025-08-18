/**
 * =================================================================================================
 * Angular Auto-Import Utility Functions
 * =================================================================================================
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
      console.error("ts-morph Project instance is required for importElementToFile");
      return false;
    }

    // Get active VSCode document if available
    const activeDocument = getActiveDocument(componentFilePathAbs);
    let currentContent: string;

    if (activeDocument) {
      // Use content from active VSCode document (includes unsaved changes)
      currentContent = activeDocument.getText();
      console.log(
        `[importElementToFile] Using content from active VSCode document: ${path.basename(componentFilePathAbs)}`
      );
    } else {
      // Fallback to reading from disk
      currentContent = fs.readFileSync(componentFilePathAbs, "utf-8");
      console.log(`[importElementToFile] Using content from disk: ${path.basename(componentFilePathAbs)}`);
    }

    // Ensure ts-morph SourceFile is synchronized with current content
    let sourceFile = indexerProject.getSourceFile(componentFilePathAbs);
    if (sourceFile) {
      if (sourceFile.getFullText() !== currentContent) {
        sourceFile.replaceWithText(currentContent);
        console.log(`[importElementToFile] Synchronized ts-morph SourceFile with current content`);
      }
    } else {
      sourceFile = indexerProject.createSourceFile(componentFilePathAbs, currentContent, { overwrite: true });
      console.log(`[importElementToFile] Created new ts-morph SourceFile`);
    }

    // Determine if the element is from an external package or local project file.
    let importPathString: string;
    // If the path is not absolute and does not start with a dot, it's a module specifier.
    if (!path.isAbsolute(element.path) && !element.path.startsWith(".")) {
      importPathString = element.path;
      console.log(`[importElementToFile] Using module import path: ${importPathString}`);
    } else {
      // For project elements, resolve import path using tsconfig
      const absoluteTargetModulePath = path.join(projectRootPath, element.path);
      const absoluteTargetModulePathNoExt = switchFileType(absoluteTargetModulePath, "");
      console.log(`[importElementToFile] Absolute target path: ${absoluteTargetModulePath}`);
      console.log(`[importElementToFile] Absolute target path (no ext): ${absoluteTargetModulePathNoExt}`);

      importPathString = await TsConfigHelper.resolveImportPath(
        absoluteTargetModulePathNoExt,
        componentFilePathAbs,
        projectRootPath
      );
    }

    console.log(`[importElementToFile] Component file: ${componentFilePathAbs}`);
    console.log(`[importElementToFile] Project root: ${projectRootPath}`);
    console.log(
      `[importElementToFile] 🎯 FINAL IMPORT PATH for ${element.type} '${element.name}': '${importPathString}'`
    );

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
          console.log(`Added ${element.name} to existing import from ${importPathString}.`);
        } else {
          console.log(`${element.name} already imported from ${importPathString}.`);
        }
      } else {
        // Check if imported with the same name but different path
        const existingImportWithName = sourceFile
          .getImportDeclarations()
          .find((d) => d.getNamedImports().some((ni) => ni.getName() === element.name));

        if (existingImportWithName) {
          console.log(
            `${
              element.name
            } is already imported from '${existingImportWithName.getModuleSpecifierValue()}'. Adding to annotations if necessary.`
          );
        } else {
          // Add new import declaration
          sourceFile.addImportDeclaration({
            namedImports: [{ name: element.name }],
            moduleSpecifier: importPathString,
          });
          importStatementModified = true;
          console.log(`Added new import statement for ${element.name} from ${importPathString}.`);
        }
      }
    } else {
      console.log(`${element.name} already imported correctly from ${importPathString}.`);
    }

    // Add to @Component imports array
    console.log(`[importElementToFile] Adding ${element.type} '${element.name}' to @Component imports array...`);
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
          console.log(
            `[importElementToFile] Applied edits and saved active document: ${path.basename(componentFilePathAbs)}`
          );
        } else {
          console.error(`Failed to apply WorkspaceEdit to ${path.basename(componentFilePathAbs)}`);
          return false;
        }
      } else {
        // Fallback to direct file write if document is not active
        fs.writeFileSync(componentFilePathAbs, newContent);
        console.log(`Successfully updated file ${path.basename(componentFilePathAbs)} for ${element.name}.`);
      }

      // Force-refresh diagnostics to prevent race conditions with other providers.
      if (globalDiagnosticProvider) {
        console.log(
          `[importElementToFile] Forcing diagnostics update for ${path.basename(
            componentFilePathAbs
          )} and related HTML file.`
        );
        await globalDiagnosticProvider.forceUpdateDiagnosticsForFile(componentFilePathAbs);

        const htmlFilePath = switchFileType(componentFilePathAbs, ".html");
        if (fs.existsSync(htmlFilePath)) {
          await globalDiagnosticProvider.forceUpdateDiagnosticsForFile(htmlFilePath);
        }
      }

      console.log(`Successfully updated active document ${path.basename(componentFilePathAbs)} for ${element.name}.`);

      return true;
    } else {
      console.log(
        `No changes needed for ${element.name} in ${path.basename(
          componentFilePathAbs
        )} (already imported and in annotations).`
      );
      return true;
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Error importing element:", error);
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
              console.log(`Added ${importName} to @Component imports array.`);
            } else {
              console.log(`${importName} already in @Component imports array.`);
            }
          } else {
            console.warn(
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
          console.log(`Added 'imports: [${importName}]' to @Component decorator.`);
        }
      }
      break; // Assuming one @Component decorator per file
    }
  }
  return modified;
}
