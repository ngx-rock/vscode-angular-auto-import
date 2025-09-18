[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / services/tsconfig

# services/tsconfig

TypeScript Configuration Helper Service
Responsible for handling tsconfig.json and resolving path aliases.

## Functions

### clearCache()

> **clearCache**(`projectRoot?`): `void`

Defined in: [services/tsconfig.ts:279](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/tsconfig.ts#L279)

Clears the tsconfig and trie caches.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `projectRoot?` | `string` | If provided, only clears the cache for that project. |

#### Returns

`void`

***

### findAndParseTsConfig()

> **findAndParseTsConfig**(`projectRoot`): `Promise`\<`null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig)\>

Defined in: [services/tsconfig.ts:296](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/tsconfig.ts#L296)

Finds and parses the `tsconfig.json` or `tsconfig.base.json` file for a given project.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `projectRoot` | `string` | The root directory of the project. |

#### Returns

`Promise`\<`null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig)\>

A processed tsconfig object or `null` if not found.

***

### resolveImportPath()

> **resolveImportPath**(`absoluteTargetModulePathNoExt`, `absoluteCurrentFilePath`, `projectRoot`): `Promise`\<`string`\>

Defined in: [services/tsconfig.ts:379](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/tsconfig.ts#L379)

Resolves an absolute module path to an import path, using a
tsconfig alias (via the Trie) or falling back to a relative path.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `absoluteTargetModulePathNoExt` | `string` | Absolute path to the file to be imported, without extension. |
| `absoluteCurrentFilePath` | `string` | Absolute path to the file where the import will be added. |
| `projectRoot` | `string` | The root directory of the current project. |

#### Returns

`Promise`\<`string`\>

A string for the import statement (e.g., '@app/components/my-comp' or '../../my-comp').
