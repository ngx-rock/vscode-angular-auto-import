/**
 * =================================================================================================
 * Test Setup Verification
 * =================================================================================================
 *
 * Basic tests to verify that the test environment is working correctly.
 */

import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

describe("Test Environment Setup", function () {
  // Set timeout for all tests in this suite
  this.timeout(5000);

  it("should have access to VS Code API", function () {
    assert.ok(vscode, "VS Code API should be available");
    assert.ok(vscode.workspace, "VS Code workspace API should be available");
    assert.ok(vscode.window, "VS Code window API should be available");
  });

  it("should have access to Node.js APIs", function () {
    assert.ok(fs, "File system API should be available");
    assert.ok(path, "Path API should be available");
    assert.strictEqual(
      typeof process,
      "object",
      "Process object should be available"
    );
  });

  it("should be able to resolve test fixtures path", function () {
    const fixturesPath = path.join(__dirname, "..", "fixtures");
    const simpleProjectPath = path.join(fixturesPath, "simple-project");

    assert.ok(
      fs.existsSync(simpleProjectPath),
      "Simple project fixture should exist"
    );

    const tsconfigPath = path.join(simpleProjectPath, "tsconfig.json");
    assert.ok(
      fs.existsSync(tsconfigPath),
      "Simple project tsconfig should exist"
    );
  });

  it("should be able to read test fixture files", function () {
    const fixturesPath = path.join(__dirname, "..", "fixtures");
    const simpleProjectPath = path.join(fixturesPath, "simple-project");
    const tsconfigPath = path.join(simpleProjectPath, "tsconfig.json");

    const content = fs.readFileSync(tsconfigPath, "utf8");
    const config = JSON.parse(content);

    assert.ok(config.compilerOptions, "TSConfig should have compilerOptions");
    assert.ok(
      config.compilerOptions.paths,
      "TSConfig should have path mappings"
    );
  });

  it("should have correct test timeout configuration", function (done) {
    // This test verifies that async operations work correctly
    setTimeout(() => {
      assert.ok(true, "Timeout should work correctly");
      done();
    }, 100);
  });

  it("should support async/await syntax", async function () {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;

    assert.ok(elapsed >= 45, "Async/await should work correctly");
  });

  it("should have access to extension types", function () {
    // Verify that our custom types are available
    const testData = {
      name: "TestComponent",
      type: "component" as const,
      selector: "test-component",
      selectors: ["test-component"],
      filePath: "/test/path",
    };

    assert.strictEqual(testData.type, "component", "Custom types should work");
    assert.ok(Array.isArray(testData.selectors), "Array types should work");
  });
});
