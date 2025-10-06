[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / utils/project-context

# utils/project-context

Utility functions for managing project context and document-to-project mapping.

## Functions

### getProjectContextForDocument()

> **getProjectContextForDocument**(`document`, `projectIndexers`, `projectTsConfigs`): `undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

Defined in: [utils/project-context.ts:23](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/project-context.ts#L23)

Finds the project context (indexer and tsConfig) for a given document.
First tries to find by workspace folder, then falls back to checking all known project roots.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The document to find the project context for. |
| `projectIndexers` | `Map`\<`string`, [`AngularIndexer`](../services/indexer.md#angularindexer)\> | Map of project root paths to their indexers. |
| `projectTsConfigs` | `Map`\<`string`, `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig)\> | Map of project root paths to their tsConfigs. |

#### Returns

`undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

The project context or undefined if not found.

***

### getProjectContextForDocumentWithLogging()

> **getProjectContextForDocumentWithLogging**(`document`, `projectIndexers`, `projectTsConfigs`): `undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

Defined in: [utils/project-context.ts:58](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/project-context.ts#L58)

Gets project context for a document and logs a warning if not found.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The document to find the project context for. |
| `projectIndexers` | `Map`\<`string`, [`AngularIndexer`](../services/indexer.md#angularindexer)\> | Map of project root paths to their indexers. |
| `projectTsConfigs` | `Map`\<`string`, `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig)\> | Map of project root paths to their tsConfigs. |

#### Returns

`undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

The project context or undefined if not found.
