[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / utils/vscode-helpers

# utils/vscode-helpers

VS Code Helper Utilities

## Functions

### getTsDocument()

> **getTsDocument**(`currentDocument`, `componentPath`): `Promise`\<`TextDocument` \| `null`\>

Defined in: [utils/vscode-helpers.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/vscode-helpers.ts#L15)

Opens a TypeScript document by path, or returns the current document if paths match

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `currentDocument` | `TextDocument` | The currently active document |
| `componentPath` | `string` | The path to the TypeScript file to open |

#### Returns

`Promise`\<`TextDocument` \| `null`\>

The opened TextDocument or null if it couldn't be opened
