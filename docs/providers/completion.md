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

Defined in: [providers/completion.ts:503](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L503)

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

Defined in: [providers/completion.ts:515](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L515)

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

Defined in: [providers/completion.ts:532](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L532)

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

Defined in: [providers/completion.ts:583](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L583)

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

Defined in: [providers/completion.ts:616](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L616)

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

Defined in: [providers/completion.ts:359](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L359)

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

Defined in: [providers/completion.ts:717](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L717)

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

Defined in: [providers/completion.ts:758](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L758)

Deduplicates and sorts suggestions.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `suggestions` | `CompletionItem`[] |

###### Returns

`CompletionItem`[]

##### detectCompletionContext()

> `private` **detectCompletionContext**(`document`, `position`): `CompletionContextData`

Defined in: [providers/completion.ts:193](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L193)

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

Defined in: [providers/completion.ts:450](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L450)

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
| `insertText` | `string` | [providers/completion.ts:454](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L454) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:454](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L454) |
| `relevance` | `number` | [providers/completion.ts:454](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L454) |

##### evaluateSelectorMatch()

> `private` **evaluateSelectorMatch**(`element`, `elementSelector`, `contextData`): `object`

Defined in: [providers/completion.ts:415](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L415)

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
| `insertText` | `string` | [providers/completion.ts:419](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L419) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:419](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L419) |
| `relevance` | `number` | [providers/completion.ts:419](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L419) |

##### evaluateStandardElementMatch()

> `private` **evaluateStandardElementMatch**(`stdSelector`, `stdElement`, `contextData`): `object`

Defined in: [providers/completion.ts:677](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L677)

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
| `insertText` | `string` | [providers/completion.ts:683](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L683) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:684](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L684) |
| `relevance` | `number` | [providers/completion.ts:685](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L685) |
| `shouldInclude` | `boolean` | [providers/completion.ts:682](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L682) |

##### extractAttributeName()

> `private` **extractAttributeName**(`elementSelector`): `string`

Defined in: [providers/completion.ts:477](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L477)

Extracts clean attribute name from selector.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementSelector` | `string` |

###### Returns

`string`

##### findBestSelectorMatch()

> `private` **findBestSelectorMatch**(`element`, `selectors`, `contextData`): `object`

Defined in: [providers/completion.ts:384](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L384)

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
| `insertText` | `string` | [providers/completion.ts:388](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L388) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:388](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L388) |
| `relevance` | `number` | [providers/completion.ts:388](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L388) |
| `selector` | `string` | [providers/completion.ts:388](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L388) |

##### formatAttributeInsertText()

> `private` **formatAttributeInsertText**(`attrName`, `contextData`): `string`

Defined in: [providers/completion.ts:490](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L490)

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

Defined in: [providers/completion.ts:278](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L278)

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

Defined in: [providers/completion.ts:299](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L299)

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

Defined in: [providers/completion.ts:649](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L649)

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

> `private` **getProjectContextForDocument**(`document`): `undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

Defined in: [providers/completion.ts:777](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L777)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

##### getSourceFile()

> `private` **getSourceFile**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/completion.ts:164](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L164)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### groupSearchResultsByElement()

> `private` **groupSearchResultsByElement**(`searchResults`): `object`[]

Defined in: [providers/completion.ts:314](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L314)

Groups search results by element to avoid duplicates.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `searchResults` | `object`[] |

###### Returns

`object`[]

##### groupSuggestionsByInsertText()

> `private` **groupSuggestionsByInsertText**(`potentialSuggestions`): `Map`\<`string`, `PotentialSuggestion`[]\>

Defined in: [providers/completion.ts:559](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L559)

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

Defined in: [providers/completion.ts:246](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L246)

Parses attribute context from tag content.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tagContent` | `string` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `context` | `"attribute"` \| `"structural-directive"` | [providers/completion.ts:247](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L247) |
| `filterText` | `string` | [providers/completion.ts:248](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L248) |
| `triggerChar` | `undefined` \| `"*"` \| `"["` | [providers/completion.ts:249](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L249) |

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

Defined in: [providers/completion.ts:623](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L623)

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

Defined in: [providers/completion.ts:333](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L333)

Sorts element entries based on context if needed.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementEntries` | `object`[] |
| `contextData` | `CompletionContextData` |

###### Returns

`object`[]
