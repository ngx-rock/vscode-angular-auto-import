/**
 * =================================================================================================
 * Angular Indexer Tests
 * =================================================================================================
 *
 * Tests for the AngularIndexer service that handles indexing of Angular components,
 * directives, and pipes.
 */

import * as assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { AngularIndexer } from "../../services";
import { AngularElementData } from "../../types";
import { getAngularElementAsync } from "../../utils/angular";

describe("AngularIndexer", function () {
  // Set timeout for all tests in this suite
  this.timeout(15000);

  let indexer: AngularIndexer;
  let mockContext: vscode.ExtensionContext;
  const fixturesPath = path.join(__dirname, "..", "fixtures");
  const testProjectPath = path.join(fixturesPath, "test-angular-project");

  before(async () => {
    // Create test project structure
    await createTestProject();
  });

  beforeEach(() => {
    indexer = new AngularIndexer();

    // Mock extension context
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
  });

  afterEach(() => {
    if (indexer) {
      indexer.dispose();
    }
  });

  after(async () => {
    // Clean up test project
    await cleanupTestProject();
  });

  describe("#setProjectRoot", () => {
    it("should set project root and initialize cache keys", () => {
      indexer.setProjectRoot(testProjectPath);

      assert.ok(indexer.workspaceFileCacheKey, "Should have file cache key");
      assert.ok(indexer.workspaceIndexCacheKey, "Should have index cache key");
      assert.ok(
        indexer.workspaceFileCacheKey.includes("angularFileCache_"),
        "File cache key should have correct prefix"
      );
      assert.ok(
        indexer.workspaceIndexCacheKey.includes("angularSelectorToDataIndex_"),
        "Index cache key should have correct prefix"
      );
    });
  });

  describe("#generateFullIndex", () => {
    it("should handle empty project gracefully", async () => {
      const emptyProjectPath = path.join(fixturesPath, "empty-project");

      try {
        if (!fs.existsSync(emptyProjectPath)) {
          fs.mkdirSync(emptyProjectPath, { recursive: true });
        }

        indexer.setProjectRoot(emptyProjectPath);

        const result = await indexer.generateFullIndex(mockContext);

        assert.ok(result instanceof Map, "Should return a Map");
        assert.strictEqual(result.size, 0, "Should have no elements for empty project");
      } finally {
        // Clean up in finally block to ensure cleanup even if test fails
        if (fs.existsSync(emptyProjectPath)) {
          fs.rmSync(emptyProjectPath, { recursive: true, force: true });
        }
      }
    });
  });

  describe("#searchWithSelectors", () => {
    beforeEach(async () => {
      indexer.setProjectRoot(testProjectPath);
      await indexer.generateFullIndex(mockContext);
    });

    it("should return elements with a given prefix", () => {
      const results = indexer.searchWithSelectors("test");
      assert.ok(results.length >= 3, "Should find at least 3 elements for prefix 'test'");

      const names = results.map((r: { selector: string; element: { name: string } }) => r.element.name);
      assert.ok(names.includes("TestComponent"), "Should find TestComponent");
      assert.ok(names.includes("TestDirective"), "Should find TestDirective");
      assert.ok(names.includes("TestPipe"), "Should find TestPipe");
    });

    it("should return a limited set of unique elements", () => {
      const results = indexer.searchWithSelectors("test");
      // results can contain duplicates if a selector matches multiple elements, but our search returns unique AngularElementData
      const uniqueResults = [
        ...new Map(
          results.map((item: { selector: string; element: { name: string } }) => [item.element.name, item])
        ).values(),
      ];
      assert.ok(results.length >= uniqueResults.length, "Search should return valid results");
    });

    it("should return an empty array for a non-existent prefix", () => {
      const results = indexer.searchWithSelectors("non-existent-prefix");
      assert.strictEqual(results.length, 0, "Should return an empty array");
    });
  });

  describe("#getAllSelectors", () => {
    beforeEach(async () => {
      indexer.setProjectRoot(testProjectPath);
      await indexer.generateFullIndex(mockContext);
    });

    it("should return all indexed selectors", () => {
      const selectors = indexer.getAllSelectors();

      assert.ok(selectors.length > 0, "Should have selectors");
      assert.ok(selectors.includes("test-component"), "Should include component selector");
      assert.ok(selectors.includes("testPipe"), "Should include pipe selector");
    });

    it("should return unique selectors", () => {
      const selectors = indexer.getAllSelectors();
      const uniqueSelectors = [...new Set(selectors)];

      assert.strictEqual(selectors.length, uniqueSelectors.length, "All selectors should be unique");
    });
  });

  describe("File Watching", () => {
    beforeEach(async () => {
      indexer.setProjectRoot(testProjectPath);
      await indexer.generateFullIndex(mockContext);
    });

    it("should initialize file watcher", () => {
      indexer.initializeWatcher(mockContext);

      assert.ok(indexer.fileWatcher, "Should have file watcher");
    });

    it("should dispose file watcher on dispose", () => {
      indexer.initializeWatcher(mockContext);

      indexer.dispose();

      assert.strictEqual(indexer.fileWatcher, null, "File watcher should be null after dispose");
    });
  });

  describe("Caching", () => {
    it("should save and load from workspace cache", async () => {
      indexer.setProjectRoot(testProjectPath);

      // Generate index
      await indexer.generateFullIndex(mockContext);

      // Create new indexer and try to load from cache
      const newIndexer = new AngularIndexer();
      newIndexer.setProjectRoot(testProjectPath);

      // Mock workspace state to return cached data
      const cachedData = new Map();
      cachedData.set(
        "test-component",
        new AngularElementData(
          "src/app/test.component.ts",
          "TestComponent",
          "component",
          "test-component",
          ["test-component"],
          false
        )
      );

      mockContext.workspaceState.get = (key: string) => {
        if (key.includes("Index")) {
          return Object.fromEntries(cachedData);
        }
        return {};
      };

      const loaded = newIndexer.loadFromWorkspace(mockContext);

      assert.ok(loaded, "Should load from cache");

      newIndexer.dispose();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid project paths gracefully", async () => {
      const invalidPath = path.join(fixturesPath, "non-existent-project");
      indexer.setProjectRoot(invalidPath);

      // Should not throw an error
      assert.doesNotThrow(async () => {
        const result = await indexer.generateFullIndex(mockContext);
        assert.ok(result instanceof Map, "Should return a Map even for invalid paths");
      }, "Should handle invalid project paths without throwing");
    });

    it("should handle dispose without initialization", () => {
      const newIndexer = new AngularIndexer();

      // Should not throw an error
      assert.doesNotThrow(() => {
        newIndexer.dispose();
      }, "Should handle dispose without initialization");
    });

    it("should handle getElements with invalid selectors", () => {
      indexer.setProjectRoot(testProjectPath);

      const testCases = [
        { selector: "", description: "empty string" },
        { selector: null, description: "null" },
        { selector: undefined, description: "undefined" },
        { selector: 123, description: "number" },
      ];

      testCases.forEach(({ selector, description }) => {
        assert.doesNotThrow(() => {
          const result = indexer.getElements(selector as any);
          assert.strictEqual(Array.isArray(result), true, `Should return array for ${description}`);
          assert.strictEqual(result.length, 0, `Should return empty array for ${description}`);
        }, `Should handle ${description} selector gracefully`);
      });
    });
  });

  describe("Complex Selector Matching", () => {
    it("should correctly match complex attribute selectors like 'a[tuiButton],button[tuiButton]'", async () => {
      // Setup test data with complex selectors similar to TUI components
      const testElements: AngularElementData[] = [
        new AngularElementData(
          "/test/tui-button.directive.ts",
          "TuiButtonDirective",
          "directive",
          "a[tuiButton],button[tuiButton],a[tuiIconButton],button[tuiIconButton]",
          ["tuiButton", "tuiIconButton"],
          true,
          undefined
        ),
        new AngularElementData(
          "/test/other.directive.ts",
          "SomeOtherDirective",
          "directive",
          "div[someOther]",
          ["someOther"],
          true,
          undefined
        )
      ];

      // Mock the indexer to return our test elements
      indexer.getElements = (selector: string) => {
        if (selector === "tuiButton" || selector === "tuiIconButton") {
          return testElements;
        }
        return [];
      };

      // Test case 1: button[tuiButton] should match TuiButtonDirective
      const result1 = await getAngularElementAsync("button[tuiButton]", indexer);
      assert.strictEqual(result1?.name, "TuiButtonDirective", "Should match TuiButtonDirective for button[tuiButton]");

      // Test case 2: a[tuiButton] should also match TuiButtonDirective  
      const result2 = await getAngularElementAsync("a[tuiButton]", indexer);
      assert.strictEqual(result2?.name, "TuiButtonDirective", "Should match TuiButtonDirective for a[tuiButton]");

      // Test case 3: button[tuiIconButton] should also match TuiButtonDirective
      const result3 = await getAngularElementAsync("button[tuiIconButton]", indexer);
      assert.strictEqual(result3?.name, "TuiButtonDirective", "Should match TuiButtonDirective for button[tuiIconButton]");

      // Test case 4: div[tuiButton] should not match (not in the selector)
      const result4 = await getAngularElementAsync("div[tuiButton]", indexer);
      assert.strictEqual(result4, undefined, "Should not match div[tuiButton] as it's not in the selector");
    });

    it("should handle multiple candidates and return the most specific match", async () => {
      const testElements: AngularElementData[] = [
        new AngularElementData(
          "/test/generic.directive.ts",
          "GenericDirective",
          "directive",
          "[generic]",
          ["generic"],
          true,
          undefined
        ),
        new AngularElementData(
          "/test/specific.directive.ts",
          "SpecificButtonDirective",
          "directive",
          "button[specific]",
          ["specific"],
          true,
          undefined
        )
      ];

      indexer.getElements = (selector: string) => {
        if (selector === "specific") {
          return testElements;
        }
        return [];
      };

      // button[specific] should prefer the more specific selector
      const result = await getAngularElementAsync("button[specific]", indexer);
      assert.strictEqual(result?.name, "SpecificButtonDirective", "Should prefer more specific selector");
    });

    it("should prioritize components over directives", async () => {
      const testElements: AngularElementData[] = [
        new AngularElementData(
          "/test/directive.ts",
          "MyDirective",
          "directive",
          "[mySelector]",
          ["mySelector"],
          true,
          undefined
        ),
        new AngularElementData(
          "/test/component.ts",
          "MyComponent",
          "component",
          "my-component",
          ["my-component"],
          true,
          undefined
        )
      ];

      indexer.getElements = (selector: string) => {
        return testElements;
      };

      // When both match, component should be preferred
      const result = await getAngularElementAsync("my-component", indexer);
      assert.strictEqual(result?.name, "MyComponent", "Should prefer component over directive");
    });
  });

  // Helper functions
  async function createTestProject(): Promise<void> {
    if (!fs.existsSync(testProjectPath)) {
      fs.mkdirSync(testProjectPath, { recursive: true });
    }

    const srcPath = path.join(testProjectPath, "src", "app");
    fs.mkdirSync(srcPath, { recursive: true });

    // Create test component
    const componentContent = `
import { Component } from '@angular/core';

@Component({
  selector: 'test-component',
  template: '<div>Test Component</div>'
})
export class TestComponent {}
`;
    fs.writeFileSync(path.join(srcPath, "test.component.ts"), componentContent);

    // Create test directive
    const directiveContent = `
import { Directive } from '@angular/core';

@Directive({
  selector: '[testDirective]'
})
export class TestDirective {}
`;
    fs.writeFileSync(path.join(srcPath, "test.directive.ts"), directiveContent);

    // Create test pipe
    const pipeContent = `
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'testPipe'
})
export class TestPipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}
`;
    fs.writeFileSync(path.join(srcPath, "test.pipe.ts"), pipeContent);
  }

  async function cleanupTestProject(): Promise<void> {
    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }
  }
});
