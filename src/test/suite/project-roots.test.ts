/**
 * =================================================================================================
 * Project Roots Determination Tests
 * =================================================================================================
 *
 * Tests for the determineProjectRoots() function behavior when projectPath setting
 * is configured versus using workspace folders fallback.
 */

import * as assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import type { ExtensionConfig } from "../../config";
import { determineProjectRoots } from "../../extension";

describe("determineProjectRoots", function () {
  // Set timeout for all tests in this suite
  this.timeout(10000);

  const fixturesPath = path.join(__dirname, "..", "fixtures");
  const testProjectPath = path.join(fixturesPath, "simple-project");
  const testSrcPath = path.join(testProjectPath, "src");

  before(async () => {
    // Ensure test fixtures exist
    if (!fs.existsSync(testProjectPath)) {
      throw new Error(`Test fixture not found: ${testProjectPath}`);
    }

    // Create src directory for testing if it doesn't exist
    if (!fs.existsSync(testSrcPath)) {
      fs.mkdirSync(testSrcPath, { recursive: true });
    }
  });

  describe("projectPath override behavior", () => {
    it("should use projectPath when configured (even with workspace folders)", async () => {
      // Mock configuration with projectPath set
      const mockConfig: ExtensionConfig = {
        projectPath: testSrcPath,
        indexRefreshInterval: 60,
        diagnosticsEnabled: true,
        diagnosticsSeverity: "warning",
        logging: {
          enabled: true,
          level: "INFO",
          fileLoggingEnabled: false,
          logDirectory: null,
          rotationMaxSize: 5,
          rotationMaxFiles: 5,
          outputFormat: "plain",
        },
      };

      // Mock workspace folders (simulating case from issue #16)
      const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
      const mockWorkspaceFolder: vscode.WorkspaceFolder = {
        uri: vscode.Uri.file(testProjectPath),
        name: "test-project",
        index: 0,
      };

      // Temporarily override workspace folders
      Object.defineProperty(vscode.workspace, "workspaceFolders", {
        configurable: true,
        get: () => [mockWorkspaceFolder],
      });

      try {
        const roots = await determineProjectRoots(mockConfig);

        // Should return projectPath, not workspace folder
        assert.strictEqual(roots.length, 1, "Should return exactly one project root");
        assert.strictEqual(roots[0], testSrcPath, "Should use configured projectPath instead of workspace folder");
      } finally {
        // Restore original workspace folders
        Object.defineProperty(vscode.workspace, "workspaceFolders", {
          configurable: true,
          get: () => originalWorkspaceFolders,
        });
      }
    });

    it("should return empty array when projectPath is invalid", async () => {
      const invalidPath = path.join(testProjectPath, "non-existent-directory");

      const mockConfig: ExtensionConfig = {
        projectPath: invalidPath,
        indexRefreshInterval: 60,
        diagnosticsEnabled: true,
        diagnosticsSeverity: "warning",
        logging: {
          enabled: true,
          level: "INFO",
          fileLoggingEnabled: false,
          logDirectory: null,
          rotationMaxSize: 5,
          rotationMaxFiles: 5,
          outputFormat: "plain",
        },
      };

      const roots = await determineProjectRoots(mockConfig);
      assert.strictEqual(roots.length, 0, "Should return empty array for invalid projectPath");
    });

    it("should handle relative projectPath correctly", async () => {
      // Use relative path
      const relativePath = path.relative(process.cwd(), testSrcPath);

      const mockConfig: ExtensionConfig = {
        projectPath: relativePath,
        indexRefreshInterval: 60,
        diagnosticsEnabled: true,
        diagnosticsSeverity: "warning",
        logging: {
          enabled: true,
          level: "INFO",
          fileLoggingEnabled: false,
          logDirectory: null,
          rotationMaxSize: 5,
          rotationMaxFiles: 5,
          outputFormat: "plain",
        },
      };

      const roots = await determineProjectRoots(mockConfig);

      assert.strictEqual(roots.length, 1, "Should resolve relative path correctly");
      assert.strictEqual(
        path.resolve(roots[0]),
        path.resolve(testSrcPath),
        "Should resolve to absolute path of src directory"
      );
    });
  });

  describe("workspace folders fallback behavior", () => {
    it("should use workspace folders when projectPath is null", async () => {
      const mockConfig: ExtensionConfig = {
        projectPath: null,
        indexRefreshInterval: 60,
        diagnosticsEnabled: true,
        diagnosticsSeverity: "warning",
        logging: {
          enabled: true,
          level: "INFO",
          fileLoggingEnabled: false,
          logDirectory: null,
          rotationMaxSize: 5,
          rotationMaxFiles: 5,
          outputFormat: "plain",
        },
      };

      // Mock workspace folders
      const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
      const mockWorkspaceFolder: vscode.WorkspaceFolder = {
        uri: vscode.Uri.file(testProjectPath),
        name: "test-project",
        index: 0,
      };

      Object.defineProperty(vscode.workspace, "workspaceFolders", {
        configurable: true,
        get: () => [mockWorkspaceFolder],
      });

      try {
        const roots = await determineProjectRoots(mockConfig);

        assert.strictEqual(roots.length, 1, "Should return workspace folder as fallback");
        assert.strictEqual(roots[0], testProjectPath, "Should use workspace folder path");
      } finally {
        // Restore original workspace folders
        Object.defineProperty(vscode.workspace, "workspaceFolders", {
          configurable: true,
          get: () => originalWorkspaceFolders,
        });
      }
    });

    it("should use workspace folders when projectPath is empty string", async () => {
      const mockConfig: ExtensionConfig = {
        projectPath: "",
        indexRefreshInterval: 60,
        diagnosticsEnabled: true,
        diagnosticsSeverity: "warning",
        logging: {
          enabled: true,
          level: "INFO",
          fileLoggingEnabled: false,
          logDirectory: null,
          rotationMaxSize: 5,
          rotationMaxFiles: 5,
          outputFormat: "plain",
        },
      };

      // Mock workspace folders
      const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
      const mockWorkspaceFolder: vscode.WorkspaceFolder = {
        uri: vscode.Uri.file(testProjectPath),
        name: "test-project",
        index: 0,
      };

      Object.defineProperty(vscode.workspace, "workspaceFolders", {
        configurable: true,
        get: () => [mockWorkspaceFolder],
      });

      try {
        const roots = await determineProjectRoots(mockConfig);

        assert.strictEqual(roots.length, 1, "Should return workspace folder as fallback");
        assert.strictEqual(roots[0], testProjectPath, "Should use workspace folder path");
      } finally {
        // Restore original workspace folders
        Object.defineProperty(vscode.workspace, "workspaceFolders", {
          configurable: true,
          get: () => originalWorkspaceFolders,
        });
      }
    });

    it("should handle multiple workspace folders", async () => {
      const mockConfig: ExtensionConfig = {
        projectPath: null,
        indexRefreshInterval: 60,
        diagnosticsEnabled: true,
        diagnosticsSeverity: "warning",
        logging: {
          enabled: true,
          level: "INFO",
          fileLoggingEnabled: false,
          logDirectory: null,
          rotationMaxSize: 5,
          rotationMaxFiles: 5,
          outputFormat: "plain",
        },
      };

      // Mock multiple workspace folders
      const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
      const mockWorkspaceFolders: vscode.WorkspaceFolder[] = [
        {
          uri: vscode.Uri.file(testProjectPath),
          name: "test-project-1",
          index: 0,
        },
        {
          uri: vscode.Uri.file(fixturesPath),
          name: "test-project-2",
          index: 1,
        },
      ];

      Object.defineProperty(vscode.workspace, "workspaceFolders", {
        configurable: true,
        get: () => mockWorkspaceFolders,
      });

      try {
        const roots = await determineProjectRoots(mockConfig);

        assert.strictEqual(roots.length, 2, "Should return all workspace folders");
        assert.strictEqual(roots[0], testProjectPath, "Should include first workspace folder");
        assert.strictEqual(roots[1], fixturesPath, "Should include second workspace folder");
      } finally {
        // Restore original workspace folders
        Object.defineProperty(vscode.workspace, "workspaceFolders", {
          configurable: true,
          get: () => originalWorkspaceFolders,
        });
      }
    });

    it("should return empty array when no projectPath and no workspace folders", async () => {
      const mockConfig: ExtensionConfig = {
        projectPath: null,
        indexRefreshInterval: 60,
        diagnosticsEnabled: true,
        diagnosticsSeverity: "warning",
        logging: {
          enabled: true,
          level: "INFO",
          fileLoggingEnabled: false,
          logDirectory: null,
          rotationMaxSize: 5,
          rotationMaxFiles: 5,
          outputFormat: "plain",
        },
      };

      // Mock no workspace folders
      const originalWorkspaceFolders = vscode.workspace.workspaceFolders;

      Object.defineProperty(vscode.workspace, "workspaceFolders", {
        configurable: true,
        get: () => undefined,
      });

      try {
        const roots = await determineProjectRoots(mockConfig);

        assert.strictEqual(roots.length, 0, "Should return empty array when no projectPath and no workspace folders");
      } finally {
        // Restore original workspace folders
        Object.defineProperty(vscode.workspace, "workspaceFolders", {
          configurable: true,
          get: () => originalWorkspaceFolders,
        });
      }
    });
  });
});
