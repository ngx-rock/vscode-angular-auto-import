[**Angular Auto Import Extension API Documentation**](README.md)

***

[Angular Auto Import Extension](README.md) / providers

# providers

VSCode Providers Registration

## Interfaces

### ProviderContext

Defined in: [providers/index.ts:21](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L21)

Context for the providers.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="extensionconfig"></a> `extensionConfig` | [`ExtensionConfig`](config/settings.md#extensionconfig) | The current extension configuration. | [providers/index.ts:33](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L33) |
| <a id="extensioncontext"></a> `extensionContext` | `ExtensionContext` | The extension context. | [providers/index.ts:37](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L37) |
| <a id="projectindexers"></a> `projectIndexers` | `Map`\<`string`, [`AngularIndexer`](services/indexer.md#angularindexer)\> | A map of project root paths to their corresponding `AngularIndexer` instances. | [providers/index.ts:25](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L25) |
| <a id="projecttsconfigs"></a> `projectTsConfigs` | `Map`\<`string`, `null` \| [`ProcessedTsConfig`](types/tsconfig.md#processedtsconfig)\> | A map of project root paths to their corresponding processed `tsconfig.json` files. | [providers/index.ts:29](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L29) |

## Functions

### registerProviders()

> **registerProviders**(`context`, `providerContext`): `void`

Defined in: [providers/index.ts:45](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L45)

Registers all VSCode providers for the extension.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |
| `providerContext` | [`ProviderContext`](#providercontext) | The context to be shared among providers. |

#### Returns

`void`
