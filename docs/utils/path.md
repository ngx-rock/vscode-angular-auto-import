[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / utils/path

# utils/path

Utilities for working with file paths.

## Functions

### getRelativeFilePath()

> **getRelativeFilePath**(`fromFileAbs`, `toFileAbsNoExt`): `string`

Defined in: [utils/path.ts:46](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/path.ts#L46)

Calculates the relative path from one file to another.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fromFileAbs` | `string` | The absolute path of the source file. |
| `toFileAbsNoExt` | `string` | The absolute path of the target file, without the extension. |

#### Returns

`string`

The relative path.

***

### normalizePath()

> **normalizePath**(`p`): `string`

Defined in: [utils/path.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/path.ts#L13)

Normalizes a path by replacing backslashes with forward slashes.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `p` | `string` | The path to normalize. |

#### Returns

`string`

The normalized path.

***

### switchFileType()

> **switchFileType**(`filePath`, `newExtensionWithDotOrEmpty`): `string`

Defined in: [utils/path.ts:24](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/path.ts#L24)

Replaces or removes the extension of a file path.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The original file path. |
| `newExtensionWithDotOrEmpty` | `string` | The new extension (e.g., '.ts') or an empty string to remove the extension. |

#### Returns

`string`

The modified file path.
