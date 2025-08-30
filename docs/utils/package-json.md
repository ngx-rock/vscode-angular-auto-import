[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / utils/package-json

# utils/package-json

Utilities for working with `package.json` files.

## Interfaces

### AngularDependency

Defined in: [utils/package-json.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/package-json.ts#L13)

Information about an Angular dependency found in `node_modules`.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="name"></a> `name` | `string` | The name of the dependency (e.g., '@angular/core'). | [utils/package-json.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/package-json.ts#L15) |
| <a id="path"></a> `path` | `string` | The real path to the library's folder. | [utils/package-json.ts:17](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/package-json.ts#L17) |

## Functions

### findAngularDependencies()

> **findAngularDependencies**(`projectRootPath`): `Promise`\<[`AngularDependency`](#angulardependency)[]\>

Defined in: [utils/package-json.ts:64](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/package-json.ts#L64)

Finds all Angular libraries in the project's dependencies.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `projectRootPath` | `string` | The root path of the project. |

#### Returns

`Promise`\<[`AngularDependency`](#angulardependency)[]\>

A list of Angular libraries.

***

### getLibraryEntryPoints()

> **getLibraryEntryPoints**(`library`): `Promise`\<`Map`\<`string`, `string`\>\>

Defined in: [utils/package-json.ts:113](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/package-json.ts#L113)

Gets the entry points for a library from its `package.json`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `library` | [`AngularDependency`](#angulardependency) | Information about the library. |

#### Returns

`Promise`\<`Map`\<`string`, `string`\>\>

A map where the key is the import path and the value is the absolute path to the `.d.ts` file.
