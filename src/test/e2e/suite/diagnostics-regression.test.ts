import * as assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { collectQuickFixes, waitForDiagnosticsToStabilize } from "../helpers/diagnostics-helper";
import {
  replaceFileContent,
  stripAngularImports,
  stripNgModuleImports,
  verifyImportInComponent,
  waitForExtensionActivation,
  waitForFileChange,
} from "../helpers/file-helper";
import type { CaseDescriptor } from "../types";
import { severityToString } from "../types";

const DIAGNOSTIC_SOURCE = "angular-auto-import";
const IMPORT_COMMAND = "angular-auto-import.importElement";
const CASE_FILTER = process.env.AAI_E2E_CASE;

function isInlineTemplateCase(descriptor: CaseDescriptor): boolean {
  return descriptor.componentPath === descriptor.templatePath;
}

function getTemplateFileName(descriptor: CaseDescriptor): string | undefined {
  return isInlineTemplateCase(descriptor) ? undefined : path.basename(descriptor.templatePath);
}

interface CaseContext {
  componentUri: vscode.Uri;
  templateUri: vscode.Uri;
  moduleUri: vscode.Uri | undefined;
  originalContent: string;
  originalModuleContent: string | undefined;
}

/**
 * Resolves file URIs and preserves original content for a test case.
 */
function resolveCaseFiles(workspaceRoot: string, descriptor: CaseDescriptor): CaseContext {
  const componentUri = vscode.Uri.file(path.join(workspaceRoot, descriptor.componentPath));
  const templateUri = vscode.Uri.file(path.join(workspaceRoot, descriptor.templatePath));
  const moduleUri = descriptor.modulePath
    ? vscode.Uri.file(path.join(workspaceRoot, descriptor.modulePath))
    : undefined;

  const originalContent = fs.readFileSync(componentUri.fsPath, "utf-8");
  const originalModuleContent = moduleUri ? fs.readFileSync(moduleUri.fsPath, "utf-8") : undefined;

  return { componentUri, templateUri, moduleUri, originalContent, originalModuleContent };
}

/**
 * Strips imports and writes modified content to disk for a test case.
 */
async function stripAndWriteImports(ctx: CaseContext, descriptor: CaseDescriptor): Promise<void> {
  if (!descriptor.preserveImports) {
    const templateFileName = getTemplateFileName(descriptor);
    const strippedContent = stripAngularImports(ctx.originalContent, templateFileName);
    await replaceFileContent(ctx.componentUri, strippedContent);
  }
  if (ctx.moduleUri && ctx.originalModuleContent !== undefined) {
    await replaceFileContent(ctx.moduleUri, stripNgModuleImports(ctx.originalModuleContent));
  }
}

/**
 * Discovers all descriptor.json files under the cases/ directory.
 */
function discoverCases(casesDir: string): CaseDescriptor[] {
  const cases: CaseDescriptor[] = [];

  if (!fs.existsSync(casesDir)) {
    return cases;
  }

  const entries = fs.readdirSync(casesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const descriptorPath = path.join(casesDir, entry.name, "descriptor.json");
      if (fs.existsSync(descriptorPath)) {
        const descriptor = JSON.parse(fs.readFileSync(descriptorPath, "utf-8")) as CaseDescriptor;
        if (!CASE_FILTER || descriptor.case === CASE_FILTER) {
          cases.push(descriptor);
        }
      }
    }
  }

  return cases;
}

describe("E2E Diagnostics Regression", function () {
  this.timeout(120000);

  const casesDir = path.resolve(__dirname, "..", "cases");
  const cases = discoverCases(casesDir);

  if (cases.length === 0) {
    it("no test cases found", () => {
      console.warn(`No descriptor.json files found in ${casesDir}. Run the generator first.`);
    });
    return;
  }

  // Activate extension and index once for all cases
  before(async function () {
    this.timeout(90000);
    await waitForExtensionActivation();
  });

  for (const descriptor of cases) {
    describe(`Case: ${descriptor.case}`, () => {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";
      let ctx: CaseContext;

      before(async function () {
        this.timeout(90000);

        const componentPath = path.join(workspaceRoot, descriptor.componentPath);
        if (!fs.existsSync(componentPath)) {
          this.skip();
          return;
        }

        ctx = resolveCaseFiles(workspaceRoot, descriptor);
        await stripAndWriteImports(ctx, descriptor);

        // Open the template file to trigger diagnostics
        const doc = await vscode.workspace.openTextDocument(ctx.templateUri);
        await vscode.window.showTextDocument(doc);

        // Wait for diagnostics to stabilize
        await waitForDiagnosticsToStabilize(ctx.templateUri, DIAGNOSTIC_SOURCE);
      });

      after(async function () {
        this.timeout(10000);

        // Always restore original content
        if (ctx.originalContent && ctx.componentUri) {
          await replaceFileContent(ctx.componentUri, ctx.originalContent);
        }
        if (ctx.moduleUri && ctx.originalModuleContent !== undefined) {
          await replaceFileContent(ctx.moduleUri, ctx.originalModuleContent);
        }

        // Close all editors
        await vscode.commands.executeCommand("workbench.action.closeAllEditors");
      });

      it("diagnostics match expected positions and properties", () => {
        const diagnostics = vscode.languages
          .getDiagnostics(ctx.templateUri)
          .filter((d) => d.source === DIAGNOSTIC_SOURCE);

        assert.strictEqual(
          diagnostics.length,
          descriptor.diagnostics.length,
          `Expected ${descriptor.diagnostics.length} diagnostics, got ${diagnostics.length}`
        );

        for (const expected of descriptor.diagnostics) {
          const match = diagnostics.find(
            (d) =>
              String(d.code) === expected.code &&
              d.range.start.line === expected.startLine &&
              d.range.start.character === expected.startCharacter &&
              d.range.end.line === expected.endLine &&
              d.range.end.character === expected.endCharacter
          );

          assert.ok(
            match,
            `Missing diagnostic "${expected.code}" at [${expected.startLine}:${expected.startCharacter}]-[${expected.endLine}:${expected.endCharacter}]`
          );

          assert.strictEqual(
            severityToString(match.severity),
            expected.severity,
            `Severity mismatch for "${expected.code}" at line ${expected.startLine}`
          );
        }
      });

      it("quickfixes match expected actions", async function () {
        this.timeout(30000);

        const diagnostics = vscode.languages
          .getDiagnostics(ctx.templateUri)
          .filter((d) => d.source === DIAGNOSTIC_SOURCE);

        const quickfixMap = await collectQuickFixes(ctx.templateUri, diagnostics, IMPORT_COMMAND);

        for (const expected of descriptor.quickfixes) {
          const actions = quickfixMap.get(expected.diagnosticCode);
          assert.ok(actions && actions.length > 0, `No quickfix found for diagnostic "${expected.diagnosticCode}"`);

          const matchingAction = actions.find((a) => a.title === expected.title);
          assert.ok(
            matchingAction,
            `No quickfix with title "${expected.title}" for diagnostic "${expected.diagnosticCode}". Available: ${actions.map((a) => a.title).join(", ")}`
          );

          assert.strictEqual(
            matchingAction.command?.command,
            expected.command,
            `Quickfix command mismatch for "${expected.title}"`
          );
        }
      });

      it("quickfixes apply correct imports", async function () {
        const uniqueImportCount = new Set(
          descriptor.quickfixes.map(
            (quickfix) => `${quickfix.expectedImport.className}::${quickfix.expectedImport.moduleSpecifier}`
          )
        ).size;
        this.timeout(Math.max(120000, 30000 + uniqueImportCount * 2000));

        const diagnostics = vscode.languages
          .getDiagnostics(ctx.templateUri)
          .filter((d) => d.source === DIAGNOSTIC_SOURCE);

        const quickfixMap = await collectQuickFixes(ctx.templateUri, diagnostics, IMPORT_COMMAND);

        // Deduplicate quickfixes by className + moduleSpecifier to avoid
        // waiting on no-op file changes when the same import is already added
        const appliedImports = new Set<string>();

        for (const expected of descriptor.quickfixes) {
          const importKey = `${expected.expectedImport.className}::${expected.expectedImport.moduleSpecifier}`;
          if (appliedImports.has(importKey)) {
            continue;
          }

          const actions = quickfixMap.get(expected.diagnosticCode);
          assert.ok(actions && actions.length > 0, `No quickfix found for diagnostic "${expected.diagnosticCode}"`);

          const matchingAction = actions.find((a) => a.title === expected.title);
          assert.ok(
            matchingAction?.command,
            `No quickfix with title "${expected.title}" for "${expected.diagnosticCode}"`
          );

          const args = matchingAction.command.arguments ?? [];
          await vscode.commands.executeCommand(matchingAction.command.command, ...args);

          // Wait for file change event instead of fixed sleep
          await waitForFileChange(ctx.componentUri, 2000);
          appliedImports.add(importKey);
        }

        // Read the component file once after all quickfixes applied
        const updatedContent = fs.readFileSync(ctx.componentUri.fsPath, "utf-8");
        const templateFileName = getTemplateFileName(descriptor);

        // Verify each expected import
        for (const expected of descriptor.quickfixes) {
          const { className, moduleSpecifier } = expected.expectedImport;
          const result = verifyImportInComponent(updatedContent, className, moduleSpecifier, templateFileName);

          assert.ok(
            result.hasImportStatement,
            `Missing TypeScript import: expected "import { ${className} } from '${moduleSpecifier}'" in component file`
          );
          assert.ok(
            result.hasInImportsArray,
            `Missing from @Component imports array: expected "${className}" in imports: [...]`
          );
        }
      });
    });
  }
});
