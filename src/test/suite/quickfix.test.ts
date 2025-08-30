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
        Array.from(
          new Set([
            "test-component",
            "standalone-component",
            "test-module",
            "testPipe",
            "[testDirective]",
            "testDirective",
            "*ngIf",
          ])
        ),
      getElement: (selector: string) => {
        const elements = new Map([
          [
            "test-component",
            new AngularElementData(
              "src/app/test.component.ts",
              "TestComponent",
              "component",
              "test-component",
              ["test-component"],
              false,
              false // isExternal
            ),
          ],
          [
            "standalone-component",
            new AngularElementData(
              "src/app/standalone.component.ts",
              "StandaloneComponent",
              "component",
              "standalone-component",
              ["standalone-component"],
              true, // standalone
              false // isExternal
            ),
          ],
          [
            "test-module",
            new AngularElementData(
              "src/app/test.module.ts",
              "TestModule",
              "component", // Modules are treated as components for the purpose of this test
              "test-module",
              ["test-module"],
              false,
              false // isExternal
            ),
          ],
          [
            "testPipe",
            new AngularElementData("src/app/test.pipe.ts", "TestPipe", "pipe", "testPipe", ["testPipe"], false, false), // isExternal
          ],
          [
            "[testDirective]",
            new AngularElementData(
              "src/app/test.directive.ts",
              "TestDirective",
              "directive",
              "[testDirective]",
              ["testDirective", "[testDirective]"],
              false,
              false // isExternal
            ),
          ],
          [
            "testDirective",
            new AngularElementData(
              "src/app/test.directive.ts",
              "TestDirective",
              "directive",
              "[testDirective]",
              ["testDirective", "[testDirective]"],
              false,
              false // isExternal
            ),
          ],
          [
            "*ngIf",
            new AngularElementData(
              "@angular/common",
              "NgIf",
              "directive",
              "[ngIf]",
              ["ngIf", "*ngIf", "[ngIf]"],
              false,
              true // isExternal
            ),
          ],
        ]);
        return elements.get(selector);
      },
      getElements: (selector: string) => {
        const elements = new Map([
          [
            "test-component",
            [
              new AngularElementData(
                "src/app/test.component.ts",
                "TestComponent",
                "component",
                "test-component",
                ["test-component"],
                false,
                false // isExternal
              ),
            ],
          ],
          [
            "standalone-component",
            [
              new AngularElementData(
                "src/app/standalone.component.ts",
                "StandaloneComponent",
                "component",
                "standalone-component",
                ["standalone-component"],
                true,
                false // isExternal
              ),
            ],
          ],
          [
            "test-module",
            [
              new AngularElementData(
                "src/app/test.module.ts",
                "TestModule",
                "component",
                "test-module",
                ["test-module"],
                false,
                false // isExternal
              ),
            ],
          ],
          [
            "testPipe",
            [new AngularElementData("src/app/test.pipe.ts", "TestPipe", "pipe", "testPipe", ["testPipe"], false, false)], // isExternal
          ],
          [
            "[testDirective]",
            [
              new AngularElementData(
                "src/app/test.directive.ts",
                "TestDirective",
                "directive",
                "[testDirective]",
                ["testDirective", "[testDirective]"],
                false,
                false // isExternal
              ),
            ],
          ],
          [
            "testDirective",
            [
              new AngularElementData(
                "src/app/test.directive.ts",
                "TestDirective",
                "directive",
                "[testDirective]",
                ["testDirective", "[testDirective]"],
                false,
                false // isExternal
              ),
            ],
          ],
          [
            "*ngIf",
            [
              new AngularElementData(
                "@angular/common",
                "NgIf",
                "directive",
                "[ngIf]",
                ["ngIf", "*ngIf", "[ngIf]"],
                false,
                true // isExternal
              ),
            ],
          ],
        ]);
        return elements.get(selector) || [];
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
      project: {} as any, // Add project property for ts-morph compatibility
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
        "'test-component' is part of a known component, but it is not imported.",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "missing-component-import:test-component";
      diagnostic.source = "angular-auto-import";

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

    it("should deduplicate multiple diagnostics for same element", async () => {
      const diagnostic1 = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is part of a known component, but it is not imported.",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic1.code = "missing-component-import:test-component";
      diagnostic1.source = "angular-auto-import";

      const diagnostic2 = new vscode.Diagnostic(
        new vscode.Range(0, 15, 0, 29),
        "'test-component' is part of a known component, but it is not imported.",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic2.code = "missing-component-import:test-component";
      diagnostic2.source = "angular-auto-import";

      const context = {
        diagnostics: [diagnostic1, diagnostic2],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = await provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 29), // Range that covers both diagnostics
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.strictEqual(result.length, 1, "Should deduplicate to single action");

      const action = result[0] as vscode.CodeAction;
      assert.ok(action.title.includes("TestComponent"), "Should include component name in title");
    });

    it("should ignore diagnostics not from angular-auto-import", async () => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";
      diagnostic.source = "typescript"; // Different source

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

      assert.deepStrictEqual(result, [], "Should return empty array for non-angular-auto-import diagnostics");
    });

    it("should ignore diagnostics with invalid code format", async () => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is part of a known component, but it is not imported.",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "invalid-code-format"; // No colon separator
      diagnostic.source = "angular-auto-import";

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

      assert.deepStrictEqual(result, [], "Should return empty array for diagnostics with invalid code format");
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
              getElements: () => {
                throw new Error("Simulated getElements failure");
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
        "'test-component' is part of a known component, but it is not imported.",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "missing-component-import:test-component";
      diagnostic.source = "angular-auto-import";

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

    it("should handle cancellation token gracefully", async () => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is part of a known component, but it is not imported.",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "missing-component-import:test-component";
      diagnostic.source = "angular-auto-import";

      const context = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      // Create cancelled token
      const tokenSource = new vscode.CancellationTokenSource();
      tokenSource.cancel();

      const result = await provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        tokenSource.token
      );

      assert.deepStrictEqual(result, [], "Should return empty array when cancelled");
    });

    it("should handle element not found in indexer", async () => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'unknown-component' is part of a known component, but it is not imported.",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "missing-component-import:unknown-component";
      diagnostic.source = "angular-auto-import";

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

      assert.deepStrictEqual(result, [], "Should return empty array when element not found");
    });
  });

  describe("Different Element Types", () => {
    it("should create action for standalone component", async () => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 20),
        "'standalone-component' is part of a known component, but it is not imported.",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "missing-component-import:standalone-component";
      diagnostic.source = "angular-auto-import";

      const context = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = await provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 20),
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0] as vscode.CodeAction;
      assert.ok(action.title.includes("StandaloneComponent"), "Should include component name in title");
      assert.ok(action.title.includes("(standalone)"), "Should indicate standalone component");
      assert.strictEqual(action.isPreferred, true, "Should be preferred action");
    });

    it("should create action for module", async () => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 11),
        "'test-module' is part of a known component, but it is not imported.",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "missing-component-import:test-module";
      diagnostic.source = "angular-auto-import";

      const context = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = await provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 11),
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0] as vscode.CodeAction;
      assert.ok(action.title.includes("TestModule"), "Should include module name in title");
      assert.ok(action.title.includes("⟐ Import TestModule"), "Should have import title for module");
    });
  });
});
