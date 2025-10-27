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

##### buildMultiLineTagContent()

> `private` **buildMultiLineTagContent**(`document`, `openTagPosition`, `currentPosition`, `currentLinePrefix`): `string`

Defined in: [providers/completion.ts:420](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L420)

Builds tag content from multi-line tag.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `openTagPosition` | \{ `char`: `number`; `line`: `number`; \} |
| `openTagPosition.char` | `number` |
| `openTagPosition.line` | `number` |
| `currentPosition` | `Position` |
| `currentLinePrefix` | `string` |

###### Returns

`string`

##### calculateClassNameRelevance()

> `private` **calculateClassNameRelevance**(`className`, `attrName`): `number`

Defined in: [providers/completion.ts:806](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L806)

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

Defined in: [providers/completion.ts:818](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L818)

Calculates relevance based on tag match.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementSelector` | `string` |
| `linePrefix` | `string` |

###### Returns

`number`

##### checkCurrentLineForTag()

> `private` **checkCurrentLineForTag**(`linePrefix`): `null` \| \{ `isNewTag`: `boolean`; `tagContent`: `string`; \}

Defined in: [providers/completion.ts:275](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L275)

Checks if the current line contains an unclosed tag.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `linePrefix` | `string` |

###### Returns

`null` \| \{ `isNewTag`: `boolean`; `tagContent`: `string`; \}

##### containsClosingTagBracket()

> `private` **containsClosingTagBracket**(`text`): `boolean`

Defined in: [providers/completion.ts:384](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L384)

Checks if a string contains a closing tag bracket (>) outside of string literals.
Handles both single and double quotes.

Examples:
- '<div>' → true (has closing bracket)
- '*ngIf="value > 5"' → false (> is inside quotes)
- '[attr]="a > b" >' → true (has closing bracket outside quotes)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `text` | `string` |

###### Returns

`boolean`

##### convertPotentialSuggestionsToCompletionItems()

> `private` **convertPotentialSuggestionsToCompletionItems**(`potentialSuggestions`, `contextData`, `seenElements`): `CompletionItem`[]

Defined in: [providers/completion.ts:835](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L835)

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

Defined in: [providers/completion.ts:886](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L886)

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

Defined in: [providers/completion.ts:919](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L919)

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

Defined in: [providers/completion.ts:567](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L567)

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

Defined in: [providers/completion.ts:1020](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L1020)

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

Defined in: [providers/completion.ts:1061](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L1061)

Deduplicates and sorts suggestions.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `suggestions` | `CompletionItem`[] |

###### Returns

`CompletionItem`[]

##### detectCompletionContext()

> `private` **detectCompletionContext**(`document`, `position`): `CompletionContextData`

Defined in: [providers/completion.ts:199](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L199)

Detects the completion context based on cursor position.
Handles multi-line tags by looking backwards from the cursor position.

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

Defined in: [providers/completion.ts:753](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L753)

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
| `insertText` | `string` | [providers/completion.ts:757](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L757) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:757](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L757) |
| `relevance` | `number` | [providers/completion.ts:757](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L757) |

##### evaluateComponentMatch()

> `private` **evaluateComponentMatch**(`element`, `elementSelector`, `contextData`, `isElementSelector`): `object`

Defined in: [providers/completion.ts:671](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L671)

Evaluates a component match.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `elementSelector` | `string` |
| `contextData` | `CompletionContextData` |
| `isElementSelector` | `boolean` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `insertText` | `string` | [providers/completion.ts:676](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L676) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:676](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L676) |
| `relevance` | `number` | [providers/completion.ts:676](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L676) |

##### evaluateDirectiveMatch()

> `private` **evaluateDirectiveMatch**(`element`, `elementSelector`, `contextData`, `isElementSelector`): `object`

Defined in: [providers/completion.ts:683](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L683)

Evaluates a directive match.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `elementSelector` | `string` |
| `contextData` | `CompletionContextData` |
| `isElementSelector` | `boolean` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `insertText` | `string` | [providers/completion.ts:688](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L688) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:688](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L688) |
| `relevance` | `number` | [providers/completion.ts:688](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L688) |

##### evaluateElementOrAttributeMatch()

> `private` **evaluateElementOrAttributeMatch**(`element`, `elementSelector`, `contextData`, `isElementSelector`): `object`

Defined in: [providers/completion.ts:695](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L695)

Common logic for evaluating element or attribute selector matches (components and directives).

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `elementSelector` | `string` |
| `contextData` | `CompletionContextData` |
| `isElementSelector` | `boolean` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `insertText` | `string` | [providers/completion.ts:700](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L700) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:700](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L700) |
| `relevance` | `number` | [providers/completion.ts:700](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L700) |

##### evaluatePipeMatch()

> `private` **evaluatePipeMatch**(`elementSelector`, `contextData`): `object`

Defined in: [providers/completion.ts:654](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L654)

Evaluates a pipe match.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementSelector` | `string` |
| `contextData` | `CompletionContextData` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `insertText` | `string` | [providers/completion.ts:657](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L657) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:657](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L657) |
| `relevance` | `number` | [providers/completion.ts:657](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L657) |

##### evaluateSelectorMatch()

> `private` **evaluateSelectorMatch**(`element`, `elementSelector`, `contextData`): `object`

Defined in: [providers/completion.ts:623](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L623)

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
| `insertText` | `string` | [providers/completion.ts:627](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L627) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:627](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L627) |
| `relevance` | `number` | [providers/completion.ts:627](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L627) |

##### evaluateStandardElementMatch()

> `private` **evaluateStandardElementMatch**(`stdSelector`, `stdElement`, `contextData`): `object`

Defined in: [providers/completion.ts:980](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L980)

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
| `insertText` | `string` | [providers/completion.ts:986](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L986) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:987](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L987) |
| `relevance` | `number` | [providers/completion.ts:988](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L988) |
| `shouldInclude` | `boolean` | [providers/completion.ts:985](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L985) |

##### extractAttributeName()

> `private` **extractAttributeName**(`elementSelector`): `string`

Defined in: [providers/completion.ts:780](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L780)

Extracts clean attribute name from selector.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementSelector` | `string` |

###### Returns

`string`

##### findBestSelectorMatch()

> `private` **findBestSelectorMatch**(`element`, `selectors`, `contextData`): `object`

Defined in: [providers/completion.ts:592](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L592)

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
| `insertText` | `string` | [providers/completion.ts:596](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L596) |
| `itemKind` | `CompletionItemKind` | [providers/completion.ts:596](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L596) |
| `relevance` | `number` | [providers/completion.ts:596](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L596) |
| `selector` | `string` | [providers/completion.ts:596](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L596) |

##### findMultiLineTagContext()

> `private` **findMultiLineTagContext**(`document`, `position`, `currentLinePrefix`): `null` \| \{ `isNewTag`: `boolean`; `tagContent`: `string`; \}

Defined in: [providers/completion.ts:307](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L307)

Finds multi-line tag context by searching backwards.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `position` | `Position` |
| `currentLinePrefix` | `string` |

###### Returns

`null` \| \{ `isNewTag`: `boolean`; `tagContent`: `string`; \}

##### findTagContext()

> `private` **findTagContext**(`document`, `position`): `null` \| \{ `isNewTag`: `boolean`; `tagContent`: `string`; \}

Defined in: [providers/completion.ts:256](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L256)

Finds the tag context by looking backwards from the cursor position.
Handles multi-line tags.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `position` | `Position` |

###### Returns

`null` \| \{ `isNewTag`: `boolean`; `tagContent`: `string`; \}

##### formatAttributeInsertText()

> `private` **formatAttributeInsertText**(`attrName`, `contextData`): `string`

Defined in: [providers/completion.ts:793](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L793)

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

Defined in: [providers/completion.ts:477](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L477)

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

Defined in: [providers/completion.ts:498](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L498)

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

Defined in: [providers/completion.ts:952](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L952)

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

Defined in: [providers/completion.ts:150](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L150)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`undefined` \| `SourceFile`\>

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): `undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

Defined in: [providers/completion.ts:1080](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L1080)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

##### getSourceFile()

> `private` **getSourceFile**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/completion.ts:169](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L169)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### groupSearchResultsByElement()

> `private` **groupSearchResultsByElement**(`searchResults`): `object`[]

Defined in: [providers/completion.ts:522](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L522)

Groups search results by element to avoid duplicates.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `searchResults` | `object`[] |

###### Returns

`object`[]

##### groupSuggestionsByInsertText()

> `private` **groupSuggestionsByInsertText**(`potentialSuggestions`): `Map`\<`string`, `PotentialSuggestion`[]\>

Defined in: [providers/completion.ts:862](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L862)

Groups suggestions by insert text.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `potentialSuggestions` | `PotentialSuggestion`[] |

###### Returns

`Map`\<`string`, `PotentialSuggestion`[]\>

##### isElementSelector()

> `private` **isElementSelector**(`selector`): `boolean`

Defined in: [providers/completion.ts:730](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L730)

Determines if a selector is an element selector (for tag context).
Element selectors are used in tag context (e.g., <app-header>, <router-outlet>).
Attribute selectors are used in attribute context (e.g., [ngModel], button[mat-button]).

Examples:
- "button[mat-button]" → false (attribute directive for button elements)
- "custom-input:not([disabled])" → true (element directive, attributes inside :not() don't count)
- "[ngModel]" → false (pure attribute directive)
- "app-header" → true (pure element directive/component)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selector` | `string` | The selector to check. |

###### Returns

`boolean`

true if it's an element selector, false if it's an attribute selector.

##### isStandaloneComponent()

> `private` **isStandaloneComponent**(`document`): `Promise`\<`boolean`\>

Defined in: [providers/completion.ts:121](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L121)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`boolean`\>

##### isTagClosedBetween()

> `private` **isTagClosedBetween**(`document`, `openTagPosition`, `currentPosition`): `boolean`

Defined in: [providers/completion.ts:356](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L356)

Checks if a tag is closed between two positions.
Ignores > characters inside string literals (e.g., *ngIf="value > 5").

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `openTagPosition` | \{ `char`: `number`; `line`: `number`; \} |
| `openTagPosition.char` | `number` |
| `openTagPosition.line` | `number` |
| `currentPosition` | `Position` |

###### Returns

`boolean`

##### parseAttributeContext()

> `private` **parseAttributeContext**(`tagContent`): `object`

Defined in: [providers/completion.ts:445](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L445)

Parses attribute context from tag content.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tagContent` | `string` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `context` | `"attribute"` \| `"structural-directive"` | [providers/completion.ts:446](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L446) |
| `filterText` | `string` | [providers/completion.ts:447](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L447) |
| `triggerChar` | `undefined` \| `"*"` \| `"["` | [providers/completion.ts:448](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L448) |

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

##### searchBackwardsForOpenTag()

> `private` **searchBackwardsForOpenTag**(`document`, `position`): `null` \| \{ `char`: `number`; `line`: `number`; \}

Defined in: [providers/completion.ts:330](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L330)

Searches backwards for an unclosed opening tag.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `position` | `Position` |

###### Returns

`null` \| \{ `char`: `number`; `line`: `number`; \}

##### setCompletionItemDetails()

> `private` **setCompletionItemDetails**(`item`, `element`, `originalBestSelector`): `void`

Defined in: [providers/completion.ts:926](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L926)

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

Defined in: [providers/completion.ts:541](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L541)

Sorts element entries based on context if needed.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementEntries` | `object`[] |
| `contextData` | `CompletionContextData` |

###### Returns

`object`[]

##### validateAndReturnTagContext()

> `private` **validateAndReturnTagContext**(`tagContent`): `null` \| \{ `isNewTag`: `boolean`; `tagContent`: `string`; \}

Defined in: [providers/completion.ts:290](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/completion.ts#L290)

Validates tag content and returns context if valid.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tagContent` | `string` |

###### Returns

`null` \| \{ `isNewTag`: `boolean`; `tagContent`: `string`; \}
