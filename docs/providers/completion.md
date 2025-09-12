[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/completion

# providers/completion

Angular Auto-Import Completion Provider

## Classes

### CompletionProvider

Defined in: [providers/completion.ts:22](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L22)

Provides autocompletion for Angular elements.
This implementation relies solely on regular expressions for context detection to ensure
high performance and prevent crashes from invalid template syntax during typing.

#### Implements

- `CompletionItemProvider`
- `Disposable`

#### Constructors

##### Constructor

> **new CompletionProvider**(`context`): [`CompletionProvider`](#completionprovider)

Defined in: [providers/completion.ts:26](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L26)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`CompletionProvider`](#completionprovider)

#### Properties

| Property | Modifier | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | `undefined` | [providers/completion.ts:26](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L26) |
| <a id="disposables"></a> `disposables` | `private` | `Disposable`[] | `[]` | [providers/completion.ts:24](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L24) |
| <a id="standalonecache"></a> `standaloneCache` | `private` | [`LruCache`](../utils/cache.md#lrucache)\<`string`, `boolean`\> | `undefined` | [providers/completion.ts:23](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L23) |

#### Methods

##### dispose()

> **dispose**(): `void`

Defined in: [providers/completion.ts:34](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L34)

Dispose this object.

###### Returns

`void`

###### Implementation of

`vscode.Disposable.dispose`

##### getComponentSourceFile()

> `private` **getComponentSourceFile**(`document`): `Promise`\<`undefined` \| `SourceFile`\>

Defined in: [providers/completion.ts:484](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L484)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`undefined` \| `SourceFile`\>

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): `undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

Defined in: [providers/completion.ts:548](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L548)

**`Internal`**

Gets the project context for a given document.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The document to get the context for. |

###### Returns

`undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

The project context or `undefined` if not found.

##### getSourceFile()

> `private` **getSourceFile**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/completion.ts:503](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L503)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### getTsDocument()

> `private` **getTsDocument**(`document`, `componentPath`): `Promise`\<`null` \| `TextDocument`\>

Defined in: [providers/completion.ts:525](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L525)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `componentPath` | `string` |

###### Returns

`Promise`\<`null` \| `TextDocument`\>

##### isStandaloneComponent()

> `private` **isStandaloneComponent**(`document`): `Promise`\<`boolean`\>

Defined in: [providers/completion.ts:455](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L455)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`boolean`\>

##### provideCompletionItems()

> **provideCompletionItems**(`document`, `position`, `_token`, `_context`): `Promise`\<`CompletionList`\<`CompletionItem`\>\>

Defined in: [providers/completion.ts:48](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L48)

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
