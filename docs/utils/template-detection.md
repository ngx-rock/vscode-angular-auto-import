[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / utils/template-detection

# utils/template-detection

Optimized Template String Detection Utility

This module provides template detection for Angular component inline templates.
It uses a hybrid approach:
- Primary: ts-morph AST parsing for robust, reliable detection
- Fallback: regex-based detection for performance when AST is unavailable

## Functions

### clearAllTemplateCache()

> **clearAllTemplateCache**(): `void`

Defined in: [utils/template-detection.ts:541](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/template-detection.ts#L541)

Clear all template cache (useful for cleanup).

#### Returns

`void`

***

### clearTemplateCache()

> **clearTemplateCache**(`documentUri`): `void`

Defined in: [utils/template-detection.ts:534](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/template-detection.ts#L534)

Clear cache for a specific document (useful when document is closed).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `documentUri` | `string` | The URI of the document to clear from the cache. |

#### Returns

`void`

***

### isInsideTemplateString()

> **isInsideTemplateString**(`document`, `position`, `project?`): `boolean`

Defined in: [utils/template-detection.ts:52](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/template-detection.ts#L52)

Check if a position is inside an Angular template string.
Uses a hybrid approach: tries ts-morph AST parsing first (robust), falls back to regex (fast).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The VS Code text document. |
| `position` | `Position` | The position to check. |
| `project?` | `Project` | Optional ts-morph Project for AST-based detection. |

#### Returns

`boolean`

`true` if the position is inside a template string, `false` otherwise.
