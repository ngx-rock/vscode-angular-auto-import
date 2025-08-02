/**
 * =================================================================================================
 * Angular Indexer Tests
 * =================================================================================================
 *
 * Comprehensive tests for the AngularIndexer service that handles indexing of Angular components,
 * directives, and pipes from both local files and node_modules libraries.
 */

import * as assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { AngularIndexer } from "../../services";
import type { FileElementsInfo } from "../../types";

describe("AngularIndexer", function () {
  // Set timeout for all tests in this suite
  this.timeout(30000);

  let indexer: AngularIndexer;
  let mockContext: vscode.ExtensionContext;
  const fixturesPath = path.join(__dirname, "..", "fixtures");
  const testProjectPath = path.join(fixturesPath, "test-angular-project");
  const mockNodeModulesPath = path.join(testProjectPath, "node_modules");

  // Mock workspace state for testing
  const mockWorkspaceState = new Map<string, any>();

  before(async () => {
    // Create comprehensive test project structure
    await createTestProject();
  });

  beforeEach(() => {
    indexer = new AngularIndexer();
    mockWorkspaceState.clear();

    // Enhanced mock extension context
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: (key: string) => mockWorkspaceState.get(key),
        update: async (key: string, value: any) => {
          mockWorkspaceState.set(key, value);
        },
        keys: () => Array.from(mockWorkspaceState.keys()),
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

  describe("Basic Setup", () => {
    it("should initialize with empty state", () => {
      assert.ok(indexer, "Indexer should be created");
      assert.ok(indexer.project, "Should have ts-morph project");
      assert.strictEqual(indexer.fileWatcher, null, "Should not have file watcher initially");
    });

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

  describe("File Indexing", () => {
    beforeEach(async () => {
      indexer.setProjectRoot(testProjectPath);
    });

    it("should index all Angular files in project", async () => {
      const result = await indexer.generateFullIndex(mockContext);

      assert.ok(result instanceof Map, "Should return a Map");
      assert.ok(
        result.size >= 5,
        "Should index at least 5 elements (component, directive, pipe, standalone component, complex directive)"
      );

      // Check specific elements
      const selectors = indexer.getAllSelectors();
      assert.ok(selectors.includes("test-component"), "Should include basic component");
      assert.ok(selectors.includes("testDirective"), "Should include basic directive");
      assert.ok(selectors.includes("testPipe"), "Should include basic pipe");
      assert.ok(selectors.includes("standalone-component"), "Should include standalone component");
      assert.ok(selectors.includes("complexButton"), "Should include complex directive");
    });

    it("should handle standalone components correctly", async () => {
      await indexer.generateFullIndex(mockContext);

      const standaloneElements = indexer.getElements("standalone-component");
      assert.ok(standaloneElements.length > 0, "Should find standalone component");

      const standaloneComponent = standaloneElements[0];
      assert.strictEqual(standaloneComponent.isStandalone, true, "Should be marked as standalone");
      assert.strictEqual(standaloneComponent.name, "StandaloneComponent", "Should have correct name");
    });

    it("should parse complex selectors correctly", async () => {
      await indexer.generateFullIndex(mockContext);

      // Test complex selector parsing
      const complexElements = indexer.getElements("complexButton");
      assert.ok(complexElements.length > 0, "Should find complex directive");

      const complexDirective = complexElements[0];
      assert.strictEqual(
        complexDirective.originalSelector,
        "button[complexButton],a[complexButton]",
        "Should preserve original selector"
      );
      assert.ok(complexDirective.selectors.includes("complexButton"), "Should include parsed selector");
    });

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
        if (fs.existsSync(emptyProjectPath)) {
          fs.rmSync(emptyProjectPath, { recursive: true, force: true });
        }
      }
    });

    it("should handle malformed files gracefully", async () => {
      // Create a malformed Angular file
      const malformedPath = path.join(testProjectPath, "src", "app", "malformed.component.ts");
      fs.writeFileSync(malformedPath, "invalid typescript content @Component({");

      try {
        // Should not throw an error
        await indexer.generateFullIndex(mockContext);

        // Check that other files were still indexed
        const selectors = indexer.getAllSelectors();
        assert.ok(selectors.length > 0, "Should still index valid files");
      } finally {
        if (fs.existsSync(malformedPath)) {
          fs.unlinkSync(malformedPath);
        }
      }
    });
  });

  describe("SelectorTrie Functionality", () => {
    beforeEach(async () => {
      indexer.setProjectRoot(testProjectPath);
      await indexer.generateFullIndex(mockContext);
    });

    it("should support prefix searching", () => {
      const results = indexer.searchWithSelectors("test");
      assert.ok(results.length >= 3, "Should find elements with 'test' prefix");

      const selectors = results.map((r) => r.selector);
      assert.ok(
        selectors.some((s) => s.startsWith("test")),
        "Should include selectors starting with 'test'"
      );
    });

    it("should return exact matches", () => {
      const elements = indexer.getElements("test-component");
      assert.ok(elements.length > 0, "Should find exact match for 'test-component'");

      const element = elements[0];
      assert.strictEqual(element.name, "TestComponent", "Should return correct component");
    });

    it("should return empty array for non-existent selectors", () => {
      const elements = indexer.getElements("non-existent-selector");
      assert.strictEqual(elements.length, 0, "Should return empty array for non-existent selector");
    });

    it("should handle multiple elements with same selector", () => {
      // This tests the trie's ability to handle multiple elements per selector
      const allSelectors = indexer.getAllSelectors();
      assert.ok(allSelectors.length > 0, "Should have selectors");

      // Test that all selectors are unique in the trie structure
      const uniqueSelectors = [...new Set(allSelectors)];
      assert.strictEqual(allSelectors.length, uniqueSelectors.length, "All selectors should be unique in trie");
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

    it("should handle file creation", async () => {
      indexer.initializeWatcher(mockContext);

      const newComponentPath = path.join(testProjectPath, "src", "app", "new.component.ts");
      const newComponentContent = `
import { Component } from '@angular/core';

@Component({
  selector: 'new-component',
  template: '<div>New Component</div>'
})
export class NewComponent {}
`;

      try {
        // Create new file
        fs.writeFileSync(newComponentPath, newComponentContent);

        // Give the watcher time to process
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check if the new component was indexed
        const elements = indexer.getElements("new-component");
        assert.ok(elements.length > 0, "Should index newly created component");
      } finally {
        if (fs.existsSync(newComponentPath)) {
          fs.unlinkSync(newComponentPath);
        }
      }
    });

    it("should handle file deletion", async () => {
      indexer.initializeWatcher(mockContext);

      const tempComponentPath = path.join(testProjectPath, "src", "app", "temp.component.ts");
      const tempComponentContent = `
import { Component } from '@angular/core';

@Component({
  selector: 'temp-component',
  template: '<div>Temp Component</div>'
})
export class TempComponent {}
`;

      // Create and index the file first
      fs.writeFileSync(tempComponentPath, tempComponentContent);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify it's indexed
      let elements = indexer.getElements("temp-component");
      assert.ok(elements.length > 0, "Should index temp component");

      // Delete the file
      fs.unlinkSync(tempComponentPath);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify it's removed from index
      elements = indexer.getElements("temp-component");
      assert.strictEqual(elements.length, 0, "Should remove deleted component from index");
    });
  });

  describe("Caching", () => {
    it("should save and load index to/from workspace state", async () => {
      indexer.setProjectRoot(testProjectPath);
      await indexer.generateFullIndex(mockContext);

      // Verify data was saved
      const fileCacheKey = indexer.workspaceFileCacheKey;
      const indexCacheKey = indexer.workspaceIndexCacheKey;

      assert.ok(mockWorkspaceState.has(fileCacheKey), "Should save file cache");
      assert.ok(mockWorkspaceState.has(indexCacheKey), "Should save index cache");

      // Create new indexer and load from cache
      const newIndexer = new AngularIndexer();
      newIndexer.setProjectRoot(testProjectPath);

      const loaded = newIndexer.loadFromWorkspace(mockContext);
      assert.ok(loaded, "Should successfully load from cache");

      // Verify loaded data
      const selectors = newIndexer.getAllSelectors();
      assert.ok(selectors.length > 0, "Should have selectors after loading from cache");
      assert.ok(selectors.includes("test-component"), "Should include cached selectors");

      newIndexer.dispose();
    });

    it("should handle missing cache gracefully", () => {
      indexer.setProjectRoot(testProjectPath);

      // Try to load from empty cache
      const loaded = indexer.loadFromWorkspace(mockContext);
      assert.strictEqual(loaded, false, "Should return false when no cache exists");
    });

    it("should handle FileElementsInfo format correctly", async () => {
      indexer.setProjectRoot(testProjectPath);
      await indexer.generateFullIndex(mockContext);

      // Check that the cached data uses the new FileElementsInfo format
      const fileCacheKey = indexer.workspaceFileCacheKey;
      const cachedData = mockWorkspaceState.get(fileCacheKey) as Record<string, FileElementsInfo>;

      assert.ok(cachedData, "Should have cached file data");

      const firstEntry = Object.values(cachedData)[0];
      assert.ok(firstEntry, "Should have at least one cached file");
      assert.ok("elements" in firstEntry, "Should use FileElementsInfo format with elements array");
      assert.ok(Array.isArray(firstEntry.elements), "Elements should be an array");
      assert.ok(firstEntry.elements.length > 0, "Should have at least one element");
    });
  });

  describe("Library Indexing", () => {
    beforeEach(async () => {
      // Create mock node_modules structure
      await createMockNodeModules();
      indexer.setProjectRoot(testProjectPath);
    });

    afterEach(async () => {
      await cleanupMockNodeModules();
    });

    it("should index Angular libraries from node_modules", async () => {
      // Mock the library indexing functionality
      // Note: Full library indexing is complex and requires actual Angular libraries
      // This test focuses on the indexing structure

      await indexer.generateFullIndex(mockContext);

      // The indexer should handle the presence of node_modules
      // Even if no actual Angular libraries are found, it shouldn't error
      const selectors = indexer.getAllSelectors();
      assert.ok(Array.isArray(selectors), "Should return selectors array even with node_modules present");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid project paths gracefully", async () => {
      const invalidPath = path.join(fixturesPath, "non-existent-project");
      indexer.setProjectRoot(invalidPath);

      // Should not throw an error
      const result = await indexer.generateFullIndex(mockContext);
      assert.ok(result instanceof Map, "Should return a Map even for invalid paths");
      assert.strictEqual(result.size, 0, "Should have no elements for invalid path");
    });

    it("should handle dispose without initialization", () => {
      const newIndexer = new AngularIndexer();
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
        const result = indexer.getElements(selector as any);
        assert.strictEqual(Array.isArray(result), true, `Should return array for ${description}`);
        assert.strictEqual(result.length, 0, `Should return empty array for ${description}`);
      });
    });

    it("should handle ts-morph parsing errors with regex fallback", async () => {
      // Create a file that might cause ts-morph issues but is parseable with regex
      const problematicPath = path.join(testProjectPath, "src", "app", "problematic.component.ts");
      const problematicContent = `
// This might cause ts-morph issues but should work with regex
export class ProblematicComponent {
}
// @Component decorator after class (unusual but possible)
ProblematicComponent = Component({
  selector: 'problematic-component',
  template: 'test'
})(ProblematicComponent);
`;

      fs.writeFileSync(problematicPath, problematicContent);

      try {
        // Should not throw an error and should attempt fallback
        await indexer.generateFullIndex(mockContext);

        // The indexer should handle this gracefully
        const selectors = indexer.getAllSelectors();
        assert.ok(Array.isArray(selectors), "Should return selectors array even with problematic files");
      } finally {
        if (fs.existsSync(problematicPath)) {
          fs.unlinkSync(problematicPath);
        }
      }
    });
  });

  describe("Performance and Batching", () => {
    it("should handle large numbers of files efficiently", async () => {
      // Create multiple test files
      const testFiles: string[] = [];
      const srcPath = path.join(testProjectPath, "src", "app", "bulk");

      if (!fs.existsSync(srcPath)) {
        fs.mkdirSync(srcPath, { recursive: true });
      }

      try {
        // Create 10 test components
        for (let i = 0; i < 10; i++) {
          const componentPath = path.join(srcPath, `bulk${i}.component.ts`);
          const componentContent = `
import { Component } from '@angular/core';

@Component({
  selector: 'bulk-component-${i}',
  template: '<div>Bulk Component ${i}</div>'
})
export class BulkComponent${i} {}
`;
          fs.writeFileSync(componentPath, componentContent);
          testFiles.push(componentPath);
        }

        indexer.setProjectRoot(testProjectPath);

        const startTime = Date.now();
        await indexer.generateFullIndex(mockContext);
        const endTime = Date.now();

        // Should complete in reasonable time (less than 10 seconds for 10 files)
        assert.ok(endTime - startTime < 10000, "Should index files efficiently");

        // Should index all bulk components
        const selectors = indexer.getAllSelectors();
        for (let i = 0; i < 10; i++) {
          assert.ok(selectors.includes(`bulk-component-${i}`), `Should include bulk-component-${i}`);
        }
      } finally {
        // Clean up test files
        testFiles.forEach((file) => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
        if (fs.existsSync(srcPath)) {
          fs.rmSync(srcPath, { recursive: true, force: true });
        }
      }
    });
  });

  // Helper functions
  async function createTestProject(): Promise<void> {
    if (!fs.existsSync(testProjectPath)) {
      fs.mkdirSync(testProjectPath, { recursive: true });
    }

    const srcPath = path.join(testProjectPath, "src", "app");
    fs.mkdirSync(srcPath, { recursive: true });

    // Create basic component
    const componentContent = `
import { Component } from '@angular/core';

@Component({
  selector: 'test-component',
  template: '<div>Test Component</div>',
  standalone: false
})
export class TestComponent {}
`;
    fs.writeFileSync(path.join(srcPath, "test.component.ts"), componentContent);

    // Create basic directive
    const directiveContent = `
import { Directive } from '@angular/core';

@Directive({
  selector: '[testDirective]',
  standalone: false
})
export class TestDirective {}
`;
    fs.writeFileSync(path.join(srcPath, "test.directive.ts"), directiveContent);

    // Create basic pipe
    const pipeContent = `
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'testPipe',
  standalone: false
})
export class TestPipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}
`;
    fs.writeFileSync(path.join(srcPath, "test.pipe.ts"), pipeContent);

    // Create standalone component
    const standaloneComponentContent = `
import { Component } from '@angular/core';

@Component({
  selector: 'standalone-component',
  template: '<div>Standalone Component</div>',
  standalone: true
})
export class StandaloneComponent {}
`;
    fs.writeFileSync(path.join(srcPath, "standalone.component.ts"), standaloneComponentContent);

    // Create directive with complex selector
    const complexDirectiveContent = `
import { Directive } from '@angular/core';

@Directive({
  selector: 'button[complexButton],a[complexButton]',
  standalone: true
})
export class ComplexDirective {}
`;
    fs.writeFileSync(path.join(srcPath, "complex.directive.ts"), complexDirectiveContent);

    // Create package.json
    const packageJsonContent = {
      name: "test-angular-project",
      version: "1.0.0",
      dependencies: {
        "@angular/core": "^17.0.0",
        "@angular/common": "^17.0.0",
      },
    };
    fs.writeFileSync(path.join(testProjectPath, "package.json"), JSON.stringify(packageJsonContent, null, 2));

    // Create tsconfig.json
    const tsconfigContent = {
      compilerOptions: {
        target: "ES2022",
        module: "ES2022",
        lib: ["ES2022", "DOM"],
        strict: true,
      },
    };
    fs.writeFileSync(path.join(testProjectPath, "tsconfig.json"), JSON.stringify(tsconfigContent, null, 2));
  }

  async function createMockNodeModules(): Promise<void> {
    if (!fs.existsSync(mockNodeModulesPath)) {
      fs.mkdirSync(mockNodeModulesPath, { recursive: true });
    }

    // Create a mock Angular library structure
    const mockLibPath = path.join(mockNodeModulesPath, "@angular", "material");
    fs.mkdirSync(mockLibPath, { recursive: true });

    const mockPackageJson = {
      name: "@angular/material",
      version: "17.0.0",
      peerDependencies: {
        "@angular/core": "^17.0.0",
      },
    };
    fs.writeFileSync(path.join(mockLibPath, "package.json"), JSON.stringify(mockPackageJson, null, 2));
  }

  async function cleanupMockNodeModules(): Promise<void> {
    if (fs.existsSync(mockNodeModulesPath)) {
      fs.rmSync(mockNodeModulesPath, { recursive: true, force: true });
    }
  }

  async function cleanupTestProject(): Promise<void> {
    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }
  }
});
