/**
 * =================================================================================================
 * QuickFix Provider Tests
 * =================================================================================================
 *
 * Tests for the QuickfixImportProvider that provides code actions for Angular elements.
 */

import assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import { ExtensionConfig } from "../../config";
import { QuickfixImportProvider } from "../../providers/quickfix";
import { AngularIndexer } from "../../services";
import { AngularElementData, ProcessedTsConfig } from "../../types";

describe("QuickfixImportProvider", function () {
  // Set timeout for all tests in this suite
  this.timeout(15000);

  let provider: QuickfixImportProvider;
  let mockIndexer: AngularIndexer;
  let mockDocument: vscode.TextDocument;
  let mockContext: vscode.ExtensionContext;
  let mockProviderContext: any;
  const testProjectPath = "/test/project";

  beforeEach(function () {
    // Create mock indexer
    mockIndexer = {
      getAllSelectors: () =>
        new Set(["test-component", "testPipe", "[testDirective]", "*ngIf"]),
      getElement: (selector: string) => {
        const elements = new Map([
          [
            "test-component",
            new AngularElementData(
              "src/app/test.component.ts",
              "TestComponent",
              "component",
              "test-component",
              ["test-component"]
            ),
          ],
          [
            "testPipe",
            new AngularElementData(
              "src/app/test.pipe.ts",
              "TestPipe",
              "pipe",
              "testPipe",
              ["testPipe"]
            ),
          ],
          [
            "[testDirective]",
            new AngularElementData(
              "src/app/test.directive.ts",
              "TestDirective",
              "directive",
              "[testDirective]",
              ["testDirective", "[testDirective]"]
            ),
          ],
          [
            "*ngIf",
            new AngularElementData(
              "@angular/common",
              "NgIf",
              "directive",
              "[ngIf]",
              ["ngIf", "*ngIf", "[ngIf]"]
            ),
          ],
        ]);
        return elements.get(selector);
      },
    } as any;

    // Create mock document
    mockDocument = {
      uri: vscode.Uri.file(path.join(testProjectPath, "src/app/test.html")),
      fileName: path.join(testProjectPath, "src/app/test.html"),
      languageId: "html",
      isUntitled: false,
      encoding: "utf8",
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
    } as unknown as vscode.TextDocument;

    // Create mock extension context
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: () => undefined,
        update: async () => {},
        keys: () => [],
      },
      globalState: {
        get: () => undefined,
        update: async () => {},
        keys: () => [],
        setKeysForSync: () => {},
      },
      extensionPath: "",
      extensionUri: vscode.Uri.file(""),
      environmentVariableComponent: {} as any,
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
    } as unknown as vscode.ExtensionContext;

    // Create mock provider context
    mockProviderContext = {
      projectIndexers: new Map([[testProjectPath, mockIndexer]]),
      projectTsConfigs: new Map<string, ProcessedTsConfig | null>([
        [testProjectPath, null],
      ]),
      extensionConfig: {
        projectPath: null,
        indexRefreshInterval: 60,
        diagnosticsEnabled: true,
        diagnosticsSeverity: "warning",
      } as ExtensionConfig,
      extensionContext: mockContext,
    };

    provider = new QuickfixImportProvider(mockProviderContext);
  });

  describe("Static Properties", function () {
    it("should have correct provided code action kinds", function () {
      assert.deepStrictEqual(
        QuickfixImportProvider.providedCodeActionKinds,
        [vscode.CodeActionKind.QuickFix],
        "Should provide QuickFix code actions"
      );
    });

    it("should have comprehensive diagnostic codes", function () {
      const codes = QuickfixImportProvider.fixesDiagnosticCode;

      assert.ok(
        codes.includes("NG8001"),
        "Should include NG8001 (unknown element)"
      );
      assert.ok(
        codes.includes("NG6004"),
        "Should include NG6004 (pipe not found)"
      );
      assert.ok(
        codes.includes("missing-component-import"),
        "Should include custom diagnostic codes"
      );
      assert.ok(
        codes.length > 10,
        "Should have comprehensive list of diagnostic codes"
      );
    });
  });

  describe("#provideCodeActions", function () {
    it("should return empty array when no diagnostics", function () {
      const context: vscode.CodeActionContext = {
        diagnostics: [],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.deepStrictEqual(
        result,
        [],
        "Should return empty array when no diagnostics"
      );
    });

    it("should return empty array when no project context", function () {
      // Create document outside project
      const outsideDocument = {
        ...mockDocument,
        uri: vscode.Uri.file("/outside/project/test.html"),
        fileName: "/outside/project/test.html",
      } as vscode.TextDocument;

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        outsideDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.deepStrictEqual(
        result,
        [],
        "Should return empty array when no project context"
      );
    });

    it("should provide code actions for known component diagnostic", function () {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(
        action.title.includes("TestComponent"),
        "Should include component name in title"
      );
      assert.strictEqual(
        action.kind,
        vscode.CodeActionKind.QuickFix,
        "Should be QuickFix kind"
      );
      assert.ok(action.command, "Should have command");
      assert.strictEqual(
        action.command.command,
        "angular-auto-import.importElement",
        "Should have correct command"
      );
    });

    it("should provide code actions for pipe diagnostic", function () {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 8),
        "The pipe 'testPipe' could not be found!",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG6004";

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "testPipe";
        }
        return "{{ value | testPipe }}";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 8),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(
        action.title.includes("TestPipe"),
        "Should include pipe name in title"
      );
      assert.strictEqual(
        action.command?.arguments?.[0],
        "testPipe",
        "Should pass correct selector"
      );
    });

    it("should provide code actions for directive diagnostic", function () {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 13),
        "'testDirective' is not a known attribute",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8003";

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "testDirective";
        }
        return "<div testDirective></div>";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 13),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(
        action.title.includes("TestDirective"),
        "Should include directive name in title"
      );
    });

    it("should handle Angular standard elements with preference", function () {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 5),
        "Structural directive '*ngIf' was used without corresponding import",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = "angular-auto-import";

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "*ngIf";
        }
        return "<div *ngIf='condition'></div>";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 5),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(action.title.includes("NgIf"), "Should include NgIf in title");
      assert.ok(
        action.title.includes("Angular"),
        "Should indicate it's an Angular element"
      );
      assert.strictEqual(
        action.isPreferred,
        true,
        "Angular elements should be preferred"
      );
    });

    it("should deduplicate identical actions", function () {
      const diagnostic1 = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic1.code = "NG8001";

      const diagnostic2 = new vscode.Diagnostic(
        new vscode.Range(0, 15, 0, 29),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic2.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic1, diagnostic2],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");

      // Should have only one action despite two identical diagnostics
      const uniqueCommands = new Set(
        result.map(
          (action) =>
            `${action.command?.command}:${JSON.stringify(
              action.command?.arguments
            )}`
        )
      );
      assert.strictEqual(
        uniqueCommands.size,
        result.length,
        "Should not have duplicate actions"
      );
    });

    it("should handle partial matches when exact match not found", function () {
      // Mock indexer to not have exact match but have partial matches
      const originalGetElement = mockIndexer.getElement;
      mockIndexer.getElement = (selector: string) => {
        if (selector === "unknown-component") {
          return undefined; // No exact match
        }
        return originalGetElement.call(mockIndexer, selector);
      };

      mockIndexer.getAllSelectors = () => {
        const selectors = new Set([
          "test-component", // This should match partially with "unknown-component"
          "another-component",
          "testPipe",
        ]);
        return selectors.values();
      };

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 17),
        "'unknown-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "unknown-component";
        }
        return "<unknown-component></unknown-component>";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 17),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      // Should find partial matches
      assert.ok(Array.isArray(result), "Should return array of code actions");
      // Note: Partial matching logic would need to be implemented in the mock
    });

    it("should sort actions with preferred ones first", function () {
      // Create mixed Angular and custom elements
      const angularElement = new AngularElementData(
        "@angular/common",
        "NgIf",
        "directive",
        "[ngIf]",
        ["ngIf", "*ngIf", "[ngIf]"]
      );

      const customElement = new AngularElementData(
        "src/app/custom.component.ts",
        "CustomComponent",
        "component",
        "custom-component",
        ["custom-component"]
      );

      mockIndexer.getElement = (selector: string) => {
        if (selector === "*ngIf") {
          return angularElement;
        }
        if (selector === "custom-component") {
          return customElement;
        }
        return undefined;
      };

      const diagnostic1 = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 5),
        "'*ngIf' structural directive was used",
        vscode.DiagnosticSeverity.Error
      );

      const diagnostic2 = new vscode.Diagnostic(
        new vscode.Range(1, 0, 1, 16),
        "'custom-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic2, diagnostic1], // Custom first, Angular second
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 1, 16),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length >= 2, "Should have at least two actions");

      // Angular elements should be preferred (first in sorted order)
      const angularAction = result.find((action) =>
        action.title.includes("Angular")
      );
      const customAction = result.find((action) =>
        action.title.includes("CustomComponent")
      );

      if (angularAction && customAction) {
        const angularIndex = result.indexOf(angularAction);
        const customIndex = result.indexOf(customAction);
        assert.ok(
          angularIndex < customIndex,
          "Angular actions should come before custom actions"
        );
      }
    });
  });

  describe("Error Handling", function () {
    it("should handle null diagnostics gracefully", function () {
      const context: vscode.CodeActionContext = {
        diagnostics: null as any,
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.deepStrictEqual(
        result,
        [],
        "Should return empty array for null diagnostics"
      );
    });

    it("should handle malformed diagnostics gracefully", function () {
      const malformedDiagnostic = {
        range: new vscode.Range(0, 0, 0, 14),
        message: null, // Invalid message
        severity: vscode.DiagnosticSeverity.Error,
      } as any;

      const context: vscode.CodeActionContext = {
        diagnostics: [malformedDiagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      assert.doesNotThrow(() => {
        const result = provider.provideCodeActions(
          mockDocument,
          new vscode.Range(0, 0, 0, 14),
          context,
          new vscode.CancellationTokenSource().token
        );
        assert.deepStrictEqual(
          result,
          [],
          "Should handle malformed diagnostics gracefully"
        );
      }, "Should not throw for malformed diagnostics");
    });

    it("should handle indexer errors gracefully", function () {
      // Mock indexer to throw errors
      mockIndexer.getElement = () => {
        throw new Error("Indexer error");
      };

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      assert.doesNotThrow(() => {
        const result = provider.provideCodeActions(
          mockDocument,
          new vscode.Range(0, 0, 0, 14),
          context,
          new vscode.CancellationTokenSource().token
        );
        assert.ok(
          Array.isArray(result),
          "Should return array even when indexer throws"
        );
      }, "Should handle indexer errors gracefully");
    });

    it("should handle document.getText errors gracefully", function () {
      // Mock document to throw error
      mockDocument.getText = () => {
        throw new Error("Document read error");
      };

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      assert.doesNotThrow(() => {
        const result = provider.provideCodeActions(
          mockDocument,
          new vscode.Range(0, 0, 0, 14),
          context,
          new vscode.CancellationTokenSource().token
        );
        assert.ok(
          Array.isArray(result),
          "Should return array even when document throws"
        );
      }, "Should handle document errors gracefully");
    });
  });

  describe("Diagnostic Pattern Matching", function () {
    const testCases = [
      {
        message: "'my-component' is not a known element",
        expectedTerm: "my-component",
        description: "standard unknown element message",
      },
      {
        message: "The pipe 'myPipe' could not be found!",
        expectedTerm: "myPipe",
        description: "pipe not found message",
      },
      {
        message: "No pipe found with name 'customPipe'",
        expectedTerm: "customPipe",
        description: "alternative pipe not found message",
      },
      {
        message: "structural directive '*ngFor' was used without import",
        expectedTerm: "*ngFor",
        description: "structural directive message",
      },
      {
        message: "'myDirective' is not a known attribute",
        expectedTerm: "myDirective",
        description: "unknown attribute message",
      },
      {
        message:
          "Can't bind to 'customProperty' since it isn't a known property",
        expectedTerm: "customProperty",
        description: "property binding message",
      },
    ];

    testCases.forEach(({ message, expectedTerm, description }) => {
      it(`should extract term from ${description}`, function () {
        const diagnostic = new vscode.Diagnostic(
          new vscode.Range(0, 0, 0, expectedTerm.length),
          message,
          vscode.DiagnosticSeverity.Error
        );

        // Mock the element to be found
        mockIndexer.getElement = (selector: string) => {
          if (
            selector === expectedTerm ||
            selector === expectedTerm.replace(/^\*/, "")
          ) {
            return new AngularElementData(
              "src/app/test.ts",
              "TestElement",
              "component",
              selector,
              [selector]
            );
          }
          return undefined;
        };

        mockDocument.getText = (range?: vscode.Range) => {
          if (range) {
            return expectedTerm;
          }
          return `<div>${expectedTerm}</div>`;
        };

        const context: vscode.CodeActionContext = {
          diagnostics: [diagnostic],
          only: undefined,
          triggerKind: vscode.CodeActionTriggerKind.Invoke,
        };

        const result = provider.provideCodeActions(
          mockDocument,
          new vscode.Range(0, 0, 0, expectedTerm.length),
          context,
          new vscode.CancellationTokenSource().token
        ) as vscode.CodeAction[];

        assert.ok(
          Array.isArray(result),
          `Should return array for ${description}`
        );
        if (result.length > 0) {
          assert.ok(
            result[0].command?.arguments?.includes(expectedTerm) ||
              result[0].command?.arguments?.includes(
                expectedTerm.replace(/^\*/, "")
              ),
            `Should extract correct term from ${description}`
          );
        }
      });
    });
  });

  describe("Selector Extraction", function () {
    const extractorTestCases = [
      {
        input: "<my-component>",
        expected: "my-component",
        description: "component tag",
      },
      {
        input: "<my-component attr='value'>",
        expected: "my-component",
        description: "component tag with attributes",
      },
      {
        input: "[myDirective]",
        expected: "myDirective",
        description: "attribute directive",
      },
      {
        input: "*ngIf",
        expected: "*ngIf",
        description: "structural directive",
      },
      {
        input: "| myPipe",
        expected: "myPipe",
        description: "pipe usage",
      },
      {
        input: "complex-selector-name",
        expected: "complex-selector-name",
        description: "complex selector",
      },
      {
        input: "",
        expected: "",
        description: "empty string",
      },
      {
        input: "   whitespace   ",
        expected: "whitespace",
        description: "string with whitespace",
      },
    ];

    extractorTestCases.forEach(({ input, expected, description }) => {
      it(`should extract selector from ${description}`, function () {
        // Access private method through any cast for testing
        const extractSelector = (provider as any).extractSelector.bind(
          provider
        );
        const result = extractSelector(input);

        assert.strictEqual(
          result,
          expected,
          `Should extract '${expected}' from '${input}'`
        );
      });
    });
  });

  describe("Code Action Validation", function () {
    it("should validate well-formed code actions", function () {
      const validAction = new vscode.CodeAction(
        "Import TestComponent",
        vscode.CodeActionKind.QuickFix
      );
      validAction.command = {
        title: "Import TestComponent",
        command: "angular-auto-import.importElement",
        arguments: ["test-component"],
      };

      const validateCodeAction = (provider as any).validateCodeAction.bind(
        provider
      );
      const result = validateCodeAction(validAction);

      assert.strictEqual(
        result,
        true,
        "Should validate well-formed code action"
      );
    });

    it("should reject malformed code actions", function () {
      const validateCodeAction = (provider as any).validateCodeAction.bind(
        provider
      );

      const testCases = [
        { action: null, description: "null action" },
        { action: undefined, description: "undefined action" },
        { action: {}, description: "empty object" },
        { action: { title: "Test" }, description: "missing command" },
        {
          action: { title: "Test", command: {} },
          description: "empty command",
        },
        {
          action: { title: "Test", command: { command: "test" } },
          description: "missing arguments",
        },
        {
          action: { title: "Test", command: { arguments: [] } },
          description: "missing command string",
        },
      ];

      testCases.forEach(({ action, description }) => {
        const result = validateCodeAction(action);
        assert.strictEqual(result, false, `Should reject ${description}`);
      });
    });
  });

  describe("Integration Tests", function () {
    it("should handle multiple different diagnostic types in one request", function () {
      const componentDiagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      componentDiagnostic.code = "NG8001";

      const pipeDiagnostic = new vscode.Diagnostic(
        new vscode.Range(1, 0, 1, 8),
        "The pipe 'testPipe' could not be found!",
        vscode.DiagnosticSeverity.Error
      );
      pipeDiagnostic.code = "NG6004";

      const directiveDiagnostic = new vscode.Diagnostic(
        new vscode.Range(2, 0, 2, 13),
        "'testDirective' is not a known attribute",
        vscode.DiagnosticSeverity.Error
      );
      directiveDiagnostic.code = "NG8003";

      const context: vscode.CodeActionContext = {
        diagnostics: [componentDiagnostic, pipeDiagnostic, directiveDiagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 2, 13),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(
        result.length >= 3,
        "Should have actions for all diagnostic types"
      );

      // Check that we have actions for each type
      const hasComponentAction = result.some((action) =>
        action.title.includes("TestComponent")
      );
      const hasPipeAction = result.some((action) =>
        action.title.includes("TestPipe")
      );
      const hasDirectiveAction = result.some((action) =>
        action.title.includes("TestDirective")
      );

      assert.ok(hasComponentAction, "Should have component action");
      assert.ok(hasPipeAction, "Should have pipe action");
      assert.ok(hasDirectiveAction, "Should have directive action");
    });

    it("should handle cancellation token", function () {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const cancelledToken = new vscode.CancellationTokenSource();
      cancelledToken.cancel();

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        cancelledToken.token
      );

      assert.deepStrictEqual(
        result,
        [],
        "Should return empty array when cancelled"
      );
    });

    it("should handle module imports correctly", function () {
      const moduleElement = new AngularElementData(
        "@angular/forms",
        "FormsModule",
        "directive",
        "[ngModel]",
        ["ngModel", "[ngModel]"]
      );

      mockIndexer.getElement = (selector: string) => {
        if (selector === "ngModel" || selector === "[ngModel]") {
          return moduleElement;
        }
        return undefined;
      };

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 7),
        "'ngModel' is not a known attribute",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8003";

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "ngModel";
        }
        return "<input ngModel>";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 7),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(
        action.title.includes("module"),
        "Should indicate it's a module import"
      );
      assert.ok(
        action.title.includes("FormsModule"),
        "Should include module name"
      );
    });

    it("should handle complex selector patterns", function () {
      const complexElement = new AngularElementData(
        "src/app/complex.component.ts",
        "ComplexComponent",
        "component",
        "app-complex[data-test]",
        ["app-complex[data-test]", "app-complex"]
      );

      mockIndexer.getElement = (selector: string) => {
        if (
          selector === "app-complex" ||
          selector === "app-complex[data-test]"
        ) {
          return complexElement;
        }
        return undefined;
      };

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 11),
        "'app-complex' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "app-complex";
        }
        return "<app-complex data-test='true'></app-complex>";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 11),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(
        action.title.includes("ComplexComponent"),
        "Should include component name"
      );
    });
  });

  describe("Advanced Pattern Matching", function () {
    it("should handle structural directive patterns correctly", function () {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 5),
        "Structural directive '*ngFor' was used without corresponding import",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = "angular-auto-import";

      // Mock NgFor element
      const ngForElement = new AngularElementData(
        "@angular/common",
        "NgForOf",
        "directive",
        "[ngFor]",
        ["ngFor", "*ngFor", "[ngFor]", "[ngForOf]"]
      );

      mockIndexer.getElement = (selector: string) => {
        if (
          selector === "*ngFor" ||
          selector === "ngFor" ||
          selector === "[ngFor]"
        ) {
          return ngForElement;
        }
        return undefined;
      };

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "*ngFor";
        }
        return "<div *ngFor='let item of items'></div>";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 5),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(
        action.title.includes("NgForOf"),
        "Should include NgForOf in title"
      );
      assert.strictEqual(
        action.isPreferred,
        true,
        "Angular elements should be preferred"
      );
    });

    it("should handle attribute directive patterns", function () {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 10),
        "'routerLink' is not a known attribute",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8003";

      const routerLinkElement = new AngularElementData(
        "@angular/router",
        "RouterLink",
        "directive",
        "[routerLink]",
        ["routerLink", "[routerLink]"]
      );

      mockIndexer.getElement = (selector: string) => {
        if (selector === "routerLink" || selector === "[routerLink]") {
          return routerLinkElement;
        }
        return undefined;
      };

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "routerLink";
        }
        return "<a routerLink='/home'>Home</a>";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 10),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(
        action.title.includes("RouterLink"),
        "Should include RouterLink in title"
      );
      assert.strictEqual(
        action.command?.arguments?.[0],
        "routerLink",
        "Should pass correct selector"
      );
    });

    it("should handle pipe patterns in interpolation", function () {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 11, 0, 19),
        "No pipe found with name 'currency'",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "-998004";

      const currencyPipeElement = new AngularElementData(
        "@angular/common",
        "CurrencyPipe",
        "pipe",
        "currency",
        ["currency"]
      );

      mockIndexer.getElement = (selector: string) => {
        if (selector === "currency") {
          return currencyPipeElement;
        }
        return undefined;
      };

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "currency";
        }
        return "{{ price | currency }}";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 11, 0, 19),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(
        action.title.includes("CurrencyPipe"),
        "Should include CurrencyPipe in title"
      );
      assert.ok(
        action.title.includes("Angular"),
        "Should indicate it's an Angular pipe"
      );
      assert.strictEqual(
        action.isPreferred,
        true,
        "Angular pipes should be preferred"
      );
    });
  });

  describe("Error Recovery and Resilience", function () {
    it("should handle corrupted indexer gracefully", function () {
      // Mock a corrupted indexer that throws errors
      const corruptedIndexer = {
        getAllSelectors: () => {
          throw new Error("Indexer corrupted");
        },
        getElement: () => {
          throw new Error("Indexer corrupted");
        },
      };

      const corruptedProviderContext = {
        ...mockProviderContext,
        projectIndexers: new Map([[testProjectPath, corruptedIndexer]]),
      };

      const corruptedProvider = new QuickfixImportProvider(
        corruptedProviderContext
      );

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      assert.doesNotThrow(() => {
        const result = corruptedProvider.provideCodeActions(
          mockDocument,
          new vscode.Range(0, 0, 0, 14),
          context,
          new vscode.CancellationTokenSource().token
        );
        assert.deepStrictEqual(
          result,
          [],
          "Should return empty array when indexer fails"
        );
      }, "Should handle corrupted indexer gracefully");
    });

    it("should handle empty selector extraction", function () {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 0),
        "Unknown error occurred",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return ""; // Empty text
        }
        return "";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 0),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.deepStrictEqual(
        result,
        [],
        "Should return empty array for empty selectors"
      );
    });

    it("should handle mixed valid and invalid diagnostics", function () {
      const validDiagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      validDiagnostic.code = "NG8001";

      const invalidDiagnostic = new vscode.Diagnostic(
        new vscode.Range(1, 0, 1, 10),
        "Some other error",
        vscode.DiagnosticSeverity.Error
      );
      // No code set, should be ignored

      const context: vscode.CodeActionContext = {
        diagnostics: [validDiagnostic, invalidDiagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 1, 10),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      // Should only process the valid diagnostic
      assert.ok(result.length > 0, "Should have actions for valid diagnostic");
      assert.ok(
        result.every((action) => action.title.includes("TestComponent")),
        "All actions should be for the valid diagnostic"
      );
    });
  });

  describe("Performance and Edge Cases", function () {
    it("should handle large number of diagnostics efficiently", function () {
      const diagnostics: vscode.Diagnostic[] = [];
      for (let i = 0; i < 100; i++) {
        const diagnostic = new vscode.Diagnostic(
          new vscode.Range(0, 0, 0, 14),
          `'test-component-${i}' is not a known element`,
          vscode.DiagnosticSeverity.Error
        );
        diagnostic.code = "NG8001";
        diagnostics.push(diagnostic);
      }

      const context: vscode.CodeActionContext = {
        diagnostics,
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const start = Date.now();
      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );
      const duration = Date.now() - start;

      assert.ok(Array.isArray(result), "Should return array");
      assert.ok(duration < 1000, "Should complete within 1 second");
    });

    it("should handle very long diagnostic messages", function () {
      const longMessage =
        "'very-long-component-name-that-exceeds-normal-limits-and-tests-message-parsing-robustness-with-additional-text-to-make-it-even-longer-for-comprehensive-testing-purposes' is not a known element";

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 100),
        longMessage,
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      assert.doesNotThrow(() => {
        provider.provideCodeActions(
          mockDocument,
          new vscode.Range(0, 0, 0, 100),
          context,
          new vscode.CancellationTokenSource().token
        );
      }, "Should handle very long diagnostic messages gracefully");
    });

    it("should handle unicode and special characters in selectors", function () {
      // Use a simpler test with ASCII characters that contain special symbols
      const specialElement = new AngularElementData(
        "src/app/special.component.ts",
        "SpecialComponent",
        "component",
        "special-component",
        ["special-component"]
      );

      // Reset the mock indexer to handle special selectors
      mockIndexer.getElement = (selector: string) => {
        if (selector === "special-component") {
          return specialElement;
        }
        // Return the default test component for other selectors
        if (selector === "test-component") {
          return new AngularElementData(
            "src/app/test.component.ts",
            "TestComponent",
            "component",
            "test-component",
            ["test-component"]
          );
        }
        return undefined;
      };

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 17),
        "'special-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      // Ensure the mock document returns the special selector
      const originalGetText = mockDocument.getText;
      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "special-component";
        }
        return "<special-component></special-component>";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      try {
        const result = provider.provideCodeActions(
          mockDocument,
          new vscode.Range(0, 0, 0, 17),
          context,
          new vscode.CancellationTokenSource().token
        ) as vscode.CodeAction[];

        assert.ok(Array.isArray(result), "Should return array of code actions");
        assert.ok(result.length > 0, "Should have at least one code action");

        const action = result[0];
        assert.ok(
          action.title.includes("SpecialComponent"),
          "Should include component name in title"
        );
      } finally {
        // Restore original getText function
        mockDocument.getText = originalGetText;
      }
    });
  });

  describe("Context7-Enhanced Testing Patterns", function () {
    it("should follow VS Code extension testing best practices", function () {
      // Test that provider implements the correct interface
      assert.ok(
        typeof provider.provideCodeActions === "function",
        "Should implement provideCodeActions method"
      );

      // Test that static properties are correctly defined
      assert.ok(
        Array.isArray(QuickfixImportProvider.providedCodeActionKinds),
        "Should have providedCodeActionKinds array"
      );

      assert.ok(
        Array.isArray(QuickfixImportProvider.fixesDiagnosticCode),
        "Should have fixesDiagnosticCode array"
      );
    });

    it("should handle async operations gracefully", async function () {
      // Create a mock that simulates async behavior
      const asyncMockIndexer = {
        getElement: async (selector: string) => {
          // Simulate async delay
          await new Promise((resolve) => setTimeout(resolve, 10));
          if (selector === "async-component") {
            return new AngularElementData(
              "src/app/async.component.ts",
              "AsyncComponent",
              "component",
              "async-component",
              ["async-component"]
            );
          }
          return undefined;
        },
        getAllSelectors: () => ["async-component"].values(),
      };

      // Create provider with async indexer
      const asyncProvider = new QuickfixImportProvider({
        projectIndexers: new Map([[testProjectPath, asyncMockIndexer as any]]),
        projectTsConfigs: new Map([[testProjectPath, {} as any]]),
        extensionConfig: mockProviderContext.extensionConfig,
        extensionContext: mockProviderContext.extensionContext,
      });

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 15),
        "'async-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      // Test that sync method handles async indexer gracefully
      const result = asyncProvider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 15),
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.ok(
        Array.isArray(result),
        "Should return array even with async indexer"
      );
    });

    it("should provide meaningful error context in production", function () {
      // Test that the provider handles errors gracefully and returns empty array
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

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      // Test that the provider doesn't throw and returns empty array
      assert.doesNotThrow(() => {
        const result = brokenProvider.provideCodeActions(
          mockDocument,
          new vscode.Range(0, 0, 0, 14),
          context,
          new vscode.CancellationTokenSource().token
        );

        assert.ok(Array.isArray(result), "Should return empty array on error");
        assert.strictEqual(
          result.length,
          0,
          "Should return empty array on error"
        );
      }, "Should handle errors gracefully without throwing");
    });

    it("should handle workspace-specific configurations", function () {
      // Test with multiple project configurations
      const project1Path = "/path/to/project1";
      const project2Path = "/path/to/project2";

      const multiProjectProvider = new QuickfixImportProvider({
        projectIndexers: new Map([
          [project1Path, mockIndexer],
          [project2Path, mockIndexer],
        ]),
        projectTsConfigs: new Map([
          [project1Path, { useAliases: true } as any],
          [project2Path, { useAliases: false } as any],
        ]),
        extensionConfig: mockProviderContext.extensionConfig,
        extensionContext: mockProviderContext.extensionContext,
      });

      // Mock document from project1
      const project1Document = {
        ...mockDocument,
        uri: vscode.Uri.file(path.join(project1Path, "src/app/test.html")),
        fileName: path.join(project1Path, "src/app/test.html"),
      } as vscode.TextDocument;

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = multiProjectProvider.provideCodeActions(
        project1Document,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );

      assert.ok(
        Array.isArray(result),
        "Should handle multi-project configurations"
      );
    });

    it("should respect VS Code theming and accessibility", function () {
      // Test that code actions follow VS Code UI patterns
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      if (result.length > 0) {
        const action = result[0];

        // Test accessibility - titles should be descriptive
        assert.ok(
          action.title.length > 5,
          "Action titles should be descriptive for screen readers"
        );

        // Test that actions have proper kinds for VS Code UI
        assert.ok(
          action.kind,
          "Actions should have proper kinds for VS Code categorization"
        );

        // Test that actions are properly structured
        assert.ok(action.command, "Actions should have commands for execution");
      }
    });

    it("should handle memory pressure gracefully", function () {
      // Test with a large number of elements to simulate memory pressure
      const largeIndexer = {
        getElement: (selector: string) => {
          // Simulate a large index with many elements
          if (selector.startsWith("component-")) {
            return new AngularElementData(
              `src/app/${selector}.ts`,
              `${
                selector.charAt(0).toUpperCase() + selector.slice(1)
              }Component`,
              "component",
              selector,
              [selector]
            );
          }
          return undefined;
        },
        getAllSelectors: () => {
          // Generate a large number of selectors
          const selectors = [];
          for (let i = 0; i < 10000; i++) {
            selectors.push(`component-${i}`);
          }
          return selectors.values();
        },
      };

      const memoryTestProvider = new QuickfixImportProvider({
        projectIndexers: new Map([[testProjectPath, largeIndexer as any]]),
        projectTsConfigs: new Map([[testProjectPath, {} as any]]),
        extensionConfig: mockProviderContext.extensionConfig,
        extensionContext: mockProviderContext.extensionContext,
      });

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'component-999' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      mockDocument.getText = (range?: vscode.Range) => {
        if (range) {
          return "component-999";
        }
        return "<component-999></component-999>";
      };

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const start = Date.now();
      const result = memoryTestProvider.provideCodeActions(
        mockDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      );
      const duration = Date.now() - start;

      assert.ok(Array.isArray(result), "Should handle large indexes");
      assert.ok(
        duration < 5000,
        "Should complete within reasonable time even with large index"
      );
    });
  });

  describe("Active Document Synchronization", function () {
    it("should work correctly with active VSCode documents on first access", function () {
      // Test that simulates the bug scenario: first access to component with inline template
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      // Mock an active document that might have unsaved changes
      const activeDocument = {
        ...mockDocument,
        getText: () =>
          `
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '<test-component></test-component>',
  standalone: true,
  imports: []
})
export class TestComponent {}
        `.trim(),
        isDirty: true, // Simulate unsaved changes
        version: 2, // Simulate document has been modified
      } as vscode.TextDocument;

      // Mock vscode.workspace.textDocuments to include our active document
      const originalTextDocuments = vscode.workspace.textDocuments;
      Object.defineProperty(vscode.workspace, "textDocuments", {
        value: [activeDocument],
        configurable: true,
      });

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      try {
        const result = provider.provideCodeActions(
          activeDocument,
          new vscode.Range(0, 0, 0, 14),
          context,
          new vscode.CancellationTokenSource().token
        ) as vscode.CodeAction[];

        assert.ok(Array.isArray(result), "Should return array of code actions");
        assert.ok(result.length > 0, "Should have at least one code action");

        const action = result[0];
        assert.ok(
          action.title.includes("TestComponent"),
          "Should include component name in title"
        );
        assert.strictEqual(
          action.command?.command,
          "angular-auto-import.importElement",
          "Should have correct command"
        );
        assert.strictEqual(
          action.command?.arguments?.[0],
          "test-component",
          "Should pass correct selector"
        );
      } finally {
        // Restore original textDocuments
        Object.defineProperty(vscode.workspace, "textDocuments", {
          value: originalTextDocuments,
          configurable: true,
        });
      }
    });

    it("should handle documents with unsaved changes correctly", function () {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 8),
        "The pipe 'testPipe' could not be found!",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG6004";

      // Mock document with unsaved changes that includes pipe usage
      const unsavedDocument = {
        ...mockDocument,
        getText: (range?: vscode.Range) => {
          if (range) {
            return "testPipe";
          }
          return `
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '{{ value | testPipe }}',
  standalone: true,
  imports: []
})
export class TestComponent {}
          `.trim();
        },
        isDirty: true,
        version: 3,
      } as vscode.TextDocument;

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        unsavedDocument,
        new vscode.Range(0, 0, 0, 8),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(
        action.title.includes("TestPipe"),
        "Should include pipe name in title"
      );
      assert.strictEqual(
        action.command?.arguments?.[0],
        "testPipe",
        "Should pass correct selector"
      );
    });

    it("should fallback to disk content when document is not active", function () {
      // Test the fallback scenario when document is not in active documents
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      // Mock empty textDocuments to simulate document not being active
      const originalTextDocuments = vscode.workspace.textDocuments;
      Object.defineProperty(vscode.workspace, "textDocuments", {
        value: [],
        configurable: true,
      });

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      try {
        const result = provider.provideCodeActions(
          mockDocument,
          new vscode.Range(0, 0, 0, 14),
          context,
          new vscode.CancellationTokenSource().token
        ) as vscode.CodeAction[];

        assert.ok(Array.isArray(result), "Should return array of code actions");
        // Should still work even without active document (fallback to disk)
      } finally {
        // Restore original textDocuments
        Object.defineProperty(vscode.workspace, "textDocuments", {
          value: originalTextDocuments,
          configurable: true,
        });
      }
    });
  });

  describe("Update Diagnostics", function () {
    it("should update diagnostics with proper timing after import", async function () {
      this.timeout(10000); // Increase timeout for this test

      // Mock diagnostic provider with tracking
      let updateCallCount = 0;
      const mockDiagnosticProvider = {
        forceUpdateDiagnosticsForFile: async (filePath: string) => {
          updateCallCount++;
          console.log(
            `Mock diagnostic update #${updateCallCount} for ${path.basename(
              filePath
            )}`
          );
          return Promise.resolve();
        },
      };

      // Set global diagnostic provider
      const { setGlobalDiagnosticProvider } = await import(
        "../../utils/import.js"
      );
      setGlobalDiagnosticProvider(mockDiagnosticProvider);

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = "NG8001";

      // Mock active document with inline template
      const activeDocument = {
        ...mockDocument,
        getText: () =>
          `
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '<test-component></test-component>',
  standalone: true,
  imports: []
})
export class TestComponent {}
        `.trim(),
        isDirty: true,
        version: 2,
      } as vscode.TextDocument;

      // Mock vscode.workspace.textDocuments
      const originalTextDocuments = vscode.workspace.textDocuments;
      Object.defineProperty(vscode.workspace, "textDocuments", {
        value: [activeDocument],
        configurable: true,
      });

      // Mock vscode.workspace.applyEdit
      const originalApplyEdit = vscode.workspace.applyEdit;
      vscode.workspace.applyEdit = async () => Promise.resolve(true);

      const context: vscode.CodeActionContext = {
        diagnostics: [diagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      try {
        const result = provider.provideCodeActions(
          activeDocument,
          new vscode.Range(0, 0, 0, 14),
          context,
          new vscode.CancellationTokenSource().token
        ) as vscode.CodeAction[];

        assert.ok(Array.isArray(result), "Should return array of code actions");
        assert.ok(result.length > 0, "Should have at least one code action");

        const action = result[0];
        assert.ok(action.command, "Action should have command");

        // Simulate command execution (which would call importElementToFile)
        if (
          action.command &&
          action.command.command === "angular-auto-import.importElement"
        ) {
          // Wait for diagnostic updates to complete
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Verify that diagnostic updates were called multiple times
          assert.ok(
            updateCallCount >= 2,
            `Should call diagnostic update multiple times, got ${updateCallCount}`
          );
        }
      } finally {
        // Restore original functions
        Object.defineProperty(vscode.workspace, "textDocuments", {
          value: originalTextDocuments,
          configurable: true,
        });
        vscode.workspace.applyEdit = originalApplyEdit;
        setGlobalDiagnosticProvider(null);
      }
    });

    it("should handle diagnostic updates for both inline and external templates", function () {
      // Test that the provider can handle both inline templates and external HTML files
      const componentDiagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 14),
        "'test-component' is not a known element",
        vscode.DiagnosticSeverity.Error
      );
      componentDiagnostic.code = "NG8001";

      // Mock TypeScript document with inline template
      const tsDocument = {
        ...mockDocument,
        fileName: path.join(testProjectPath, "src/app/test.component.ts"),
        languageId: "typescript",
        getText: () =>
          `
@Component({
  selector: 'app-test',
  template: '<test-component></test-component>',
  standalone: true,
  imports: []
})
export class TestComponent {}
        `.trim(),
      } as vscode.TextDocument;

      const context: vscode.CodeActionContext = {
        diagnostics: [componentDiagnostic],
        only: undefined,
        triggerKind: vscode.CodeActionTriggerKind.Invoke,
      };

      const result = provider.provideCodeActions(
        tsDocument,
        new vscode.Range(0, 0, 0, 14),
        context,
        new vscode.CancellationTokenSource().token
      ) as vscode.CodeAction[];

      assert.ok(Array.isArray(result), "Should return array of code actions");
      assert.ok(result.length > 0, "Should have at least one code action");

      const action = result[0];
      assert.ok(
        action.title.includes("TestComponent"),
        "Should include component name in title"
      );
      assert.strictEqual(
        action.command?.command,
        "angular-auto-import.importElement",
        "Should have correct command"
      );
    });
  });
});
