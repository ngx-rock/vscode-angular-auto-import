/**
 * =================================================================================================
 * Utility Functions Tests
 * =================================================================================================
 *
 * Tests for utility functions used throughout the extension.
 */

import * as assert from "assert";
import * as path from "path";
import {
  extractAngularElementInfo,
  generateImportStatement,
  isAngularFile,
  normalizeSelector,
  resolveRelativePath,
} from "../../utils";

describe("Utility Functions", function () {
  // Set timeout for all tests in this suite
  this.timeout(5000);

  describe("extractAngularElementInfo", function () {
    it("should extract component information correctly", function () {
      const componentCode = `
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent {
  constructor() {}
}
`;

      const result = extractAngularElementInfo(
        componentCode,
        "/src/app/test.component.ts"
      );

      assert.ok(result, "Should extract component info");
      assert.strictEqual(
        result.name,
        "TestComponent",
        "Should extract correct class name"
      );
      assert.strictEqual(
        result.type,
        "component",
        "Should identify as component"
      );
      assert.strictEqual(
        result.selector,
        "app-test",
        "Should extract correct selector"
      );
      assert.ok(Array.isArray(result.selectors), "Should have selectors array");
      assert.ok(
        result.selectors.includes("app-test"),
        "Should include component selector in array"
      );
    });

    it("should extract directive information correctly", function () {
      const directiveCode = `
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  @Input() appHighlight: string = '';
}
`;

      const result = extractAngularElementInfo(
        directiveCode,
        "/src/app/highlight.directive.ts"
      );

      assert.ok(result, "Should extract directive info");
      assert.strictEqual(
        result.name,
        "HighlightDirective",
        "Should extract correct class name"
      );
      assert.strictEqual(
        result.type,
        "directive",
        "Should identify as directive"
      );
      assert.strictEqual(
        result.selector,
        "[appHighlight]",
        "Should extract correct selector"
      );
    });

    it("should extract pipe information correctly", function () {
      const pipeCode = `
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
`;

      const result = extractAngularElementInfo(
        pipeCode,
        "/src/app/capitalize.pipe.ts"
      );

      assert.ok(result, "Should extract pipe info");
      assert.strictEqual(
        result.name,
        "CapitalizePipe",
        "Should extract correct class name"
      );
      assert.strictEqual(result.type, "pipe", "Should identify as pipe");
      assert.strictEqual(
        result.selector,
        "capitalize",
        "Should extract correct pipe name"
      );
    });

    it("should handle multiple selectors for directives", function () {
      const directiveCode = `
@Directive({
  selector: 'button[appButton], a[appButton], [appButton]'
})
export class ButtonDirective {}
`;

      const result = extractAngularElementInfo(
        directiveCode,
        "/src/app/button.directive.ts"
      );

      assert.ok(result, "Should extract directive info");
      assert.strictEqual(
        result.type,
        "directive",
        "Should identify as directive"
      );
      assert.ok(Array.isArray(result.selectors), "Should have selectors array");
      assert.ok(result.selectors.length > 1, "Should have multiple selectors");
      assert.ok(
        result.selectors.some((s: string) => s.includes("button[appButton]")),
        "Should include button selector"
      );
      assert.ok(
        result.selectors.some((s: string) => s.includes("[appButton]")),
        "Should include attribute selector"
      );
    });

    it("should return null for non-Angular files", function () {
      const regularCode = `
export class RegularClass {
  constructor() {}
}
`;

      const result = extractAngularElementInfo(
        regularCode,
        "/src/app/regular.ts"
      );

      assert.strictEqual(
        result,
        null,
        "Should return null for non-Angular files"
      );
    });

    it("should handle malformed decorators gracefully", function () {
      const malformedCode = `
@Component({
  selector: 'app-test'
  // missing closing brace
export class TestComponent {}
`;

      // Should not throw an error
      assert.doesNotThrow(() => {
        const result = extractAngularElementInfo(
          malformedCode,
          "/src/app/test.component.ts"
        );

        // Should either return null or handle gracefully
        assert.ok(
          result === null || typeof result === "object",
          "Should handle malformed code gracefully"
        );
      }, "Should not throw error for malformed code");
    });

    it("should handle null and undefined inputs", function () {
      assert.strictEqual(
        extractAngularElementInfo(null as any, "/test.ts"),
        null,
        "Should handle null code"
      );
      assert.strictEqual(
        extractAngularElementInfo("test", null as any),
        null,
        "Should handle null file path"
      );
      assert.strictEqual(
        extractAngularElementInfo(undefined as any, "/test.ts"),
        null,
        "Should handle undefined code"
      );
    });
  });

  describe("isAngularFile", function () {
    const testCases = [
      // Component files
      {
        path: "/src/app/test.component.ts",
        expected: true,
        description: "component files",
      },
      {
        path: "/src/app/nested/my-component.component.ts",
        expected: true,
        description: "nested component files",
      },

      // Directive files
      {
        path: "/src/app/highlight.directive.ts",
        expected: true,
        description: "directive files",
      },
      {
        path: "/src/shared/directives/tooltip.directive.ts",
        expected: true,
        description: "nested directive files",
      },

      // Pipe files
      {
        path: "/src/app/capitalize.pipe.ts",
        expected: true,
        description: "pipe files",
      },
      {
        path: "/src/shared/pipes/currency.pipe.ts",
        expected: true,
        description: "nested pipe files",
      },

      // Non-Angular files
      {
        path: "/src/app/service.ts",
        expected: false,
        description: "service files",
      },
      {
        path: "/src/app/model.ts",
        expected: false,
        description: "model files",
      },
      {
        path: "/src/app/utils.ts",
        expected: false,
        description: "utility files",
      },
      {
        path: "/src/app/test.spec.ts",
        expected: false,
        description: "test files",
      },

      // Different extensions
      {
        path: "/src/app/test.component.js",
        expected: false,
        description: "JS files",
      },
      {
        path: "/src/app/test.component.html",
        expected: false,
        description: "HTML files",
      },
      {
        path: "/src/app/test.component.css",
        expected: false,
        description: "CSS files",
      },
    ];

    testCases.forEach(({ path, expected, description }) => {
      it(`should ${
        expected ? "identify" : "reject"
      } ${description}`, function () {
        assert.strictEqual(
          isAngularFile(path),
          expected,
          `Should ${expected ? "identify" : "reject"} ${description}`
        );
      });
    });

    it("should handle null and undefined inputs", function () {
      assert.strictEqual(
        isAngularFile(null as any),
        false,
        "Should handle null file path"
      );
      assert.strictEqual(
        isAngularFile(undefined as any),
        false,
        "Should handle undefined file path"
      );
    });
  });

  describe("normalizeSelector", function () {
    const testCases = [
      {
        input: "app-test",
        description: "component selectors",
        expectedToInclude: ["app-test"],
      },
      {
        input: "[appHighlight]",
        description: "directive selectors",
        expectedToInclude: ["[appHighlight]", "appHighlight"],
      },
      {
        input: "capitalize",
        description: "pipe selectors",
        expectedToInclude: ["capitalize"],
      },
      {
        input: "  app-test  ",
        description: "selectors with whitespace",
        expectedToInclude: ["app-test"],
      },
    ];

    testCases.forEach(({ input, description, expectedToInclude }) => {
      it(`should normalize ${description}`, function () {
        const result = normalizeSelector(input);

        assert.ok(Array.isArray(result), "Should return an array");
        expectedToInclude.forEach((expected) => {
          assert.ok(
            result.includes(expected),
            `Should include ${expected} in result`
          );
        });
      });
    });

    it("should handle empty or invalid selectors", function () {
      const testCases = [
        { input: "", description: "empty string" },
        { input: "   ", description: "whitespace only" },
        { input: null, description: "null" },
        { input: undefined, description: "undefined" },
      ];

      testCases.forEach(({ input, description }) => {
        const result = normalizeSelector(input as any);
        assert.ok(
          Array.isArray(result),
          `Should return an array for ${description}`
        );
        assert.strictEqual(
          result.length,
          0,
          `Should return empty array for ${description}`
        );
      });
    });
  });

  describe("generateImportStatement", function () {
    const testCases = [
      {
        name: "TestComponent",
        path: "@app/components/test",
        expected: "import { TestComponent } from '@app/components/test';",
        description: "named import statements",
      },
      {
        name: "MyService",
        path: "./services/my-service",
        expected: "import { MyService } from './services/my-service';",
        description: "relative imports",
      },
      {
        name: "Utils",
        path: "../shared/utils",
        expected: "import { Utils } from '../shared/utils';",
        description: "parent directory imports",
      },
      {
        name: "Config",
        path: "@shared/config",
        expected: "import { Config } from '@shared/config';",
        description: "alias imports",
      },
    ];

    testCases.forEach(({ name, path, expected, description }) => {
      it(`should generate ${description}`, function () {
        const result = generateImportStatement(name, path);
        assert.strictEqual(
          result,
          expected,
          `Should generate correct ${description}`
        );
      });
    });

    it("should handle special characters in names", function () {
      const result = generateImportStatement(
        "My$Component",
        "@app/components/special"
      );

      assert.strictEqual(
        result,
        "import { My$Component } from '@app/components/special';",
        "Should handle special characters"
      );
    });

    it("should handle empty parameters gracefully", function () {
      const result1 = generateImportStatement("", "@app/test");
      const result2 = generateImportStatement("TestComponent", "");

      assert.strictEqual(
        result1,
        "import {  } from '@app/test';",
        "Should handle empty name"
      );
      assert.strictEqual(
        result2,
        "import { TestComponent } from '';",
        "Should handle empty path"
      );
    });
  });

  describe("resolveRelativePath", function () {
    const testCases = [
      {
        from: "/src/app/components/test.component.ts",
        to: "/src/app/services/data.service.ts",
        expected: "../services/data.service",
        description: "parent directory paths",
      },
      {
        from: "/src/app/components/test.component.ts",
        to: "/src/app/components/other.component.ts",
        expected: "./other.component",
        description: "same directory paths",
      },
      {
        from: "/src/app/pages/home/home.component.ts",
        to: "/src/app/components/shared/button.component.ts",
        expected: "../../components/shared/button.component",
        description: "nested subdirectories",
      },
    ];

    testCases.forEach(({ from, to, expected, description }) => {
      it(`should resolve ${description} correctly`, function () {
        const result = resolveRelativePath(from, to);
        assert.strictEqual(result, expected, `Should resolve ${description}`);
      });
    });

    it("should handle cross-platform paths", function () {
      const from = path.join("src", "app", "components", "test.component.ts");
      const to = path.join("src", "app", "services", "data.service.ts");

      const result = resolveRelativePath(from, to);

      assert.ok(
        result.includes("services"),
        "Should work with cross-platform paths"
      );
      assert.ok(
        result.includes("data.service"),
        "Should include target file name"
      );
    });

    it("should remove file extensions", function () {
      const from = "/src/app/test.component.ts";
      const to = "/src/app/other.component.ts";

      const result = resolveRelativePath(from, to);

      assert.ok(!result.endsWith(".ts"), "Should remove .ts extension");
      assert.strictEqual(
        result,
        "./other.component",
        "Should have correct relative path without extension"
      );
    });

    it("should handle edge cases gracefully", function () {
      const testCases = [
        { from: "", to: "/test", description: "empty from path" },
        { from: "/test", to: "", description: "empty to path" },
        { from: null, to: "/test", description: "null from path" },
        { from: "/test", to: null, description: "null to path" },
      ];

      testCases.forEach(({ from, to, description }) => {
        assert.doesNotThrow(() => {
          const result = resolveRelativePath(from as any, to as any);
          assert.strictEqual(
            typeof result,
            "string",
            `Should return string for ${description}`
          );
        }, `Should not throw for ${description}`);
      });
    });

    it("should handle absolute paths outside project", function () {
      const from = "/project/src/app/test.ts";
      const to = "/other/project/file.ts";

      const result = resolveRelativePath(from, to);

      // Should handle gracefully, might return absolute or relative path
      assert.ok(typeof result === "string", "Should return a string");
      assert.ok(result.length > 0, "Should not return empty string");
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("should not throw errors for malformed inputs", function () {
      // Test extractAngularElementInfo with malformed code
      assert.doesNotThrow(() => {
        extractAngularElementInfo("malformed{code", "/test.ts");
      }, "extractAngularElementInfo should not throw for malformed inputs");

      // Test generateImportStatement with null/undefined
      assert.doesNotThrow(() => {
        generateImportStatement(null as any, undefined as any);
      }, "generateImportStatement should not throw for null/undefined inputs");

      // Test resolveRelativePath with invalid types
      assert.doesNotThrow(() => {
        resolveRelativePath(123 as any, {} as any);
      }, "resolveRelativePath should not throw for invalid type inputs");
    });

    it("should handle very long inputs", function () {
      const longSelector = "a".repeat(1000);
      const normalizedLong = normalizeSelector(longSelector);

      assert.ok(
        Array.isArray(normalizedLong),
        "Should return array for long selectors"
      );
      assert.ok(
        normalizedLong.includes(longSelector),
        "Should handle long selectors"
      );

      const longPath = "/very/long/path/" + "segment/".repeat(100) + "file.ts";
      const isAngular = isAngularFile(longPath);

      assert.strictEqual(
        typeof isAngular,
        "boolean",
        "Should handle long paths"
      );
    });

    it("should handle special characters and unicode", function () {
      const unicodeSelector = "app-тест-компонент";
      const normalized = normalizeSelector(unicodeSelector);

      assert.ok(
        Array.isArray(normalized),
        "Should return array for unicode selectors"
      );
      assert.ok(
        normalized.includes(unicodeSelector),
        "Should handle unicode selectors"
      );

      const specialPath = "/src/app/test-файл.component.ts";
      const isAngular = isAngularFile(specialPath);

      assert.strictEqual(
        typeof isAngular,
        "boolean",
        "Should handle unicode file paths"
      );
    });
  });
});
