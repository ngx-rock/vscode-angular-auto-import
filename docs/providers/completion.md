[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/completion

# providers/completion

=================================================================================================
Angular Auto-Import Completion Provider
=================================================================================================

## Classes

### CompletionProvider

Defined in: [providers/completion.ts:20](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L20)

Provides autocompletion for Angular elements.
This implementation relies solely on regular expressions for context detection to ensure
high performance and prevent crashes from invalid template syntax during typing.

#### Implements

- `CompletionItemProvider`

#### Constructors

##### Constructor

> **new CompletionProvider**(`context`): [`CompletionProvider`](#completionprovider)

Defined in: [providers/completion.ts:21](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L21)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`CompletionProvider`](#completionprovider)

#### Properties

| Property | Modifier | Type | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | [providers/completion.ts:21](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L21) |

#### Methods

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): `undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

Defined in: [providers/completion.ts:447](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L447)

**`Internal`**

Gets the project context for a given document.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The document to get the context for. |

###### Returns

`undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

The project context or `undefined` if not found.

##### provideCompletionItems()

> **provideCompletionItems**(`document`, `position`, `_token`, `_context`): `Promise`\<`CompletionList`\<`CompletionItem`\>\>

Defined in: [providers/completion.ts:31](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L31)

Provides completion items for the given document and position.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The document to provide completions for. |
| `position` | `Position` | The position at which to provide completions. |
| `_token` | `CancellationToken` | A cancellation token. |
| `_context` | `CompletionContext` | The context of the completion request. |

###### Returns

`Promise`\<`CompletionList`\<`CompletionItem`\>\>

A list of completion items.

###### Implementation of

`vscode.CompletionItemProvider.provideCompletionItems`
