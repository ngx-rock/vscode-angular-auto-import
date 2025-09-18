[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / utils/template-detection

# utils/template-detection

Optimized Template String Detection Utility

This module provides fast, regex-based detection of whether a cursor position
is inside an Angular component's template string, replacing the expensive
ts-morph AST parsing approach with efficient string operations.

## Functions

### clearAllTemplateCache()

> **clearAllTemplateCache**(): `void`

Defined in: [utils/template-detection.ts:342](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/template-detection.ts#L342)

Clear all template cache (useful for cleanup).

#### Returns

`void`

***

### clearTemplateCache()

> **clearTemplateCache**(`documentUri`): `void`

Defined in: [utils/template-detection.ts:335](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/template-detection.ts#L335)

Clear cache for a specific document (useful when document is closed).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `documentUri` | `string` | The URI of the document to clear from the cache. |

#### Returns

`void`

***

### isInsideTemplateString()

> **isInsideTemplateString**(`document`, `position`): `boolean`

Defined in: [utils/template-detection.ts:49](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/template-detection.ts#L49)

Optimized function to check if a position is inside an Angular template string.
Uses regex-based parsing instead of ts-morph for significant performance improvement.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The VS Code text document. |
| `position` | `Position` | The position to check. |

#### Returns

`boolean`

`true` if the position is inside a template string, `false` otherwise.
