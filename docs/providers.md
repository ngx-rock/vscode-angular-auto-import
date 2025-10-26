[**Angular Auto Import Extension API Documentation**](README.md)

***

[Angular Auto Import Extension](README.md) / providers

# providers

VSCode Providers Registration

## Interfaces

### ProviderContext

Defined in: [providers/index.ts:20](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L20)

Context for the providers.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="diagnosticprovider"></a> `diagnosticProvider?` | [`DiagnosticProvider`](providers/diagnostics.md#diagnosticprovider) | The diagnostic provider instance (optional, set after registration). | [providers/index.ts:40](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L40) |
| <a id="extensionconfig"></a> `extensionConfig` | [`ExtensionConfig`](config/settings.md#extensionconfig) | The current extension configuration. | [providers/index.ts:32](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L32) |
| <a id="extensioncontext"></a> `extensionContext` | `ExtensionContext` | The extension context. | [providers/index.ts:36](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L36) |
| <a id="projectindexers"></a> `projectIndexers` | `Map`\<`string`, [`AngularIndexer`](services/indexer.md#angularindexer)\> | A map of project root paths to their corresponding `AngularIndexer` instances. | [providers/index.ts:24](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L24) |
| <a id="projecttsconfigs"></a> `projectTsConfigs` | `Map`\<`string`, `null` \| [`ProcessedTsConfig`](types/tsconfig.md#processedtsconfig)\> | A map of project root paths to their corresponding processed `tsconfig.json` files. | [providers/index.ts:28](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L28) |

## Functions

### registerProviders()

> **registerProviders**(`context`, `providerContext`): `undefined` \| [`DiagnosticProvider`](providers/diagnostics.md#diagnosticprovider)

Defined in: [providers/index.ts:48](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L48)

Registers all VSCode providers for the extension.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |
| `providerContext` | [`ProviderContext`](#providercontext) | The context to be shared among providers. |

#### Returns

`undefined` \| [`DiagnosticProvider`](providers/diagnostics.md#diagnosticprovider)
