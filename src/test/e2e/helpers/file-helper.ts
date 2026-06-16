import * as fs from "node:fs";
import * as path from "node:path";
import { type Decorator, Project, type SourceFile, SyntaxKind } from "ts-morph";
import * as vscode from "vscode";

/**
 * Result of verifying whether an import was correctly added to a component file.
 */
export interface ImportVerificationResult {
  hasImportStatement: boolean;
  hasInImportsArray: boolean;
}

const inMemoryProject = new Project({ useInMemoryFileSystem: true });

/**
 * Parses content into a ts-morph SourceFile, reusing an in-memory virtual file.
 */
function parseContent(content: string): SourceFile {
  const filePath = "/virtual/component.ts";
  const existing = inMemoryProject.getSourceFile(filePath);
  if (existing) {
    existing.replaceWithText(content);
    return existing;
  }
  return inMemoryProject.createSourceFile(filePath, content);
}

/**
 * Checks if a `@Component` decorator's `templateUrl` matches the given file name.
 */
function decoratorMatchesTemplate(decorator: Decorator, templateFileName: string): boolean {
  const args = decorator.getArguments();
  if (args.length === 0) {
    return false;
  }

  const objectLiteral = args[0].asKind(SyntaxKind.ObjectLiteralExpression);
  if (!objectLiteral) {
    return false;
  }

  const templateUrlProp = objectLiteral.getProperty("templateUrl");
  if (!templateUrlProp) {
    return false;
  }

  const initializer = templateUrlProp.asKind(SyntaxKind.PropertyAssignment)?.getInitializer();
  const templateUrlValue = initializer?.asKind(SyntaxKind.StringLiteral)?.getLiteralValue();
  return templateUrlValue !== undefined && path.basename(templateUrlValue) === templateFileName;
}

/**
 * Finds the `@Component` decorator in the source file.
 * If `templateFileName` is provided, matches against `templateUrl` property.
 * Otherwise returns the first `@Component` decorator found.
 */
function findComponentDecorator(sourceFile: SourceFile, templateFileName?: string): Decorator | undefined {
  for (const cls of sourceFile.getClasses()) {
    const decorator = cls.getDecorator("Component");
    if (!decorator) {
      continue;
    }

    if (!templateFileName) {
      return decorator;
    }

    if (decoratorMatchesTemplate(decorator, templateFileName)) {
      return decorator;
    }
  }
  return undefined;
}

/**
 * Gets the imports array elements from a `@Component` decorator.
 * Returns the property assignment and element names, or undefined if not found.
 */
function getImportsArrayInfo(decorator: Decorator) {
  const args = decorator.getArguments();
  if (args.length === 0) {
    return undefined;
  }

  const objectLiteral = args[0].asKind(SyntaxKind.ObjectLiteralExpression);
  if (!objectLiteral) {
    return undefined;
  }

  const importsProperty = objectLiteral.getProperty("imports")?.asKind(SyntaxKind.PropertyAssignment);
  if (!importsProperty) {
    return undefined;
  }

  const arrayLiteral = importsProperty.getInitializer()?.asKind(SyntaxKind.ArrayLiteralExpression);
  if (!arrayLiteral) {
    return undefined;
  }

  const elementNames = arrayLiteral.getElements().map((el) => el.getText());
  return { importsProperty, elementNames };
}

/**
 * Gets the imports array elements from an `@NgModule` decorator.
 * Returns the property assignment and element names, or undefined if not found.
 */
function getNgModuleImportsArrayInfo(sourceFile: SourceFile) {
  for (const cls of sourceFile.getClasses()) {
    const decorator = cls.getDecorator("NgModule");
    if (!decorator) {
      continue;
    }

    const args = decorator.getArguments();
    if (args.length === 0) {
      return undefined;
    }

    const objectLiteral = args[0].asKind(SyntaxKind.ObjectLiteralExpression);
    if (!objectLiteral) {
      return undefined;
    }

    const importsProperty = objectLiteral.getProperty("imports")?.asKind(SyntaxKind.PropertyAssignment);
    if (!importsProperty) {
      return undefined;
    }

    const arrayLiteral = importsProperty.getInitializer()?.asKind(SyntaxKind.ArrayLiteralExpression);
    if (!arrayLiteral) {
      return undefined;
    }

    const elementNames = arrayLiteral.getElements().map((el) => el.getText());
    return { importsProperty, elementNames };
  }

  return undefined;
}

/**
 * Strips Angular imports from a component source file using ts-morph AST parsing.
 *
 * 1. Extracts class names from the `imports: [...]` array in `@Component`
 * 2. Removes those names from TypeScript `import { ... } from '...'` statements
 *    (removes entire statement if it becomes empty)
 * 3. Sets `imports: []` (empty array)
 * 4. Keeps non-template imports like `FormBuilder`, `Validators`, `Component`, `inject`
 *
 * @param content - The original component TypeScript source
 * @param templateFileName - Optional template file name to match against templateUrl
 * @returns The stripped content with Angular template imports removed
 */
export function stripAngularImports(content: string, templateFileName?: string): string {
  const sourceFile = parseContent(content);
  const decorator = findComponentDecorator(sourceFile, templateFileName);
  if (!decorator) {
    return content;
  }

  const info = getImportsArrayInfo(decorator);
  if (!info || info.elementNames.length === 0) {
    return content;
  }

  const namesToRemove = new Set(info.elementNames);

  // Clear the imports array
  info.importsProperty.setInitializer("[]");

  // Remove names from TypeScript import declarations
  for (const importDecl of sourceFile.getImportDeclarations()) {
    const namedImports = importDecl.getNamedImports();
    const toRemove = namedImports.filter((ni) => namesToRemove.has(ni.getName()));

    if (toRemove.length === 0) {
      continue;
    }

    if (toRemove.length === namedImports.length) {
      // All named imports should be removed — remove entire statement
      importDecl.remove();
    } else {
      // Remove only matched named imports
      for (const ni of toRemove) {
        ni.remove();
      }
    }
  }

  return sourceFile.getFullText();
}

/**
 * Strips entries from an `@NgModule({ imports: [...] })` array and removes matching
 * TypeScript named imports. This is used by legacy-module e2e cases where diagnostics
 * must remain disabled even if module imports no longer satisfy the template.
 *
 * @param content - The original NgModule TypeScript source
 * @returns The stripped content with `imports: []`
 */
export function stripNgModuleImports(content: string): string {
  const sourceFile = parseContent(content);
  const info = getNgModuleImportsArrayInfo(sourceFile);
  if (!info || info.elementNames.length === 0) {
    return content;
  }

  const namesToRemove = new Set(info.elementNames);

  info.importsProperty.setInitializer("[]");

  for (const importDecl of sourceFile.getImportDeclarations()) {
    const namedImports = importDecl.getNamedImports();
    const toRemove = namedImports.filter((ni) => namesToRemove.has(ni.getName()));

    if (toRemove.length === 0) {
      continue;
    }

    if (toRemove.length === namedImports.length) {
      importDecl.remove();
    } else {
      for (const ni of toRemove) {
        ni.remove();
      }
    }
  }

  return sourceFile.getFullText();
}

/**
 * Verifies that a class is properly imported in a component file.
 * Checks both the TypeScript `import { ... } from '...'` statement
 * and the `imports: [...]` array in the `@Component` decorator.
 *
 * @param content - The component file content
 * @param className - The class name to look for (e.g. "UiDemoOneComponent")
 * @param moduleSpecifier - The module path to look for (e.g. "@angular-demo/ui-demo-one")
 * @param templateFileName - Optional template file name to match against templateUrl
 * @returns Verification result with both checks
 */
export function verifyImportInComponent(
  content: string,
  className: string,
  moduleSpecifier: string,
  templateFileName?: string
): ImportVerificationResult {
  const sourceFile = parseContent(content);

  // Check TypeScript import statement
  const importDecl = sourceFile.getImportDeclaration(
    (d) =>
      d.getModuleSpecifierValue() === moduleSpecifier && d.getNamedImports().some((ni) => ni.getName() === className)
  );
  const hasImportStatement = importDecl !== undefined;

  // Check @Component imports array
  const decorator = findComponentDecorator(sourceFile, templateFileName);
  let hasInImportsArray = false;
  if (decorator) {
    const info = getImportsArrayInfo(decorator);
    if (info) {
      hasInImportsArray = info.elementNames.some((name) => name === className);
    }
  }

  return { hasImportStatement, hasInImportsArray };
}

const EXTENSION_ID = "baryshevrs.angular-auto-import";

/**
 * Writes content to a file on disk and reverts the VS Code document if it's open.
 *
 * @param uri - The file URI to write to
 * @param content - The new file content
 */
export async function replaceFileContent(uri: vscode.Uri, content: string): Promise<void> {
  fs.writeFileSync(uri.fsPath, content, "utf-8");

  // If the document is open in VS Code, revert it to pick up disk changes
  const openDoc = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === uri.toString());
  if (openDoc) {
    await vscode.commands.executeCommand("workbench.action.files.revert");
  }
}

/**
 * Waits for a file change event on the specified URI.
 * Resolves when `onDidChangeTextDocument` fires for the URI, or after timeout as safety net.
 *
 * @param uri - The file URI to watch
 * @param timeoutMs - Maximum wait time in milliseconds
 */
export function waitForFileChange(uri: vscode.Uri, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      disposable.dispose();
      resolve();
    }, timeoutMs);

    const disposable = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === uri.toString()) {
        clearTimeout(timeout);
        disposable.dispose();
        resolve();
      }
    });
  });
}

/**
 * Waits for the extension to be activated and ready.
 *
 * @param timeoutMs - Maximum wait time
 */
export async function waitForExtensionActivation(timeoutMs = 30000): Promise<void> {
  const ext = vscode.extensions.getExtension(EXTENSION_ID);
  if (!ext) {
    throw new Error(`Extension ${EXTENSION_ID} not found`);
  }

  if (!ext.isActive) {
    await ext.activate();
  }

  // Wait for commands to be registered, then force a full reindex and await completion.
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const commands = await vscode.commands.getCommands(true);
    if (commands.includes("angular-auto-import.reindex")) {
      await vscode.commands.executeCommand("angular-auto-import.reindex");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Extension ${EXTENSION_ID} did not activate within ${timeoutMs}ms`);
}
