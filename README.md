# vscode-angular-auto-import
Automatically suggests and inserts missing Angular component imports based on selectors used in templates.

## Features

*   **Automatic Import Suggestions:** Detects unimported Angular components, directives, and pipes used in your HTML templates.
*   **One-Click Quick Fixes:** Provides VS Code Quick Fix actions (lightbulb icon) to insert missing imports directly.
*   **Standalone Component Support:** Works seamlessly with Angular's standalone components, directives, and pipes.
*   **AST-Based Detection:** Utilizes TypeScript's Abstract Syntax Tree (AST) for accurate element detection.

### Third-Party Library Support

Angular Auto Import now extends its capabilities to your project's dependencies! It automatically:

*   Scans installed third-party Angular libraries (from your `package.json` dependencies in `node_modules`).
*   Suggests components, directives, and pipes exported by these libraries.
*   Generates correct import statements for these elements (e.g., `import { LibComponent } from 'my-lib';`).

This helps you quickly integrate elements from your favorite Angular libraries without manually writing import statements.