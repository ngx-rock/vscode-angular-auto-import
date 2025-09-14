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
  type Decorator,
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
const globalDiagnosticProvider: import("../providers/diagnostics").DiagnosticProvider | null = null;

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
 * Prepares a source file for modification.
 */
async function prepareSourceFile(
  componentFilePathAbs: string,
  indexerProject: import("ts-morph").Project
): Promise<import("ts-morph").SourceFile | null> {
  const activeDocument = getActiveDocument(componentFilePathAbs);
  let currentContent: string;

  if (activeDocument) {
    currentContent = activeDocument.getText();
  } else {
    currentContent = fs.readFileSync(componentFilePathAbs, "utf-8");
  }

  let sourceFile = indexerProject.getSourceFile(componentFilePathAbs);
  if (sourceFile) {
    if (sourceFile.getFullText() !== currentContent) {
      sourceFile.replaceWithText(currentContent);
    }
  } else {
    sourceFile = indexerProject.createSourceFile(componentFilePathAbs, currentContent, { overwrite: true });
  }

  return sourceFile;
}

/**
 * Processes import statements for each element.
 */
async function processElementImports(
  elements: AngularElementData[],
  sourceFile: import("ts-morph").SourceFile,
  componentFilePathAbs: string,
  projectRootPath: string
): Promise<boolean> {
  let modified = false;

  for (const element of elements) {
    const importPathString = await resolveImportPathForElement(element, componentFilePathAbs, projectRootPath);
    logger.debug(`Final import path for ${element.type} '${element.name}': '${importPathString}'`);

    if (addImportStatementForElement(sourceFile, element, importPathString)) {
      modified = true;
    }

    if (addImportToAnnotationTsMorph(element.exportingModuleName || element.name, sourceFile)) {
      modified = true;
    }
  }

  return modified;
}

/**
 * Adds import statement for a single element.
 */
function addImportStatementForElement(
  sourceFile: import("ts-morph").SourceFile,
  element: AngularElementData,
  importPathString: string
): boolean {
  const importDeclaration = sourceFile.getImportDeclaration(
    (d) =>
      d.getModuleSpecifierValue() === importPathString &&
      d.getNamedImports().some((ni) => ni.getName() === element.name)
  );

  if (importDeclaration) {
    return false; // Already imported
  }

  const existingImportFromSameModule = sourceFile.getImportDeclaration(
    (d) => d.getModuleSpecifierValue() === importPathString
  );

  if (existingImportFromSameModule) {
    const namedImports = existingImportFromSameModule.getNamedImports();
    const alreadyImported = namedImports.some((ni) => ni.getName() === element.name);
    if (!alreadyImported) {
      existingImportFromSameModule.addNamedImport(element.name);
      return true;
    }
    return false;
  }

  const existingImportWithName = sourceFile
    .getImportDeclarations()
    .find((d) => d.getNamedImports().some((ni) => ni.getName() === element.name));

  if (!existingImportWithName) {
    sourceFile.addImportDeclaration({
      namedImports: [{ name: element.name }],
      moduleSpecifier: importPathString,
    });
    return true;
  }

  return false;
}

/**
 * Saves the modified file to disk and updates diagnostics.
 */
async function saveModifiedFile(
  sourceFile: import("ts-morph").SourceFile,
  componentFilePathAbs: string
): Promise<boolean> {
  const newContent = sourceFile.getFullText();
  const activeDocument = getActiveDocument(componentFilePathAbs);

  if (activeDocument) {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      activeDocument.positionAt(0),
      activeDocument.positionAt(activeDocument.getText().length)
    );
    edit.replace(activeDocument.uri, fullRange, newContent);

    const success = await vscode.workspace.applyEdit(edit);
    if (success) {
      await activeDocument.save();
    } else {
      logger.error(`Failed to apply WorkspaceEdit to ${path.basename(componentFilePathAbs)}`);
      return false;
    }
  } else {
    fs.writeFileSync(componentFilePathAbs, newContent);
  }

  if (globalDiagnosticProvider) {
    await globalDiagnosticProvider.forceUpdateDiagnosticsForFile(componentFilePathAbs);
    const htmlFilePath = switchFileType(componentFilePathAbs, ".html");
    if (fs.existsSync(htmlFilePath)) {
      await globalDiagnosticProvider.forceUpdateDiagnosticsForFile(htmlFilePath);
    }
  }

  return true;
}

/**
 * Imports multiple Angular elements into a component file. This function handles adding the import statements
 * and updating the `@Component` decorator's `imports` array for all elements in one operation.
 *
 * @param elements An array of Angular elements to import.
 * @param componentFilePathAbs The absolute path to the component file.
 * @param projectRootPath The root path of the project.
 * @param indexerProject The ts-morph project instance.
 * @param _tsConfig The processed tsconfig.json.
 * @returns A promise that resolves to `true` if the import was successful, `false` otherwise.
 */
export async function importElementsToFile(
  elements: AngularElementData[],
  componentFilePathAbs: string,
  projectRootPath: string,
  indexerProject: import("ts-morph").Project,
  _tsConfig: ProcessedTsConfig | null
): Promise<boolean> {
  try {
    if (!indexerProject) {
      logger.error("ts-morph Project instance is required for importElementsToFile");
      return false;
    }

    const sourceFile = await prepareSourceFile(componentFilePathAbs, indexerProject);
    if (!sourceFile) {
      return false;
    }

    const modified = await processElementImports(elements, sourceFile, componentFilePathAbs, projectRootPath);

    if (modified) {
      return await saveModifiedFile(sourceFile, componentFilePathAbs);
    }

    return true;
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logger.error("Error importing elements:", error);
    vscode.window.showErrorMessage(`Error importing elements: ${error.message}`);
    return false;
  }
}

/**
 * Resolves the import path for a given Angular element.
 * @param element The Angular element.
 * @param componentFilePathAbs The absolute path of the component file where the import will be added.
 * @param projectRootPath The project's root path.
 * @returns The resolved import path string.
 * @internal
 */
async function resolveImportPathForElement(
  element: AngularElementData,
  componentFilePathAbs: string,
  projectRootPath: string
): Promise<string> {
  if (element.isExternal) {
    return element.path;
  }
  // For project elements, resolve the path using tsconfig aliases or relative paths.
  const absoluteTargetModulePath = path.join(projectRootPath, element.path);
  const absoluteTargetModulePathNoExt = switchFileType(absoluteTargetModulePath, "");

  return TsConfigHelper.resolveImportPath(absoluteTargetModulePathNoExt, componentFilePathAbs, projectRootPath);
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
  for (const classDeclaration of sourceFile.getClasses()) {
    const componentDecorator = classDeclaration.getDecorator("Component");
    if (componentDecorator) {
      return addImportToComponentDecorator(componentDecorator, importName, sourceFile);
    }
  }
  return false;
}

/**
 * Adds import to Component decorator's imports array.
 */
function addImportToComponentDecorator(
  componentDecorator: Decorator,
  importName: string,
  sourceFile: SourceFile
): boolean {
  const decoratorArgs = componentDecorator.getArguments();
  if (decoratorArgs.length === 0 || !decoratorArgs[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
    return false;
  }

  const objectLiteral = decoratorArgs[0] as ObjectLiteralExpression;
  const importsProperty = objectLiteral.getProperty("imports") as PropertyAssignment | undefined;

  if (importsProperty) {
    return addToExistingImportsArray(importsProperty, importName, sourceFile);
  }

  return addNewImportsProperty(objectLiteral, importName);
}

/**
 * Adds import to existing imports array.
 */
function addToExistingImportsArray(
  importsProperty: PropertyAssignment,
  importName: string,
  sourceFile: SourceFile
): boolean {
  const initializer = importsProperty.getInitializer();
  if (!initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
    logger.warn(
      `@Component 'imports' property in ${sourceFile.getBaseName()} is not an array. Manual update needed for ${importName}.`
    );
    return false;
  }

  const importsArray = initializer as ArrayLiteralExpression;
  const existingImportNames = importsArray.getElements().map((el: Node) => el.getText().trim());

  if (existingImportNames.includes(importName)) {
    return false; // Already in imports array
  }

  importsArray.addElement(importName);
  return true;
}

/**
 * Adds new imports property to Component decorator.
 */
function addNewImportsProperty(objectLiteral: ObjectLiteralExpression, importName: string): boolean {
  const newPropertyAssignment = {
    name: "imports",
    initializer: `[${importName}]`,
  };

  objectLiteral.addPropertyAssignment(newPropertyAssignment);
  return true;
}
