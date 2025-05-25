import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Assuming extension.ts exports the necessary classes and functions
// Adjust the path as per your project structure.
// This might require you to export these from your main extension.ts if not already.
import { AngularIndexer, AngularElementData, TsConfigHelper, activate, deactivate } from '../../src/extension'; 

// Helper function to recursively delete a directory
function deleteDirectoryRecursive(directoryPath: string) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteDirectoryRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
}


suite('Angular Library Indexing and Importing Test Suite', () => {
    let testWorkspaceRoot: string;
    let testProjectPath: string;
    let angularIndexerInstance: AngularIndexer;
    let mockContext: vscode.ExtensionContext;

    const mockLibName = 'my-mock-lib';
    const mockLibPathSuffix = path.join('node_modules', mockLibName);

    const mockComponentDtsContent = `
        import * as i0 from '@angular/core';
        export declare class MockComponentOne { static ɵcmp: i0.ɵɵComponentDeclaration<MockComponentOne, "mock-comp-one", never, {}, {}, never, never, false, never>; }
    `;
    const mockDirectiveDtsContent = `
        import * as i0 from '@angular/core';
        export declare class MockDirectiveOne { static ɵdir: i0.ɵɵDirectiveDeclaration<MockDirectiveOne, "[mockDirOne]", never, {}, {}, never, never, false, never>; }
    `;
    const mockPipeDtsContent = `
        import * as i0 from '@angular/core';
        export declare class MockPipeOne { static ɵpipe: i0.ɵɵPipeDeclaration<MockPipeOne, "mockPipeOne", false>; }
    `;

    const projectPackageJsonContent = JSON.stringify({
        name: "my-test-project",
        dependencies: {
            [mockLibName]: "1.0.0"
        }
    });
    const libPackageJsonContent = JSON.stringify({
        name: mockLibName,
        version: "1.0.0",
        main: "index.js", // Can be dummy
        typings: "component1.d.ts" // Hint for indexer
    });

    const tsconfigJsonContent = JSON.stringify({
        compilerOptions: {
            baseUrl: ".",
            paths: { "@app/*": ["src/app/*"] }
        }
    });

    const targetComponentContent = `
        import { Component } from '@angular/core';

        @Component({
            selector: 'app-root',
            template: ''
        })
        export class AppComponent {}
    `;

    before(async () => {
        console.log('Setting up test workspace...');
        testWorkspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'angular-auto-import-test-'));
        testProjectPath = path.join(testWorkspaceRoot, 'my-test-project');
        
        // Create project structure
        fs.mkdirSync(testProjectPath, { recursive: true });
        fs.mkdirSync(path.join(testProjectPath, 'src', 'app'), { recursive: true });
        fs.mkdirSync(path.join(testProjectPath, mockLibPathSuffix), { recursive: true });

        // Create files
        fs.writeFileSync(path.join(testProjectPath, 'package.json'), projectPackageJsonContent);
        fs.writeFileSync(path.join(testProjectPath, 'tsconfig.json'), tsconfigJsonContent);
        fs.writeFileSync(path.join(testProjectPath, 'src', 'app', 'app.component.ts'), targetComponentContent);

        // Create mock library files
        fs.writeFileSync(path.join(testProjectPath, mockLibPathSuffix, 'package.json'), libPackageJsonContent);
        fs.writeFileSync(path.join(testProjectPath, mockLibPathSuffix, 'component1.d.ts'), mockComponentDtsContent);
        fs.writeFileSync(path.join(testProjectPath, mockLibPathSuffix, 'directive1.d.ts'), mockDirectiveDtsContent);
        fs.writeFileSync(path.join(testProjectPath, mockLibPathSuffix, 'pipe1.d.ts'), mockPipeDtsContent);
        fs.writeFileSync(path.join(testProjectPath, mockLibPathSuffix, 'index.js'), ''); // Dummy main file

        // --- Mock VSCode Workspace ---
        // Mock workspaceFolders
        Object.defineProperty(vscode.workspace, 'workspaceFolders', {
            get: () => [{ uri: vscode.Uri.file(testProjectPath), name: 'my-test-project', index: 0 }]
        });

        // Mock getConfiguration
        const originalGetConfiguration = vscode.workspace.getConfiguration;
        Object.defineProperty(vscode.workspace, 'getConfiguration', {
            value: (section?: string) => {
                if (section === 'angular-auto-import') {
                    return {
                        get: (key: string, defaultValue?: any) => {
                            if (key === 'projectPath') return ''; // Use workspace folder
                            if (key === 'index.refreshInterval') return 0; // Disable periodic re-index for tests
                            return defaultValue;
                        },
                        has: () => true,
                        inspect: () => undefined,
                        update: () => Promise.resolve()
                    };
                }
                return originalGetConfiguration(section);
            }
        });
        
        // Mock ExtensionContext
        mockContext = {
            subscriptions: [],
            workspaceState: {
                get: <T>(key: string, defaultValue?: T): T | undefined => defaultValue,
                update: (key: string, value: any) => Promise.resolve(),
                keys: () => []
            },
            globalState: {
                get: () => undefined,
                update: () => Promise.resolve(),
                setKeysForSync: () => {}
            },
            extensionPath: '',
            storagePath: undefined,
            globalStoragePath: '',
            logPath: '',
            asAbsolutePath: (relativePath: string) => path.join(testProjectPath, relativePath), // Mock as needed
            extensionUri: vscode.Uri.file(''),
            environmentVariableCollection: {} as any,
            extensionMode: vscode.ExtensionMode.Test, 
            storageUri: undefined, 
            globalStorageUri: vscode.Uri.file(''), 
            logUri: vscode.Uri.file('')
        };

        // Activate the extension logic to initialize the indexer
        // This depends on how your extension is structured.
        // We need to ensure angularIndexerInstance is the one used by the extension.
        // For simplicity, let's assume activate sets up a global/exported indexer or we can get it.
        // If `activate` directly returns the indexer or makes it available globally:
        console.log('Activating extension for test...');
        await activate(mockContext); 

        // Find the indexer. This is a bit of a hack.
        // A better way would be for `activate` to return it or for the extension to expose it for testing.
        // For now, assuming it's implicitly created and used by commands.
        // We might need to access it via a command or a test hook if it's not directly available.
        // Let's try to re-fetch it by re-calling activate and grabbing it from there if it's returned (hypothetically)
        // Or, if activate uses a global, we assume it's set.
        // For this test, we'll assume `activate` makes the indexer available or we can create one for testing.
        // Looking at `extension.ts`, `angularIndexer` is a top-level variable.
        // This means we need a way to access *that specific instance*.
        // The easiest way is to ensure the test environment can import it or the activate function returns it.
        // Let's assume `activate` uses the module-level `angularIndexer`.

        // Manually get the indexer instance as it's created in activate
        // This is tricky because the `angularIndexer` variable is module-scoped in extension.ts
        // A common pattern is to have a function like `getIndexer()` exported from extension.ts for testing.
        // For now, we'll create a new one and re-run its setup logic that `activate` would do.
        // This is not ideal as it tests a separate instance, but is simpler without modifying extension code.
        
        // angularIndexerInstance = new AngularIndexer();
        // await angularIndexerInstance.setProjectRoot(testProjectPath);
        // await angularIndexerInstance.generateFullIndex(testProjectPath, mockContext);

        // To get the actual indexer used by the extension, we need to ensure activate has run
        // and that the `angularIndexer` variable in `extension.ts` is populated.
        // Then, we need a way to *get* that instance.
        // If `extension.ts` exports `getAngularIndexer()`:
        // angularIndexerInstance = getAngularIndexer(); // Hypothetical
        // For now, we'll rely on the fact that `activate` has run and populated its internal indexer.
        // And for `importElementToFile`, it uses the global `currentProjectPath` and `getGlobalTsConfig`
        // which are set by `activate`. The `AngularElementData` comes from our test.

        // Re-trigger indexing to ensure the instance used by commands is populated
        // This is a common approach if the indexer isn't directly exposed
        await vscode.commands.executeCommand('angular-auto-import.reindex');
        console.log('Test workspace setup complete.');

        // A short delay to allow file watchers and async operations to settle, if any
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    after(() => {
        console.log('Cleaning up test workspace...');
        deactivate(); // Call deactivate to clean up watchers etc.
        deleteDirectoryRecursive(testWorkspaceRoot);
        // Restore original vscode.workspace.getConfiguration if changed
        Object.defineProperty(vscode.workspace, 'getConfiguration', {
             get: () => vscode.workspace.getConfiguration // simplified restoration
        });
         Object.defineProperty(vscode.workspace, 'workspaceFolders', { // Restore
            get: () => []
        });
        console.log('Test workspace cleanup complete.');
    });

    suite('Library Element Indexing', () => {
        test('should index elements from the mock library', async () => {
            // The indexer should have been populated by the reindex command in beforeAll
            // We need a way to get the indexer instance that the command used.
            // This is the hardest part of testing vscode extensions not designed for easy testability.
            
            // For this test, let's assume we need to create our own indexer instance
            // and test its logic directly, which is more of a unit test for the indexer.
            const indexer = new AngularIndexer();
            indexer.setProjectRoot(testProjectPath); // Crucial
            await indexer.generateFullIndex(testProjectPath, mockContext);

            const componentEl = indexer.getElement('mock-comp-one');
            assert.ok(componentEl, 'Component "mock-comp-one" should be indexed');
            assert.strictEqual(componentEl.name, 'MockComponentOne', 'Component name should be MockComponentOne');
            assert.strictEqual(componentEl.type, 'component', 'Element type should be component');
            assert.strictEqual(componentEl.isLibraryElement, true, 'Component should be marked as library element');
            assert.ok(componentEl.path.includes(path.join(mockLibPathSuffix, 'component1.d.ts')), 'Component path should be correct');
            
            const directiveEl = indexer.getElement('[mockDirOne]');
            assert.ok(directiveEl, 'Directive "[mockDirOne]" should be indexed');
            assert.strictEqual(directiveEl.name, 'MockDirectiveOne', 'Directive name should be MockDirectiveOne');
            assert.strictEqual(directiveEl.type, 'directive', 'Element type should be directive');
            assert.strictEqual(directiveEl.isLibraryElement, true, 'Directive should be marked as library element');
            assert.ok(directiveEl.path.includes(path.join(mockLibPathSuffix, 'directive1.d.ts')), 'Directive path should be correct');

            const pipeEl = indexer.getElement('mockPipeOne');
            assert.ok(pipeEl, 'Pipe "mockPipeOne" should be indexed');
            assert.strictEqual(pipeEl.name, 'MockPipeOne', 'Pipe name should be MockPipeOne');
            assert.strictEqual(pipeEl.type, 'pipe', 'Element type should be pipe');
            assert.strictEqual(pipeEl.isLibraryElement, true, 'Pipe should be marked as library element');
            assert.ok(pipeEl.path.includes(path.join(mockLibPathSuffix, 'pipe1.d.ts')), 'Pipe path should be correct');
        });
    });

    suite('Library Import Statement Generation', () => {
        test('should generate correct import for a library component', async () => {
            // Again, using a local indexer instance for predictability in this test
            const indexer = new AngularIndexer();
            indexer.setProjectRoot(testProjectPath);
            await indexer.generateFullIndex(testProjectPath, mockContext);
            
            const componentData = indexer.getElement('mock-comp-one');
            assert.ok(componentData, 'Test setup: mock-comp-one should be in index');

            const targetComponentPath = path.join(testProjectPath, 'src', 'app', 'app.component.ts');
            
            // Need to ensure `importElementToFile` is exported or testable.
            // Let's assume it is, or we call the command that uses it.
            // For this example, let's assume we can call a testable version or the command.

            // To test importElementToFile, we need `currentProjectPath` and `getGlobalTsConfig` to be set.
            // `activate` should have handled this. We are calling the command which should use these.
            
            // Simulate the command:
            // 1. Get element data (done above)
            // 2. Mock activeTextEditor to point to targetComponentPath
            const originalActiveEditor = vscode.window.activeTextEditor;
            const mockEditor = {
                document: await vscode.workspace.openTextDocument(targetComponentPath)
            };
            Object.defineProperty(vscode.window, 'activeTextEditor', {
                get: () => mockEditor,
                configurable: true 
            });
            
            // Execute the import command - this uses the extension's own indexer
            await vscode.commands.executeCommand('angular-auto-import.importElement', 'mock-comp-one');
            
            // Restore activeTextEditor
            Object.defineProperty(vscode.window, 'activeTextEditor', {
                get: () => originalActiveEditor,
                configurable: true
            });

            const updatedContent = fs.readFileSync(targetComponentPath, 'utf-8');
            assert.ok(
                updatedContent.includes(`import { MockComponentOne } from '${mockLibName}';`),
                `Import statement for MockComponentOne from '${mockLibName}' not found. Content: \n${updatedContent}`
            );
        });
    });

    suite('Built-in Standalone Element Importing', () => {
        const standaloneCompFileName = 'my-standalone.component.ts';
        const standaloneCompPath = path.join(testProjectPath, 'src', 'app', standaloneCompFileName);

        const initialContentNoImports = `
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-standalone',
  template: \`<div>Standalone content with no imports array.</div>\`,
  standalone: true
})
export class MyStandaloneComponent {}`;

        const initialContentEmptyImports = `
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-standalone',
  template: \`<div>Standalone content with empty imports array.</div>\`,
  standalone: true,
  imports: []
})
export class MyStandaloneComponent {}`;

        const initialContentWithExistingImports = `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // A placeholder existing import

@Component({
  selector: 'app-my-standalone',
  template: \`<div>Standalone content with existing imports.</div>\`,
  standalone: true,
  imports: [CommonModule]
})
export class MyStandaloneComponent {}`;

        const testCases = [
            { name: "no initial imports array", content: initialContentNoImports },
            { name: "empty initial imports array", content: initialContentEmptyImports },
            { name: "existing initial imports array", content: initialContentWithExistingImports },
        ];

        testCases.forEach(tc => {
            test(`should import NgIf into standalone component with ${tc.name}`, async () => {
                fs.writeFileSync(standaloneCompPath, tc.content);
                const standaloneCompUri = vscode.Uri.file(standaloneCompPath);

                await vscode.commands.executeCommand('angular-auto-import.importBuiltInElement', {
                    className: 'NgIf',
                    sourcePackage: '@angular/common',
                    activeHtmlFileUri: standaloneCompUri // Using this to point to the TS file directly for the command
                });

                const updatedContent = fs.readFileSync(standaloneCompPath, 'utf-8');
                assert.ok(updatedContent.includes('import { NgIf } from \'@angular/common\';'), 'ES6 import for NgIf not found');
                
                // Check imports array robustly
                const componentDecoratorMatch = updatedContent.match(/@Component\s*\(\s*(\{[\s\S]*?\})\s*\)/);
                assert.ok(componentDecoratorMatch && componentDecoratorMatch[1], 'Could not find @Component decorator content');
                const decoratorContent = componentDecoratorMatch[1];
                const importsArrayMatch = decoratorContent.match(/imports\s*:\s*\[([\s\S]*?)\]/);
                assert.ok(importsArrayMatch && importsArrayMatch[1], 'Could not find imports array in @Component');
                assert.ok(importsArrayMatch[1].includes('NgIf'), 'NgIf not found in imports array');
                if (tc.name === "existing initial imports array") {
                    assert.ok(importsArrayMatch[1].includes('CommonModule'), 'Existing CommonModule import was removed');
                }
            });
        });

        test('should import AsyncPipe into standalone component (initially no imports array)', async () => {
            fs.writeFileSync(standaloneCompPath, initialContentNoImports);
            const standaloneCompUri = vscode.Uri.file(standaloneCompPath);

            await vscode.commands.executeCommand('angular-auto-import.importBuiltInElement', {
                className: 'AsyncPipe',
                sourcePackage: '@angular/common',
                activeHtmlFileUri: standaloneCompUri
            });

            const updatedContent = fs.readFileSync(standaloneCompPath, 'utf-8');
            assert.ok(updatedContent.includes('import { AsyncPipe } from \'@angular/common\';'), 'ES6 import for AsyncPipe not found');
            const componentDecoratorMatch = updatedContent.match(/@Component\s*\(\s*(\{[\s\S]*?\})\s*\)/);
            assert.ok(componentDecoratorMatch && componentDecoratorMatch[1], 'Could not find @Component decorator content for AsyncPipe');
            const decoratorContent = componentDecoratorMatch[1];
            const importsArrayMatch = decoratorContent.match(/imports\s*:\s*\[([\s\S]*?)\]/);
            assert.ok(importsArrayMatch && importsArrayMatch[1].includes('AsyncPipe'), 'AsyncPipe not found in imports array');
        });

        test('idempotency: should not duplicate NgIf import or in imports array', async () => {
            fs.writeFileSync(standaloneCompPath, initialContentEmptyImports); // Start with empty imports
            const standaloneCompUri = vscode.Uri.file(standaloneCompPath);

            // First import
            await vscode.commands.executeCommand('angular-auto-import.importBuiltInElement', {
                className: 'NgIf',
                sourcePackage: '@angular/common',
                activeHtmlFileUri: standaloneCompUri
            });
            // Second import (should be idempotent)
            await vscode.commands.executeCommand('angular-auto-import.importBuiltInElement', {
                className: 'NgIf',
                sourcePackage: '@angular/common',
                activeHtmlFileUri: standaloneCompUri
            });

            const updatedContent = fs.readFileSync(standaloneCompPath, 'utf-8');
            
            const es6ImportOccurrences = (updatedContent.match(/import { NgIf } from '@angular\/common';/g) || []).length;
            assert.strictEqual(es6ImportOccurrences, 1, 'NgIf ES6 import should appear only once');

            const componentDecoratorMatch = updatedContent.match(/@Component\s*\(\s*(\{[\s\S]*?\})\s*\)/);
            assert.ok(componentDecoratorMatch && componentDecoratorMatch[1], 'Could not find @Component decorator content for idempotency check');
            const decoratorContent = componentDecoratorMatch[1];
            const importsArrayMatch = decoratorContent.match(/imports\s*:\s*\[([\s\S]*?)\]/);
            assert.ok(importsArrayMatch && importsArrayMatch[1], 'Could not find imports array for idempotency check');
            
            const ngIfInImportsArrayOccurrences = (importsArrayMatch[1].match(/\bNgIf\b/g) || []).length;
            assert.strictEqual(ngIfInImportsArrayOccurrences, 1, 'NgIf should appear only once in imports array');
        });
    });
});

// Helper to ensure extension exports are available for testing
// This would be in your actual extension.ts
/*
export {
    AngularIndexer, // if you want to test it directly
    AngularElementData,
    importElementToFile, // if you want to test it directly
    activate,
    deactivate,
    getAngularIndexer, // A function to get the main indexer instance
    getGlobalTsConfig,
    getGlobalProjectPath
};
*/
// And your main extension.ts would have:
// let angularIndexer: AngularIndexer;
// export function getAngularIndexer() { return angularIndexer; }
// export function getGlobalTsConfig() { return currentTsConfig; }
// export function getGlobalProjectPath() { return currentProjectPath; }
// ... and ensure `angularIndexer` is assigned in `activate`.
