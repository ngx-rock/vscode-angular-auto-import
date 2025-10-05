[**Angular Auto Import Extension API Documentation**](README.md)

***

[Angular Auto Import Extension](README.md) / Main extension entry point for Angular Auto-Import

# Main extension entry point for Angular Auto-Import

VSCode Extension: Angular Auto-Import

A modularly designed extension for automatically importing Angular elements.

This module serves as the main entry point for the VS Code extension, handling:
- Extension activation and deactivation lifecycle
- Project discovery and initialization
- Configuration management
- Provider and command registration
- Multi-project workspace support

## Author

Angular Auto-Import Team

## Since

1.0.0

## Functions

### activate()

> **activate**(`context`): `Promise`\<`void`\>

Defined in: [extension.ts:105](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/extension.ts#L105)

Activates the Angular Auto-Import extension.

This is the main entry point called by VS Code when the extension is activated.
Handles the complete initialization process including:
- Configuration loading
- Project discovery and setup
- Provider and command registration
- File system watcher setup

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The VS Code extension context providing access to extension APIs |

#### Returns

`Promise`\<`void`\>

#### Throws

When extension activation fails due to configuration or initialization issues

#### Example

```typescript
// Called automatically by VS Code when extension activates
await activate(context);
```

***

### deactivate()

> **deactivate**(): `void`

Defined in: [extension.ts:191](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/extension.ts#L191)

Deactivates the Angular Auto-Import extension and cleans up all resources.

This function is called when the extension is being disabled or VS Code is shutting down.
It ensures proper cleanup of:
- Active reindexing intervals
- Angular indexer instances
- TypeScript configuration caches
- Template detection caches

#### Returns

`void`

#### Example

```typescript
// Called automatically by VS Code when extension deactivates
deactivate();
```

***

### determineProjectRoots()

> **determineProjectRoots**(`config?`): `Promise`\<`string`[]\>

Defined in: [extension.ts:234](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/extension.ts#L234)

**`Internal`**

Determines the project root directories for Angular Auto-Import to operate on.

The function follows this priority order:
1. Uses configured projectPath setting if provided and valid (overrides workspace folders)
2. Falls back to workspace folders if no projectPath configured
3. Returns empty array if neither is available or valid

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config?` | [`ExtensionConfig`](config/settings.md#extensionconfig) | Extension configuration (optional, uses current config if not provided) |

#### Returns

`Promise`\<`string`[]\>

Promise resolving to array of absolute project root paths

#### Throws

When configured project path is invalid or inaccessible

#### Example

```typescript
const roots = await determineProjectRoots();
logger.info('Found project roots:', roots);
// Output: ['C:\\workspace\\my-angular-app\\src'] (if projectPath configured to src/)
```

 - Exported for testing purposes only

***

### getProjectContextForDocument()

> **getProjectContextForDocument**(`document`): `undefined` \| [`ProjectContext`](types/angular.md#projectcontext)

Defined in: [extension.ts:472](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/extension.ts#L472)

Retrieves the project context for a given VS Code document.

This function determines which project a document belongs to and returns
the associated indexer and TypeScript configuration. The lookup follows:
1. Direct workspace folder membership
2. Fallback to path-based matching against known project roots

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The VS Code text document to find context for |

#### Returns

`undefined` \| [`ProjectContext`](types/angular.md#projectcontext)

Project context containing indexer and tsconfig, or undefined if not found

#### Example

```typescript
const context = getProjectContextForDocument(document);
if (context) {
  const { projectRootPath, indexer, tsConfig } = context;
  // Use indexer to find Angular elements
}
```
