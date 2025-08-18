[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / utils/import

# utils/import

=================================================================================================
Angular Auto-Import Utility Functions
=================================================================================================

This module handles the core import functionality for Angular elements.

Key Bug Fixes:
1. **Active Document Synchronization**: The importElementToFile function now properly
   synchronizes with active VSCode documents instead of only reading from disk. This
   fixes the issue where quick fix imports wouldn't work on first access to TypeScript
   components with inline templates.

2. **Diagnostic Updates**: After successful imports, the system now automatically
   updates diagnostics to remove red underlines from successfully imported elements.
   Uses multiple retry attempts with increasing delays (100ms, 300ms, 500ms) to ensure
   proper synchronization between VSCode document changes and ts-morph Project state.

3. **Timing and Synchronization**: Improved timing of diagnostic updates to account for
   VSCode's asynchronous document processing. The system now waits for document changes
   to be fully processed before checking import status.

4. **Active Document Priority**: All operations now prioritize active VSCode documents
   over disk content, ensuring that unsaved changes are properly handled.

## Functions

### importElementToFile()

> **importElementToFile**(`element`, `componentFilePathAbs`, `projectRootPath`, `indexerProject`, `_tsConfig`): `Promise`\<`boolean`\>

Defined in: [utils/import.ts:81](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/import.ts#L81)

Imports an Angular element into a component file. This function handles adding the import statement
and updating the `@Component` decorator's `imports` array.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) | The Angular element to import. |
| `componentFilePathAbs` | `string` | The absolute path to the component file. |
| `projectRootPath` | `string` | The root path of the project. |
| `indexerProject` | `Project` | The ts-morph project instance. |
| `_tsConfig` | `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig) | The processed tsconfig.json. |

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the import was successful, `false` otherwise.

***

### setGlobalDiagnosticProvider()

> **setGlobalDiagnosticProvider**(`provider`): `void`

Defined in: [utils/import.ts:54](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/import.ts#L54)

Sets the global diagnostic provider instance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `provider` | `null` \| [`DiagnosticProvider`](../providers/diagnostics.md#diagnosticprovider) | The diagnostic provider instance. |

#### Returns

`void`
