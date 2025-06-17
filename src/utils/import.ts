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
 */

import * as fs from "fs";
import * as path from "path";
import {
  ArrayLiteralExpression,
  Node,
  ObjectLiteralExpression,
  PropertyAssignment,
  SourceFile,
  SyntaxKind,
} from "ts-morph";
import * as vscode from "vscode";
import { TsConfigHelper } from "../services";
import { AngularElementData, ProcessedTsConfig } from "../types";
import { switchFileType } from "./path";

/**
 * Global reference to diagnostic provider for updating diagnostics
 */
let globalDiagnosticProvider: any = null;

/**
 * Sets the global diagnostic provider
 */
export function setGlobalDiagnosticProvider(provider: any): void {
  globalDiagnosticProvider = provider;
}

/**
 * Gets the active VSCode document for a given file path
 */
function getActiveDocument(filePath: string): vscode.TextDocument | undefined {
  return vscode.workspace.textDocuments.find(
    (doc) => doc.uri.fsPath === filePath
  );
}

/**
 * Импортирует Angular элемент в файл компонента
 */
export async function importElementToFile(
  element: AngularElementData,
  componentFilePathAbs: string,
  projectRootPath: string,
  indexerProject: any, // ts-morph Project instance
  _tsConfig: ProcessedTsConfig | null
): Promise<boolean> {
  try {
    if (!indexerProject) {
      console.error(
        "ts-morph Project instance is required for importElementToFile"
      );
      return false;
    }

    // Get active VSCode document if available
    const activeDocument = getActiveDocument(componentFilePathAbs);
    let currentContent: string;

    if (activeDocument) {
      // Use content from active VSCode document (includes unsaved changes)
      currentContent = activeDocument.getText();
      console.log(
        `[importElementToFile] Using content from active VSCode document: ${path.basename(
          componentFilePathAbs
        )}`
      );
    } else {
      // Fallback to reading from disk
      currentContent = fs.readFileSync(componentFilePathAbs, "utf-8");
      console.log(
        `[importElementToFile] Using content from disk: ${path.basename(
          componentFilePathAbs
        )}`
      );
    }

    // Ensure ts-morph SourceFile is synchronized with current content
    let sourceFile = indexerProject.getSourceFile(componentFilePathAbs);
    if (sourceFile) {
      if (sourceFile.getFullText() !== currentContent) {
        sourceFile.replaceWithText(currentContent);
        console.log(
          `[importElementToFile] Synchronized ts-morph SourceFile with current content`
        );
      }
    } else {
      sourceFile = indexerProject.createSourceFile(
        componentFilePathAbs,
        currentContent,
        { overwrite: true }
      );
      console.log(`[importElementToFile] Created new ts-morph SourceFile`);
    }

    console.log(
      `[importElementToFile] === IMPORTING ${element.type.toUpperCase()} ===`
    );
    console.log(`[importElementToFile] Element name: ${element.name}`);
    console.log(`[importElementToFile] Element type: ${element.type}`);
    console.log(`[importElementToFile] Element relative path: ${element.path}`);

    // Check if this is a standard Angular element (starts with @angular/)
    let importPathString: string;
    if (element.path.startsWith("@angular/")) {
      // For standard Angular elements, use the path directly as import path
      importPathString = element.path;
      console.log(
        `[importElementToFile] Using standard Angular import: ${importPathString}`
      );
    } else {
      // For project elements, resolve import path using tsconfig
      const absoluteTargetModulePath = path.join(projectRootPath, element.path);
      const absoluteTargetModulePathNoExt = switchFileType(
        absoluteTargetModulePath,
        ""
      );
      console.log(
        `[importElementToFile] Absolute target path: ${absoluteTargetModulePath}`
      );
      console.log(
        `[importElementToFile] Absolute target path (no ext): ${absoluteTargetModulePathNoExt}`
      );

      importPathString = await TsConfigHelper.resolveImportPath(
        absoluteTargetModulePathNoExt,
        componentFilePathAbs,
        projectRootPath
      );
    }

    console.log(
      `[importElementToFile] Component file: ${componentFilePathAbs}`
    );
    console.log(`[importElementToFile] Project root: ${projectRootPath}`);
    console.log(
      `[importElementToFile] 🎯 FINAL IMPORT PATH for ${element.type} '${element.name}': '${importPathString}'`
    );

    let importStatementModified = false;
    let annotationModified = false;

    // Check if already imported from the same module
    let importDeclaration = sourceFile.getImportDeclaration(
      (d: any) =>
        d.getModuleSpecifierValue() === importPathString &&
        d.getNamedImports().some((ni: any) => ni.getName() === element.name)
    );

    if (!importDeclaration) {
      // Check if there's an existing import from the same module path
      const existingImportFromSameModule = sourceFile.getImportDeclaration(
        (d: any) => d.getModuleSpecifierValue() === importPathString
      );

      if (existingImportFromSameModule) {
        // Add to existing import from the same module
        const namedImports = existingImportFromSameModule.getNamedImports();
        const alreadyImported = namedImports.some(
          (ni: any) => ni.getName() === element.name
        );

        if (!alreadyImported) {
          existingImportFromSameModule.addNamedImport(element.name);
          importStatementModified = true;
          console.log(
            `Added ${element.name} to existing import from ${importPathString}.`
          );
        } else {
          console.log(
            `${element.name} already imported from ${importPathString}.`
          );
        }
      } else {
        // Check if imported with the same name but different path
        const existingImportWithName = sourceFile
          .getImportDeclarations()
          .find((d: any) =>
            d.getNamedImports().some((ni: any) => ni.getName() === element.name)
          );

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
          console.log(
            `Added new import statement for ${element.name} from ${importPathString}.`
          );
        }
      }
    } else {
      console.log(
        `${element.name} already imported correctly from ${importPathString}.`
      );
    }

    // Add to @Component imports array
    console.log(
      `[importElementToFile] Adding ${element.type} '${element.name}' to @Component imports array...`
    );
    annotationModified = addImportToAnnotationTsMorph(element, sourceFile);

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
          console.log(
            `Successfully updated active document ${path.basename(
              componentFilePathAbs
            )} for ${element.name}.`
          );
          // Diagnostics are now handled by the DiagnosticProvider's
          // onDidChangeTextDocument listener, which is more reliable than
          // the previous timer-based approach.
        } else {
          console.error(
            `Failed to apply WorkspaceEdit to ${path.basename(
              componentFilePathAbs
            )}`
          );
          return false;
        }
      } else {
        // Fallback to direct file write if document is not active
        fs.writeFileSync(componentFilePathAbs, newContent);
        console.log(
          `Successfully updated file ${path.basename(
            componentFilePathAbs
          )} for ${element.name}.`
        );
      }

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
    vscode.window.showErrorMessage(
      `Error importing ${element.name}: ${error.message}`
    );
    return false;
  }
}

/**
 * Добавляет элемент в массив imports декоратора @Component
 */
function addImportToAnnotationTsMorph(
  element: AngularElementData,
  sourceFile: SourceFile
): boolean {
  let modified = false;
  for (const classDeclaration of sourceFile.getClasses()) {
    const componentDecorator = classDeclaration.getDecorator("Component");
    if (componentDecorator) {
      const decoratorArgs = componentDecorator.getArguments();
      if (
        decoratorArgs.length > 0 &&
        decoratorArgs[0].isKind(SyntaxKind.ObjectLiteralExpression)
      ) {
        const objectLiteral = decoratorArgs[0] as ObjectLiteralExpression;
        let importsProperty = objectLiteral.getProperty("imports") as
          | PropertyAssignment
          | undefined;

        if (importsProperty) {
          const initializer = importsProperty.getInitializer();
          if (
            initializer &&
            initializer.isKind(SyntaxKind.ArrayLiteralExpression)
          ) {
            const importsArray = initializer as ArrayLiteralExpression;
            const existingImportNames = importsArray
              .getElements()
              .map((el: Node) => el.getText().trim());
            if (!existingImportNames.includes(element.name)) {
              importsArray.addElement(element.name);
              modified = true;
              console.log(`Added ${element.name} to @Component imports array.`);
            } else {
              console.log(
                `${element.name} already in @Component imports array.`
              );
            }
          } else {
            console.warn(
              `@Component 'imports' property in ${sourceFile.getBaseName()} is not an array. Manual update needed for ${
                element.name
              }.`
            );
          }
        } else {
          // 'imports' property doesn't exist, add it.
          const newPropertyAssignment = {
            name: "imports",
            initializer: `[${element.name}]`,
          };

          objectLiteral.addPropertyAssignment(newPropertyAssignment);
          modified = true;
          console.log(
            `Added 'imports: [${element.name}]' to @Component decorator.`
          );
        }
      }
      break; // Assuming one @Component decorator per file
    }
  }
  return modified;
}
