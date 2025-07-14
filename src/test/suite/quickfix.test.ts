/**
 * =================================================================================================
 * QuickFix Provider Tests
 * =================================================================================================
 *
 * Tests for the QuickfixImportProvider that provides code actions for Angular elements.
 */

import * as assert from "node:assert";
import * as path from "node:path";
import * as vscode from "vscode";
import { QuickfixImportProvider } from "../../providers/quickfix";
import { AngularElementData } from "../../types";

describe("QuickfixImportProvider", function () {
  // Set timeout for all tests in this suite
  this.timeout(15000);

  let provider: QuickfixImportProvider;
  let mockIndexer: any;
  let mockDocument: any;
  let mockContext: any;
  let mockProviderContext: any;
  const testProjectPath = "/test/project";

  beforeEach(() => {
    // Create mock indexer with all required methods
    mockIndexer = {
      getAllSelectors: () =>
        Array.from(new Set(["test-component", "testPipe", "[testDirective]", "testDirective", "*ngIf"])),
      getElement: (selector: string) => {
        const elements = new Map([
          [
            "test-component",
            new AngularElementData("src/app/test.component.ts", "TestComponent", "component", "test-component", [
              "test-component",
            ], false),
          ],
          ["testPipe", new AngularElementData("src/app/test.pipe.ts", "TestPipe", "pipe", "testPipe", ["testPipe"], false)],
          [
            "[testDirective]",
            new AngularElementData("src/app/test.directive.ts", "TestDirective", "directive", "[testDirective]", [
              "testDirective",
              "[testDirective]",
            ], false),
          ],
          [
            "testDirective",
            new AngularElementData("src/app/test.directive.ts", "TestDirective", "directive", "[testDirective]", [
              "testDirective",
              "[testDirective]",
            ], false),
          ],
          [
            "*ngIf",
            new AngularElementData("@angular/common", "NgIf", "directive", "[ngIf]", ["ngIf", "*ngIf", "[ngIf]"], false),
          ],
        ]);
        return elements.get(selector);
      },
      // Add the missing searchWithSelectors method
      searchWithSelectors: (prefix: string): { selector: string; element: AngularElementData }[] => {
        const results: { selector: string; element: AngularElementData }[] = [];
        const allSelectors = mockIndexer.getAllSelectors();

        for (const selector of allSelectors) {
          if (selector.startsWith(prefix)) {
            const element = mockIndexer.getElement(selector);
            if (element) {
              results.push({ selector, element });
            }
          }
        }

        return results;
      },
    };

    // Create mock document
    mockDocument = {
      uri: vscode.Uri.file(path.join(testProjectPath, "src/app/test.html")),
      fileName: path.join(testProjectPath, "src/app/test.html"),
      languageId: "html",
      isUntitled: false,
      encoding: "utf8" as any,
      getText: (range?: vscode.Range) => {
        if (range) {
          return "test-component"; // Default text for range
        }
        return "<test-component></test-component>";
      },
      lineAt: () => ({
        text: "<test-component></test-component>",
        lineNumber: 0,
        range: new vscode.Range(0, 0, 0, 29),
        rangeIncludingLineBreak: new vscode.Range(0, 0, 1, 0),
        firstNonWhitespaceCharacterIndex: 0,
        isEmptyOrWhitespace: false,
      }),
      positionAt: () => new vscode.Position(0, 0),
      offsetAt: () => 0,
      lineCount: 1,
      version: 1,
      isDirty: false,
      isClosed: false,
      save: async () => true,
      eol: vscode.EndOfLine.LF,
      getWordRangeAtPosition: () => new vscode.Range(0, 0, 0, 14),
      validateRange: (range: vscode.Range) => range,
      validatePosition: (position: vscode.Position) => position,
    };

    // Create mock extension context
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: () => undefined,
        update: async () => {
          // Mock implementation
        },
        keys: () => [],
      },
      globalState: {
        get: () => undefined,
        update: async () => {
          // Mock implementation
        },
        keys: () => [],
        setKeysForSync: () => {
          // Mock implementation
        },
      },
      extensionPath: "",
      extensionUri: vscode.Uri.file(""),
      environmentVariableComponent: {},
      extensionMode: vscode.ExtensionMode.Test,
      logUri: vscode.Uri.file(""),
      storageUri: vscode.Uri.file(""),
      globalStorageUri: vscode.Uri.file(""),
      secrets: {} as any,
      extension: {} as any,
      languageModelAccessInformation: {} as any,
      asAbsolutePath: (relativePath: string) => relativePath,
      storagePath: undefined,
      globalStoragePath: "",
      logPath: "",
    };

    // Create mock provider context
    mockProviderContext = {
      projectIndexers: new Map([[testProjectPath, mockIndexer as any]]),
      projectTsConfigs: new Map([[testProjectPath, null]]),
      extensionConfig: {
        projectPath: null,
        indexRefreshInterval: 60,
        diagnosticsEnabled: true,
        diagnosticsSeverity: "warning" as any,
      },
      extensionContext: mockContext,
    };

    provider = new QuickfixImportProvider(mockProviderContext);
  });

  describe("Static Properties", () => {
    it("should have correct provided code action kinds", () => {
      assert.deepStrictEqual(
        QuickfixImportProvider.providedCodeActionKinds,
        [vscode.CodeActionKind.QuickFix],
        "Should provide QuickFix code actions"
      );
    });

 
  });

  describe("#provideCodeActions", () => {
    it("should return empty array when no diagnostics", async () => {
      const context = {
        diagnostics: [],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = await provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.deepStrictEqual(result, [], "Should return empty array when no diagnostics");
    });

    it("should return empty array when no project context", async () => {
      // Create document outside project
      const outsideDocument = {
        ...mockDocument,
        uri: vscode.Uri.file("/outside/project/test.html"),
        fileName: "/outside/project/test.html",
      };

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = await provider.provideCodeActions(
        outsideDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.deepStrictEqual(result, [], "Should return empty array when no project context");
    });

    it("should provide code actions for known Angular component", async () => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = await provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0] as vscode.CodeAction;
      assert.ok(action.title.includes("TestComponent"), "Should include component name in title");
      assert.strictEqual(action.kind, vscode.CodeActionKind.QuickFix, "Should be QuickFix kind");
      assert.ok(action.command, "Should have command");
      assert.strictEqual(action.command?.command, "angular-auto-import.importElement", "Should have correct command");
    });
  });

  describe("Error Handling", () => {
    it("should handle null diagnostics gracefully", async () => {
      const context = null as any;

      const result = await provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );
      assert.deepStrictEqual(result, [], "Should return empty array for null context");
    });

    it("should handle indexer errors gracefully", async () => {
      // Create broken provider with failing indexer
      const brokenProvider = new QuickfixImportProvider({
        projectIndexers: new Map([
          [
            testProjectPath,
            {
              getElement: () => {
                throw new Error("Simulated indexer failure");
              },
              getAllSelectors: () => {
                throw new Error("Simulated getAllSelectors failure");
              },
              searchWithSelectors: () => {
                throw new Error("Simulated searchWithSelectors failure");
              },
            } as any,
          ],
        ]),
        projectTsConfigs: new Map([[testProjectPath, {} as any]]),
        extensionConfig: mockProviderContext.extensionConfig,
        extensionContext: mockProviderContext.extensionContext,
      });

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      // Test that the provider doesn't throw and returns empty array
      const result = await brokenProvider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );
      assert.ok(Array.isArray(result), "Should return empty array on error");
      assert.strictEqual(result.length, 0, "Should return empty array on error");
    });
  });
});
