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
| <a id="diagnosticprovider"></a> `diagnosticProvider?` | [`DiagnosticProvider`](providers/diagnostics.md#diagnosticprovider) | The diagnostic provider instance (optional, set after registration). | [providers/index.ts:41](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L41) |
| <a id="extensionconfig"></a> `extensionConfig` | [`ExtensionConfig`](config/settings.md#extensionconfig) | The current extension configuration. | [providers/index.ts:33](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L33) |
| <a id="extensioncontext"></a> `extensionContext` | `ExtensionContext` | The extension context. | [providers/index.ts:37](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L37) |
| <a id="projectindexers"></a> `projectIndexers` | `Map`\<`string`, [`AngularIndexer`](services/indexer.md#angularindexer)\> | A map of project root paths to their corresponding `AngularIndexer` instances. | [providers/index.ts:25](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L25) |
| <a id="projecttsconfigs"></a> `projectTsConfigs` | `Map`\<`string`, `null` \| [`ProcessedTsConfig`](types/tsconfig.md#processedtsconfig)\> | A map of project root paths to their corresponding processed `tsconfig.json` files. | [providers/index.ts:29](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L29) |

## Functions

### registerProviders()

> **registerProviders**(`context`, `providerContext`): `undefined` \| [`DiagnosticProvider`](providers/diagnostics.md#diagnosticprovider)

Defined in: [providers/index.ts:49](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/index.ts#L49)

Registers all VSCode providers for the extension.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |
| `providerContext` | [`ProviderContext`](#providercontext) | The context to be shared among providers. |

#### Returns

`undefined` \| [`DiagnosticProvider`](providers/diagnostics.md#diagnosticprovider)
