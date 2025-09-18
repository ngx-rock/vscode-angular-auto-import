[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/completion

# providers/completion

Angular Auto-Import Completion Provider

## Classes

### CompletionProvider

Defined in: [providers/completion.ts:58](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L58)

Provides autocompletion for Angular elements.
This implementation relies solely on regular expressions for context detection to ensure
high performance and prevent crashes from invalid template syntax during typing.

#### Implements

- `CompletionItemProvider`
- `Disposable`

#### Constructors

##### Constructor

> **new CompletionProvider**(`context`): [`CompletionProvider`](#completionprovider)

Defined in: [providers/completion.ts:62](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L62)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`CompletionProvider`](#completionprovider)

#### Properties

| Property | Modifier | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | `undefined` | [providers/completion.ts:62](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L62) |
| <a id="disposables"></a> `disposables` | `private` | `Disposable`[] | `[]` | [providers/completion.ts:60](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L60) |
| <a id="standalonecache"></a> `standaloneCache` | `private` | [`LruCache`](../utils/cache.md#lrucache)\<`string`, `boolean`\> | `undefined` | [providers/completion.ts:59](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L59) |

#### Methods

##### calculateClassNameRelevance()

> `private` **calculateClassNameRelevance**(`className`, `attrName`): `number`

Defined in: [providers/completion.ts:522](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L522)

Calculates relevance based on class name match.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `className` | `string` |
| `attrName` | `string` |

###### Returns

`number`

##### calculateTagMatchRelevance()

> `private` **calculateTagMatchRelevance**(`elementSelector`, `linePrefix`): `number`

Defined in: [providers/completion.ts:534](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L534)

Calculates relevance based on tag match.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementSelector` | `string` |
| `linePrefix` | `string` |

###### Returns

`number`

##### convertPotentialSuggestionsToCompletionItems()

> `private` **convertPotentialSuggestionsToCompletionItems**(`potentialSuggestions`, `contextData`, `seenElements`): `CompletionItem`[]

Defined in: [providers/completion.ts:551](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L551)

Converts potential suggestions to completion items.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `potentialSuggestions` | `PotentialSuggestion`[] |
| `contextData` | `CompletionContextData` |
| `seenElements` | `Set`\<`string`\> |

###### Returns

`CompletionItem`[]

##### createCompletionItem()

> `private` **createCompletionItem**(`suggestion`, `isSharedSelector`, `contextData`): `CompletionItem`

Defined in: [providers/completion.ts:602](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L602)

Creates a single completion item.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `suggestion` | `PotentialSuggestion` |
| `isSharedSelector` | `boolean` |
| `contextData` | `CompletionContextData` |

###### Returns

`CompletionItem`

##### createPotentialSuggestions()

> `private` **createPotentialSuggestions**(`elementEntries`, `contextData`): `PotentialSuggestion`[]

Defined in: [providers/completion.ts:378](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L378)

Creates potential suggestions from element entries.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementEntries` | `object`[] |
| `contextData` | `CompletionContextData` |

###### Returns

`PotentialSuggestion`[]

##### createStandardElementCompletionItem()

> `private` **createStandardElementCompletionItem**(`stdSelector`, `stdElement`, `match`, `contextData`): `CompletionItem`

Defined in: [providers/completion.ts:729](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L729)

Creates completion item for standard Angular elements.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `stdSelector` | `string` |
| `stdElement` | `StandardAngularElement` |
| `match` | \{ `insertText`: `string`; `itemKind`: `CompletionItemKind`; `relevance`: `number`; \} |
| `match.insertText` | `string` |
| `match.itemKind` | `CompletionItemKind` |
| `match.relevance` | `number` |
| `contextData` | `CompletionContextData` |

###### Returns

`CompletionItem`

##### deduplicateAndSortSuggestions()

> `private` **deduplicateAndSortSuggestions**(`suggestions`): `CompletionItem`[]

Defined in: [providers/completion.ts:770](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L770)

Deduplicates and sorts suggestions.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `suggestions` | `CompletionItem`[] |

###### Returns

`CompletionItem`[]

##### detectCompletionContext()

> `private` **detectCompletionContext**(`document`, `position`): `CompletionContextData`

Defined in: [providers/completion.ts:212](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L212)

Detects the completion context based on cursor position.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `position` | `Position` |

###### Returns

`CompletionContextData`

##### dispose()

> **dispose**(): `void`

Defined in: [providers/completion.ts:70](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L70)

Dispose this object.

###### Returns

`void`

###### Implementation of

`vscode.Disposable.dispose`

##### evaluateAttributeMatch()

> `private` **evaluateAttributeMatch**(`element`, `elementSelector`, `contextData`): `object`

Defined in: [providers/completion.ts:469](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L469)

Evaluates attribute-specific matches.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `elementSelector` | `string` |
| `contextData` | `CompletionContextData` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `insertText` | `string` | [providers/completion.ts:473](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L473) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:473](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L473) |
| `relevance` | `number` | [providers/completion.ts:473](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L473) |

##### evaluateSelectorMatch()

> `private` **evaluateSelectorMatch**(`element`, `elementSelector`, `contextData`): `object`

Defined in: [providers/completion.ts:434](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L434)

Evaluates a single selector match.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `elementSelector` | `string` |
| `contextData` | `CompletionContextData` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `insertText` | `string` | [providers/completion.ts:438](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L438) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:438](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L438) |
| `relevance` | `number` | [providers/completion.ts:438](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L438) |

##### evaluateStandardElementMatch()

> `private` **evaluateStandardElementMatch**(`stdSelector`, `stdElement`, `contextData`): `object`

Defined in: [providers/completion.ts:689](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L689)

Evaluates if a standard element should be included.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `stdSelector` | `string` |
| `stdElement` | `StandardAngularElement` |
| `contextData` | `CompletionContextData` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `insertText` | `string` | [providers/completion.ts:695](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L695) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:696](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L696) |
| `relevance` | `number` | [providers/completion.ts:697](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L697) |
| `shouldInclude` | `boolean` | [providers/completion.ts:694](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L694) |

##### extractAttributeName()

> `private` **extractAttributeName**(`elementSelector`): `string`

Defined in: [providers/completion.ts:496](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L496)

Extracts clean attribute name from selector.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementSelector` | `string` |

###### Returns

`string`

##### findBestSelectorMatch()

> `private` **findBestSelectorMatch**(`element`, `selectors`, `contextData`): `object`

Defined in: [providers/completion.ts:403](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L403)

Finds the best selector match for an element.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `selectors` | `string`[] |
| `contextData` | `CompletionContextData` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `insertText` | `string` | [providers/completion.ts:407](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L407) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:407](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L407) |
| `relevance` | `number` | [providers/completion.ts:407](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L407) |
| `selector` | `string` | [providers/completion.ts:407](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L407) |

##### formatAttributeInsertText()

> `private` **formatAttributeInsertText**(`attrName`, `contextData`): `string`

Defined in: [providers/completion.ts:509](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L509)

Formats insert text for attributes.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `attrName` | `string` |
| `contextData` | `CompletionContextData` |

###### Returns

`string`

##### generateCompletionSuggestions()

> `private` **generateCompletionSuggestions**(`projCtx`, `contextData`): `Promise`\<`CompletionItem`[]\>

Defined in: [providers/completion.ts:297](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L297)

Generates all completion suggestions.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `projCtx` | `ProjectContextForCompletion` |
| `contextData` | `CompletionContextData` |

###### Returns

`Promise`\<`CompletionItem`[]\>

##### generateIndexedElementSuggestions()

> `private` **generateIndexedElementSuggestions**(`indexer`, `contextData`, `seenElements`): `Promise`\<`CompletionItem`[]\>

Defined in: [providers/completion.ts:318](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L318)

Generates suggestions from indexed elements.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `indexer` | \{ `project`: `Project`; `searchWithSelectors`: `object`[]; \} |
| `indexer.project` | `Project` |
| `indexer.searchWithSelectors` |
| `contextData` | `CompletionContextData` |
| `seenElements` | `Set`\<`string`\> |

###### Returns

`Promise`\<`CompletionItem`[]\>

##### generateStandardElementSuggestions()

> `private` **generateStandardElementSuggestions**(`contextData`, `seenElements`): `CompletionItem`[]

Defined in: [providers/completion.ts:661](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L661)

Generates suggestions from standard Angular elements.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `contextData` | `CompletionContextData` |
| `seenElements` | `Set`\<`string`\> |

###### Returns

`CompletionItem`[]

##### getComponentSourceFile()

> `private` **getComponentSourceFile**(`document`): `Promise`\<`undefined` \| `SourceFile`\>

Defined in: [providers/completion.ts:145](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L145)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`undefined` \| `SourceFile`\>

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): `undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

Defined in: [providers/completion.ts:789](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L789)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

##### getSourceFile()

> `private` **getSourceFile**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/completion.ts:164](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L164)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### getTsDocument()

> `private` **getTsDocument**(`document`, `componentPath`): `Promise`\<`null` \| `TextDocument`\>

Defined in: [providers/completion.ts:186](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L186)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `componentPath` | `string` |

###### Returns

`Promise`\<`null` \| `TextDocument`\>

##### groupSearchResultsByElement()

> `private` **groupSearchResultsByElement**(`searchResults`): `object`[]

Defined in: [providers/completion.ts:333](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L333)

Groups search results by element to avoid duplicates.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `searchResults` | `object`[] |

###### Returns

`object`[]

##### groupSuggestionsByInsertText()

> `private` **groupSuggestionsByInsertText**(`potentialSuggestions`): `Map`\<`string`, `PotentialSuggestion`[]\>

Defined in: [providers/completion.ts:578](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L578)

Groups suggestions by insert text.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `potentialSuggestions` | `PotentialSuggestion`[] |

###### Returns

`Map`\<`string`, `PotentialSuggestion`[]\>

##### isStandaloneComponent()

> `private` **isStandaloneComponent**(`document`): `Promise`\<`boolean`\>

Defined in: [providers/completion.ts:116](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L116)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`boolean`\>

##### parseAttributeContext()

> `private` **parseAttributeContext**(`tagContent`): `object`

Defined in: [providers/completion.ts:265](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L265)

Parses attribute context from tag content.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tagContent` | `string` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `context` | `"attribute"` \| `"structural-directive"` | [providers/completion.ts:266](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L266) |
| `filterText` | `string` | [providers/completion.ts:267](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L267) |
| `triggerChar` | `undefined` \| `"*"` \| `"["` | [providers/completion.ts:268](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L268) |

##### provideCompletionItems()

> **provideCompletionItems**(`document`, `position`, `_token`, `_context`): `Promise`\<`CompletionList`\<`CompletionItem`\>\>

Defined in: [providers/completion.ts:84](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L84)

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

##### setCompletionItemDetails()

> `private` **setCompletionItemDetails**(`item`, `element`, `originalBestSelector`): `void`

Defined in: [providers/completion.ts:635](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L635)

Sets completion item details and documentation.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `item` | `CompletionItem` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `originalBestSelector` | `string` |

###### Returns

`void`

##### sortElementEntriesIfNeeded()

> `private` **sortElementEntriesIfNeeded**(`elementEntries`, `contextData`): `object`[]

Defined in: [providers/completion.ts:352](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L352)

Sorts element entries based on context if needed.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementEntries` | `object`[] |
| `contextData` | `CompletionContextData` |

###### Returns

`object`[]
