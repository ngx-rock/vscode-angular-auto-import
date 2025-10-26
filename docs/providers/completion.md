[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/completion

# providers/completion

Angular Auto-Import Completion Provider

## Classes

### CompletionProvider

Defined in: [providers/completion.ts:50](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L50)

Provides autocompletion for Angular elements.
This implementation relies solely on regular expressions for context detection to ensure
high performance and prevent crashes from invalid template syntax during typing.

#### Implements

- `CompletionItemProvider`
- `Disposable`

#### Constructors

##### Constructor

> **new CompletionProvider**(`context`): [`CompletionProvider`](#completionprovider)

Defined in: [providers/completion.ts:54](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L54)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`CompletionProvider`](#completionprovider)

#### Properties

| Property | Modifier | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | `undefined` | [providers/completion.ts:54](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L54) |
| <a id="disposables"></a> `disposables` | `private` | `Disposable`[] | `[]` | [providers/completion.ts:52](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L52) |
| <a id="standalonecache"></a> `standaloneCache` | `private` | [`LruCache`](../utils/cache.md#lrucache)\<`string`, `boolean`\> | `undefined` | [providers/completion.ts:51](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L51) |

#### Methods

##### calculateClassNameRelevance()

> `private` **calculateClassNameRelevance**(`className`, `attrName`): `number`

Defined in: [providers/completion.ts:496](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L496)

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

Defined in: [providers/completion.ts:508](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L508)

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

Defined in: [providers/completion.ts:525](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L525)

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

Defined in: [providers/completion.ts:576](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L576)

Creates a single completion item.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `suggestion` | `PotentialSuggestion` |
| `isSharedSelector` | `boolean` |
| `contextData` | `CompletionContextData` |

###### Returns

`CompletionItem`

##### createDocumentationString()

> `private` **createDocumentationString**(`prefix`, `element`, `originalBestSelector`): `string`

Defined in: [providers/completion.ts:609](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L609)

Creates documentation string for completion item.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `prefix` | `string` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `originalBestSelector` | `string` |

###### Returns

`string`

##### createPotentialSuggestions()

> `private` **createPotentialSuggestions**(`elementEntries`, `contextData`): `PotentialSuggestion`[]

Defined in: [providers/completion.ts:352](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L352)

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

Defined in: [providers/completion.ts:710](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L710)

Creates completion item for standard Angular elements.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `stdSelector` | `string` |
| `stdElement` | [`Element`](../types/angular.md#element) |
| `match` | \{ `insertText`: `string`; `itemKind`: `CompletionItemKind`; `relevance`: `number`; \} |
| `match.insertText` | `string` |
| `match.itemKind` | `CompletionItemKind` |
| `match.relevance` | `number` |
| `contextData` | `CompletionContextData` |

###### Returns

`CompletionItem`

##### deduplicateAndSortSuggestions()

> `private` **deduplicateAndSortSuggestions**(`suggestions`): `CompletionItem`[]

Defined in: [providers/completion.ts:751](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L751)

Deduplicates and sorts suggestions.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `suggestions` | `CompletionItem`[] |

###### Returns

`CompletionItem`[]

##### detectCompletionContext()

> `private` **detectCompletionContext**(`document`, `position`): `CompletionContextData`

Defined in: [providers/completion.ts:186](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L186)

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

Defined in: [providers/completion.ts:62](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L62)

Dispose this object.

###### Returns

`void`

###### Implementation of

`vscode.Disposable.dispose`

##### evaluateAttributeMatch()

> `private` **evaluateAttributeMatch**(`element`, `elementSelector`, `contextData`): `object`

Defined in: [providers/completion.ts:443](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L443)

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
| `insertText` | `string` | [providers/completion.ts:447](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L447) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:447](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L447) |
| `relevance` | `number` | [providers/completion.ts:447](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L447) |

##### evaluateSelectorMatch()

> `private` **evaluateSelectorMatch**(`element`, `elementSelector`, `contextData`): `object`

Defined in: [providers/completion.ts:408](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L408)

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
| `insertText` | `string` | [providers/completion.ts:412](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L412) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:412](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L412) |
| `relevance` | `number` | [providers/completion.ts:412](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L412) |

##### evaluateStandardElementMatch()

> `private` **evaluateStandardElementMatch**(`stdSelector`, `stdElement`, `contextData`): `object`

Defined in: [providers/completion.ts:670](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L670)

Evaluates if a standard element should be included.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `stdSelector` | `string` |
| `stdElement` | [`Element`](../types/angular.md#element) |
| `contextData` | `CompletionContextData` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `insertText` | `string` | [providers/completion.ts:676](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L676) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:677](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L677) |
| `relevance` | `number` | [providers/completion.ts:678](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L678) |
| `shouldInclude` | `boolean` | [providers/completion.ts:675](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L675) |

##### extractAttributeName()

> `private` **extractAttributeName**(`elementSelector`): `string`

Defined in: [providers/completion.ts:470](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L470)

Extracts clean attribute name from selector.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementSelector` | `string` |

###### Returns

`string`

##### findBestSelectorMatch()

> `private` **findBestSelectorMatch**(`element`, `selectors`, `contextData`): `object`

Defined in: [providers/completion.ts:377](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L377)

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
| `insertText` | `string` | [providers/completion.ts:381](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L381) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:381](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L381) |
| `relevance` | `number` | [providers/completion.ts:381](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L381) |
| `selector` | `string` | [providers/completion.ts:381](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L381) |

##### formatAttributeInsertText()

> `private` **formatAttributeInsertText**(`attrName`, `contextData`): `string`

Defined in: [providers/completion.ts:483](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L483)

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

Defined in: [providers/completion.ts:271](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L271)

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

Defined in: [providers/completion.ts:292](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L292)

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

Defined in: [providers/completion.ts:642](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L642)

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

Defined in: [providers/completion.ts:138](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L138)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`undefined` \| `SourceFile`\>

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): `undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

Defined in: [providers/completion.ts:770](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L770)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

##### getSourceFile()

> `private` **getSourceFile**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/completion.ts:157](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L157)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### groupSearchResultsByElement()

> `private` **groupSearchResultsByElement**(`searchResults`): `object`[]

Defined in: [providers/completion.ts:307](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L307)

Groups search results by element to avoid duplicates.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `searchResults` | `object`[] |

###### Returns

`object`[]

##### groupSuggestionsByInsertText()

> `private` **groupSuggestionsByInsertText**(`potentialSuggestions`): `Map`\<`string`, `PotentialSuggestion`[]\>

Defined in: [providers/completion.ts:552](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L552)

Groups suggestions by insert text.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `potentialSuggestions` | `PotentialSuggestion`[] |

###### Returns

`Map`\<`string`, `PotentialSuggestion`[]\>

##### isStandaloneComponent()

> `private` **isStandaloneComponent**(`document`): `Promise`\<`boolean`\>

Defined in: [providers/completion.ts:109](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L109)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`boolean`\>

##### parseAttributeContext()

> `private` **parseAttributeContext**(`tagContent`): `object`

Defined in: [providers/completion.ts:239](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L239)

Parses attribute context from tag content.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tagContent` | `string` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `context` | `"attribute"` \| `"structural-directive"` | [providers/completion.ts:240](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L240) |
| `filterText` | `string` | [providers/completion.ts:241](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L241) |
| `triggerChar` | `undefined` \| `"*"` \| `"["` | [providers/completion.ts:242](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L242) |

##### provideCompletionItems()

> **provideCompletionItems**(`document`, `position`, `_token`, `_context`): `Promise`\<`CompletionList`\<`CompletionItem`\>\>

Defined in: [providers/completion.ts:76](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L76)

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

Defined in: [providers/completion.ts:616](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L616)

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

Defined in: [providers/completion.ts:326](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L326)

Sorts element entries based on context if needed.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementEntries` | `object`[] |
| `contextData` | `CompletionContextData` |

###### Returns

`object`[]
