**Angular Auto Import Extension API Documentation**

***

# Angular Auto-Import for VS Code

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/baryshevrs.angular-auto-import?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=baryshevrs.angular-auto-import)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/baryshevrs.angular-auto-import?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=baryshevrs.angular-auto-import)

Streamline your Angular development with intelligent, automatic imports for components, directives, and pipes directly in your HTML templates and TypeScript files.

![Angular Auto-Import in action](https://raw.githubusercontent.com/ngx-rock/vscode-angular-auto-import/refs/heads/main/img/demo.gif) 

## Features

- **⚡️ Automatic Imports**: Get quick fix suggestions to import Angular elements that are not yet included in your component's module.
- **🚀 Fix All Command**: Automatically import all missing Angular elements in the current file with a single command.
- **💡 Smart Completions**: Autocomplete for component tags, directives, and pipes in HTML templates (`.html`) and inline templates within TypeScript files.
- **🔍 Diagnostics**: Identifies unknown Angular elements in your templates and provides quick fixes.
- **📦 External Library Support**: Auto-import components, directives, and pipes from external packages (both standalone and module-based).
- **Monorepo Support**: Works seamlessly with multi-project workspaces, like Nx.
- **Path Alias Resolution**: Understands `tsconfig.json` path aliases (`@app/*`, `@shared/*`, etc.) for correct import path generation.
- **Standalone Component Support**: Works with both module-based and standalone Angular components, directives, and pipes.

## Installation

Install "Angular Auto Import" from the Visual Studio Code Marketplace:

[Install Extension](https://marketplace.visualstudio.com/items?itemName=baryshevrs.angular-auto-import)

Alternatively, search for `Angular Auto Import` in the VS Code Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).

## Usage

### Automatic Quick Fixes

When you use an Angular component, directive, or pipe in your template that hasn't been imported into the corresponding NgModule or component's `imports` array, the extension will display a squiggly line (based on your configured diagnostics severity).

1.  **Hover over the unknown element** (tag, attribute, or pipe).
2.  **Click the lightbulb icon** or press `Ctrl+.` (`Cmd+.` on macOS) to see available Quick Fixes.
3.  **Select the import suggestion** (e.g., `Import MyComponent from './my.component'`).

The extension will automatically add the necessary import statement to your TypeScript file and include the component/directive/pipe in your `@NgModule`'s `imports` array or your standalone component's `imports` array.

### Smart Completions

Start typing an Angular element selector (e.g., `<my-component`, `[myDirective]`, `| myPipe`) in your HTML or inline TypeScript template. The extension will provide completion suggestions.

## Configuration

You can customize the extension's behavior via VS Code settings (`settings.json`):

| Setting                                            | Description                                                                                                   | Default   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- |
| `angular-auto-import.projectPath`                  | Optional. Absolute path to the Angular project root. If set, overrides workspace folders. If not set, uses open workspace folders. | `null`    |
| `angular-auto-import.index.refreshInterval`        | Interval in minutes for automatically reindexing Angular elements. Set to `0` to disable periodic reindexing. | `60`      |
| `angular-auto-import.completion.pipes.enabled`     | Enable or disable auto-completion suggestions for Angular pipes in templates.                                 | `true`    |
| `angular-auto-import.completion.components.enabled`| Enable or disable auto-completion suggestions for Angular components in templates.                            | `true`    |
| `angular-auto-import.completion.directives.enabled`| Enable or disable auto-completion suggestions for Angular directives in templates.                            | `true`    |
| `angular-auto-import.diagnostics.mode`             | Diagnostic mode: `full` (show diagnostics + quick fixes), `quickfix-only` (quick fixes without visible diagnostics), `disabled` (turn off all diagnostics). | `full`    |
| `angular-auto-import.diagnostics.severity`         | The severity of diagnostics for missing imports (`error`, `warning`, `info`).                                 | `warning` |

## Troubleshooting

- **Elements not found**: If elements are not being auto-imported, try running the `Angular Auto Import: Reindex Project(s)` command. If issues persist, use the `Angular Auto Import: Clear Cache` command to completely reset the cache.
- **Performance issues**: For very large projects, consider increasing `angular-auto-import.index.refreshInterval` or setting `angular-auto-import.projectPath` to a specific sub-project root (e.g., `src/` folder to skip node_modules).
- **Incorrect imports**: Ensure your `tsconfig.json` `baseUrl` and `paths` are correctly configured.
 
## Commands

The following commands are available from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- **Angular Auto Import: Fix all missing imports in current file**: Automatically imports all components, directives, and pipes that are used in the current file but not yet imported.
- **Angular Auto Import: Reindex Project(s)**: Manually triggers a reindex of your project to discover all available Angular elements.
- **Angular Auto Import: Clear Cache**: Clears the extension's cache. Use this if you encounter persistent issues.
- **Angular Auto Import: Show Logs**: Opens the extension's output channel to view logs. 

---

## Limitations

> While Angular Auto Import aims to simplify your development experience, there are some limitations to be aware of:

**Standalone Projects Only**: This extension is designed to work exclusively with standalone Angular projects. Traditional NgModule-based projects are not supported.

## Modules

| Module | Description |
| ------ | ------ |
| [commands](commands.md) | VSCode Commands Registration |
| [config](config.md) | Central export for configuration files. |
| [config/angular-elements](config/angular-elements.md) | - |
| [config/excluded-libraries](config/excluded-libraries.md) | Configuration for libraries that should be excluded from indexing. |
| [config/forms](config/forms.md) | Configuration for standard Angular forms directives. |
| [config/settings](config/settings.md) | Manages extension settings and configuration. |
| [config/standard-modules](config/standard-modules.md) | Standard Angular module exports mapping. Maps standard Angular modules (like CommonModule, FormsModule) to the elements they export. |
| [consts](consts.md) | - |
| [consts/known-tags](consts/known-tags.md) | - |
| [logger](logger.md) | - |
| [logger/channel-transport](logger/channel-transport.md) | - |
| [logger/config](logger/config.md) | - |
| [logger/file-transport](logger/file-transport.md) | - |
| [logger/logger](logger/logger-1.md) | - |
| [logger/types](logger/types.md) | - |
| [Main extension entry point for Angular Auto-Import](Main-extension-entry-point-for-Angular-Auto-Import.md) | VSCode Extension: Angular Auto-Import |
| [providers](providers.md) | VSCode Providers Registration |
| [providers/completion](providers/completion.md) | Angular Auto-Import Completion Provider |
| [providers/diagnostics](providers/diagnostics.md) | Angular Auto-Import Diagnostic Provider |
| [providers/quickfix](providers/quickfix.md) | Angular Auto-Import QuickFix Provider |
| [services](services.md) | Central export for all services. |
| [services/diagnostics-reporter](services/diagnostics-reporter.md) | Diagnostics Report Generator |
| [services/indexer](services/indexer.md) | Angular Indexer Service Responsible for indexing Angular components, directives, and pipes. |
| [services/tsconfig](services/tsconfig.md) | TypeScript Configuration Helper Service Responsible for handling tsconfig.json and resolving path aliases. |
| [types](types.md) | Central export for all types. |
| [types/angular](types/angular.md) | Defines the core data types for Angular elements. |
| [types/template-ast](types/template-ast.md) | Basic type definitions for Angular template AST nodes. These are simplified interfaces for the Angular template parser AST. |
| [types/tsconfig](types/tsconfig.md) | Defines types related to TypeScript configuration and path mappings. |
| [utils](utils.md) | Auto-Import Index |
| [utils/angular](utils/angular.md) | Utilities for working with Angular elements and selectors. |
| [utils/cache](utils/cache.md) | LRUCache |
| [utils/debounce](utils/debounce.md) | - |
| [utils/import](utils/import.md) | Angular Auto-Import Utility Functions |
| [utils/package-json](utils/package-json.md) | Utilities for working with `package.json` files. |
| [utils/path](utils/path.md) | Utilities for working with file paths. |
| [utils/project-context](utils/project-context.md) | Utility functions for managing project context and document-to-project mapping. |
| [utils/template-detection](utils/template-detection.md) | Optimized Template String Detection Utility |
| [utils/vscode-helpers](utils/vscode-helpers.md) | VS Code Helper Utilities |
