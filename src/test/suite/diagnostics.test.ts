import * as assert from "node:assert";
import * as path from "node:path";
import { Project } from "ts-morph";
import * as vscode from "vscode";
import { DiagnosticProvider } from "../../providers/diagnostics";
import { AngularElementData } from "../../types";

describe("DiagnosticProvider", function () {
  this.timeout(15000);

  const testProjectPath = "/test/project";
  let provider: DiagnosticProvider;
  let sourceFile: import("ts-morph").SourceFile;
  let cssSelectorCtor: unknown;
  let selectorMatcherCtor: unknown;
  let importedNames = new Set<string>();

  const indexEntries = new Map<string, AngularElementData[]>([
    [
      "nz-button",
      [
        new AngularElementData({
          path: "ng-zorro-antd/button",
          name: "NzButtonComponent",
          type: "component",
          originalSelector: "button[nz-button], a[nz-button]",
          selectors: ["button[nz-button]", "a[nz-button]", "nz-button", "[nz-button]"],
          isStandalone: true,
          isExternal: true,
        }),
        new AngularElementData({
          path: "ng-zorro-antd/core/wave",
          name: "NzWaveDirective",
          type: "directive",
          originalSelector: '[nz-wave],button[nz-button]:not([nzType="link"]):not([nzType="text"])',
          selectors: [
            "[nz-wave]",
            'button[nz-button]:not([nzType="link"]):not([nzType="text"])',
            "nz-wave",
            "[nz-wave]",
            "nz-button",
            "[nz-button]",
          ],
          isStandalone: true,
          isExternal: true,
        }),
      ],
    ],
    [
      "nz-dropdown",
      [
        new AngularElementData({
          path: "ng-zorro-antd/dropdown",
          name: "NzDropDownDirective",
          type: "directive",
          originalSelector: "[nz-dropdown]",
          selectors: ["nz-dropdown", "[nz-dropdown]"],
          isStandalone: true,
          isExternal: true,
        }),
        new AngularElementData({
          path: "ng-zorro-antd/dropdown",
          name: "NzDropdownButtonDirective",
          type: "directive",
          originalSelector: "[nz-button][nz-dropdown]",
          selectors: ["[nz-button][nz-dropdown]", "nz-button", "[nz-button]", "nz-dropdown", "[nz-dropdown]"],
          isStandalone: true,
          isExternal: true,
        }),
      ],
    ],
  ]);

  const mockIndexer = {
    getElements: (selector: string) => indexEntries.get(selector) || [],
  };

  const mockExtensionContext = {
    subscriptions: [],
    workspaceState: {
      get: () => undefined,
      update: async () => undefined,
      keys: () => [],
    },
    globalState: {
      get: () => undefined,
      update: async () => undefined,
      keys: () => [],
      setKeysForSync: () => undefined,
    },
    extensionPath: "",
    extensionUri: vscode.Uri.file(""),
    environmentVariableCollection: {} as any,
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

  before(async () => {
    const compiler = await import("@angular/compiler");
    cssSelectorCtor = compiler.CssSelector;
    selectorMatcherCtor = compiler.SelectorMatcher;
  });

  beforeEach(() => {
    importedNames = new Set<string>();

    provider = new DiagnosticProvider({
      projectIndexers: new Map([[testProjectPath, mockIndexer as any]]),
      projectTsConfigs: new Map([[testProjectPath, null]]),
      extensionConfig: {
        projectPath: null,
        indexRefreshInterval: 60,
        completion: {
          pipes: true,
          components: true,
          directives: true,
        },
        diagnosticsMode: "full",
        diagnosticsSeverity: "warning" as const,
        logging: {
          enabled: false,
          level: "INFO",
          fileLoggingEnabled: false,
          logDirectory: null,
          rotationMaxSize: 5,
          rotationMaxFiles: 5,
          outputFormat: "plain",
        },
      },
      extensionContext: mockExtensionContext,
    });

    const project = new Project({ useInMemoryFileSystem: true });
    sourceFile = project.createSourceFile(
      path.join(testProjectPath, "src/app/playground.component.ts"),
      "export class PlaygroundComponent {}",
      { overwrite: true }
    );

    (provider as any).isElementImported = (_sourceFile: import("ts-morph").SourceFile, element: AngularElementData) =>
      importedNames.has(element.name);
  });

  afterEach(() => {
    provider.deactivate();
  });

  it("should suppress auxiliary diagnostics for nz-button when NzButtonComponent is already imported", async () => {
    importedNames = new Set(["NzButtonComponent"]);

    const element = createElement("nz-button", "button", [
      { name: "nz-button", value: "" },
      { name: "nzType", value: "primary" },
    ]);

    const diagnostics = await (provider as any).checkElement(
      element,
      mockIndexer,
      vscode.DiagnosticSeverity.Warning,
      sourceFile,
      cssSelectorCtor,
      selectorMatcherCtor
    );

    assert.deepStrictEqual(diagnostics, [], "nz-button should not report a missing NzWaveDirective diagnostic");
  });

  it("should keep diagnostics for compound selectors like NzDropdownButtonDirective", async () => {
    importedNames = new Set(["NzButtonComponent", "NzDropDownDirective"]);

    const element = createElement("nz-dropdown", "button", [
      { name: "nz-button", value: "" },
      { name: "nz-dropdown", value: "" },
    ]);

    const diagnostics = await (provider as any).checkElement(
      element,
      mockIndexer,
      vscode.DiagnosticSeverity.Warning,
      sourceFile,
      cssSelectorCtor,
      selectorMatcherCtor
    );

    assert.strictEqual(diagnostics.length, 1, "compound directive should still produce one diagnostic");
    assert.strictEqual(
      diagnostics[0].code,
      "missing-directive-import:[nz-button][nz-dropdown]",
      "compound directive diagnostic should remain visible"
    );
  });

  it("refreshOpenDocuments clears the import resolution cache", async () => {
    // Simulate a previously cached (stale) "not imported" result, e.g. captured
    // before a library was indexed. After the external index is rebuilt this
    // must be dropped so the refreshed resolution is used.
    const cache = (provider as any).importedElementsCache as Map<string, Map<string, boolean>>;
    cache.set(path.join(testProjectPath, "src/app/foo.component.ts"), new Map([["TranslatePipe", false]]));
    assert.ok(cache.size > 0, "precondition: import cache populated");

    await provider.refreshOpenDocuments();

    assert.strictEqual(cache.size, 0, "import cache should be cleared after refreshOpenDocuments");
  });
});

function createElement(
  name: string,
  tagName: string,
  attributes: Array<{ name: string; value: string }>
): {
  type: "attribute";
  name: string;
  isAttribute: true;
  range: vscode.Range;
  tagName: string;
  attributes: Array<{ name: string; value: string }>;
} {
  return {
    type: "attribute",
    name,
    isAttribute: true,
    range: new vscode.Range(0, 0, 0, name.length),
    tagName,
    attributes,
  };
}
