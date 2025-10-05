[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/diagnostics

# providers/diagnostics

Angular Auto-Import Diagnostic Provider

## Classes

### DiagnosticProvider

Defined in: [providers/diagnostics.ts:101](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L101)

Provides diagnostics for Angular templates.

#### Constructors

##### Constructor

> **new DiagnosticProvider**(`context`): [`DiagnosticProvider`](#diagnosticprovider)

Defined in: [providers/diagnostics.ts:115](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L115)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`DiagnosticProvider`](#diagnosticprovider)

#### Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="candidatediagnostics"></a> `candidateDiagnostics` | `private` | `Map`\<`string`, `Diagnostic`[]\> | `undefined` | - | [providers/diagnostics.ts:104](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L104) |
| <a id="compiler"></a> `compiler` | `private` | `any` | `null` | - | [providers/diagnostics.ts:107](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L107) |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | `undefined` | - | [providers/diagnostics.ts:115](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L115) |
| <a id="diagnosticcollection"></a> `diagnosticCollection` | `private` | `DiagnosticCollection` | `undefined` | - | [providers/diagnostics.ts:102](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L102) |
| <a id="disposables"></a> `disposables` | `private` | `Disposable`[] | `[]` | - | [providers/diagnostics.ts:103](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L103) |
| <a id="importedelementscache"></a> `importedElementsCache` | `private` | `Map`\<`string`, `Map`\<`string`, `boolean`\>\> | `undefined` | Cache for storing whether a specific Angular element (component, directive, pipe) is imported in a given TypeScript component file. Key: path to the TypeScript component file. Value: Map where key is the Angular element name (e.g., 'MyComponent') and value is a boolean indicating if it's imported. | [providers/diagnostics.ts:113](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L113) |
| <a id="templatecache"></a> `templateCache` | `private` | `Map`\<`string`, \{ `nodes`: `unknown`[]; `version`: `number`; \}\> | `undefined` | - | [providers/diagnostics.ts:105](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L105) |

#### Methods

##### \_findPipesInExpression()

> `private` **\_findPipesInExpression**(`expressionText`, `document`, `baseOffset`, `valueOffset`): [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[]

Defined in: [providers/diagnostics.ts:824](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L824)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `expressionText` | `string` |
| `document` | `TextDocument` |
| `baseOffset` | `number` |
| `valueOffset` | `number` |

###### Returns

[`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[]

##### activate()

> **activate**(): `void`

Defined in: [providers/diagnostics.ts:123](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L123)

Activates the diagnostic provider.

###### Returns

`void`

##### addAngularElementsToList()

> `private` **addAngularElementsToList**(`node`, `nodeName`, `foundElements`, `elements`, `document`, `offset`, `attributes`): `void`

Defined in: [providers/diagnostics.ts:1164](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1164)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TmplAstElement`](../types/template-ast.md#tmplastelement) \| [`TmplAstTemplate`](../types/template-ast.md#tmplasttemplate) |
| `nodeName` | `string` |
| `foundElements` | [`AngularElementData`](../types/angular.md#angularelementdata)[] |
| `elements` | [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[] |
| `document` | `TextDocument` |
| `offset` | `number` |
| `attributes` | `object`[] |

###### Returns

`void`

##### checkDirectElementImport()

> `private` **checkDirectElementImport**(`sourceFile`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:921](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L921)

Checks if element is directly imported in the Component imports array.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`boolean`

##### checkElement()

> `private` **checkElement**(`element`, `indexer`, `severity`, `sourceFile`, `CssSelector`, `SelectorMatcher`): `Promise`\<`Diagnostic`[]\>

Defined in: [providers/diagnostics.ts:546](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L546)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |
| `severity` | `DiagnosticSeverity` |
| `sourceFile` | `SourceFile` |
| `CssSelector` | `any` |
| `SelectorMatcher` | `any` |

###### Returns

`Promise`\<`Diagnostic`[]\>

##### checkExternalModuleImports()

> `private` **checkExternalModuleImports**(`sourceFile`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:947](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L947)

Checks if element is imported via external modules.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`boolean`

##### clearDiagnostics()

> `private` **clearDiagnostics**(`document`): `void`

Defined in: [providers/diagnostics.ts:308](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L308)

Clears diagnostics for a document.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`void`

##### clearDiagnosticsForNoTemplate()

> `private` **clearDiagnosticsForNoTemplate**(`document`): `void`

Defined in: [providers/diagnostics.ts:389](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L389)

Clears diagnostics when no template is found.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`void`

##### createMissingImportDiagnostic()

> `private` **createMissingImportDiagnostic**(`element`, `candidate`, `specificSelector`, `severity`): `Diagnostic`

Defined in: [providers/diagnostics.ts:701](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L701)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `specificSelector` | `string` |
| `severity` | `DiagnosticSeverity` |

###### Returns

`Diagnostic`

##### deactivate()

> **deactivate**(): `void`

Defined in: [providers/diagnostics.ts:191](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L191)

Deactivates the diagnostic provider.

###### Returns

`void`

##### extractInlineTemplate()

> `private` **extractInlineTemplate**(`_document`, `sourceFile`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:742](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L742)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `_document` | `TextDocument` |
| `sourceFile` | `SourceFile` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### extractTemplateFromClass()

> `private` **extractTemplateFromClass**(`classDeclaration`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:758](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L758)

Extracts template from a class declaration.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDeclaration` | `ClassDeclaration` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### extractTemplateFromObjectLiteral()

> `private` **extractTemplateFromObjectLiteral**(`objectLiteral`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:794](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L794)

Extracts template from an object literal expression.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `objectLiteral` | `ObjectLiteralExpression` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### forceUpdateDiagnosticsForFile()

> **forceUpdateDiagnosticsForFile**(`filePath`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:247](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L247)

Public method to force-update diagnostics for a file.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`Promise`\<`void`\>

##### getComponentDecoratorObjectLiteral()

> `private` **getComponentDecoratorObjectLiteral**(`componentDecorator`): `null` \| `ObjectLiteralExpression`

Defined in: [providers/diagnostics.ts:777](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L777)

Gets the object literal from a Component decorator.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `componentDecorator` | `Decorator` |

###### Returns

`null` \| `ObjectLiteralExpression`

##### getComponentImportsArray()

> `private` **getComponentImportsArray**(`classDeclaration`): `undefined` \| `ArrayLiteralExpression`

Defined in: [providers/diagnostics.ts:896](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L896)

Gets the imports array from a Component decorator.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDeclaration` | `ClassDeclaration` |

###### Returns

`undefined` \| `ArrayLiteralExpression`

##### getImportFromCache()

> `private` **getImportFromCache**(`cacheKey`, `elementName`): `undefined` \| `boolean`

Defined in: [providers/diagnostics.ts:876](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L876)

Gets import status from cache.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cacheKey` | `string` |
| `elementName` | `string` |

###### Returns

`undefined` \| `boolean`

##### getMatchedSelectors()

> `private` **getMatchedSelectors**(`element`, `candidate`, `CssSelector`, `SelectorMatcher`): `string`[]

Defined in: [providers/diagnostics.ts:675](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L675)

Gets matched selectors for an element and candidate.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `CssSelector` | `any` |
| `SelectorMatcher` | `any` |

###### Returns

`string`[]

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): `undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

Defined in: [providers/diagnostics.ts:844](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L844)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

##### getSeverityFromConfig()

> `private` **getSeverityFromConfig**(`severityLevel`): `DiagnosticSeverity`

Defined in: [providers/diagnostics.ts:1326](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1326)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `severityLevel` | `string` |

###### Returns

`DiagnosticSeverity`

##### getSourceFile()

> `private` **getSourceFile**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/diagnostics.ts:715](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L715)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### hasChildren()

> `private` **hasChildren**(`node`): `boolean`

Defined in: [providers/diagnostics.ts:1321](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1321)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | `unknown` |

###### Returns

`boolean`

##### isControlFlowNode()

> `private` **isControlFlowNode**(`nodeName`): `boolean`

Defined in: [providers/diagnostics.ts:1016](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1016)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `nodeName` | `string` |

###### Returns

`boolean`

##### isElementImported()

> `private` **isElementImported**(`sourceFile`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:848](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L848)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`boolean`

##### isValidTemplateInitializer()

> `private` **isValidTemplateInitializer**(`initializer`): initializer is StringLiteral \| NoSubstitutionTemplateLiteral

Defined in: [providers/diagnostics.ts:815](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L815)

Checks if an initializer is a valid template initializer.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `initializer` | `undefined` \| `Node`\<`Node`\> |

###### Returns

initializer is StringLiteral \| NoSubstitutionTemplateLiteral

##### loadCompiler()

> `private` **loadCompiler**(): `void`

Defined in: [providers/diagnostics.ts:1352](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1352)

###### Returns

`void`

##### logOperationDuration()

> `private` **logOperationDuration**(`operation`, `identifier`, `startTime`): `void`

Defined in: [providers/diagnostics.ts:401](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L401)

Logs the duration of an operation.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `operation` | `string` |
| `identifier` | `string` |
| `startTime` | `bigint` |

###### Returns

`void`

##### parseCompleteTemplate()

> `private` **parseCompleteTemplate**(`text`, `document`, `offset`, `indexer`): `ParsedHtmlFullElement`[]

Defined in: [providers/diagnostics.ts:453](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L453)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `text` | `string` |
| `document` | `TextDocument` |
| `offset` | `number` |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |

###### Returns

`ParsedHtmlFullElement`[]

##### processAttributes()

> `private` **processAttributes**(`regularAttrs`, `templateAttrs`, `nodeName`, `attributes`, `processingCtx`, `docCtx`, `astCtors`): `void`

Defined in: [providers/diagnostics.ts:1205](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1205)

Processes attributes from element or template nodes

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `regularAttrs` | `unknown`[] | Regular attributes array |
| `templateAttrs` | `unknown`[] | Template attributes array |
| `nodeName` | `string` | Name of the node |
| `attributes` | `object`[] | Parsed attributes array |
| `processingCtx` | `ProcessingContext` | Processing context |
| `docCtx` | `TemplateDocumentContext` | Document context |
| `astCtors` | `AstConstructors` | AST constructors |

###### Returns

`void`

##### processBoundTextNode()

> `private` **processBoundTextNode**(`node`, `elements`, `document`, `offset`, `text`): `void`

Defined in: [providers/diagnostics.ts:1300](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1300)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TmplAstBoundText`](../types/template-ast.md#tmplastboundtext) |
| `elements` | [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[] |
| `document` | `TextDocument` |
| `offset` | `number` |
| `text` | `string` |

###### Returns

`void`

##### processBranchesArray()

> `private` **processBranchesArray**(`branches`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1056](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1056)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `branches` | `unknown` |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |

###### Returns

`void`

##### processBranchOrCase()

> `private` **processBranchOrCase**(`item`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1084](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1084)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `item` | \{ `children?`: [`TemplateAstNode`](../types/template-ast.md#templateastnode)[]; `expression?`: `unknown`; \} |
| `item.children?` | [`TemplateAstNode`](../types/template-ast.md#templateastnode)[] |
| `item.expression?` | `unknown` |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |

###### Returns

`void`

##### processCandidateElement()

> `private` **processCandidateElement**(`element`, `candidate`, `severity`, `sourceFile`, `processedCandidates`, `CssSelector`, `SelectorMatcher`): `Promise`\<`null` \| `Diagnostic`\>

Defined in: [providers/diagnostics.ts:599](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L599)

Processes a single candidate element.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `severity` | `DiagnosticSeverity` |
| `sourceFile` | `SourceFile` |
| `processedCandidates` | `Set`\<`string`\> |
| `CssSelector` | `any` |
| `SelectorMatcher` | `any` |

###### Returns

`Promise`\<`null` \| `Diagnostic`\>

##### processCasesArray()

> `private` **processCasesArray**(`cases`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1070](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1070)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cases` | `unknown` |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |

###### Returns

`void`

##### processControlFlowBranchesAndCases()

> `private` **processControlFlowBranchesAndCases**(`controlFlowNode`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1044](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1044)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `controlFlowNode` | [`ControlFlowNode`](../types/template-ast.md#controlflownode) |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |

###### Returns

`void`

##### processControlFlowNode()

> `private` **processControlFlowNode**(`controlFlowNode`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1022](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1022)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `controlFlowNode` | [`ControlFlowNode`](../types/template-ast.md#controlflownode) |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |

###### Returns

`void`

##### processControlFlowSpecialBlocks()

> `private` **processControlFlowSpecialBlocks**(`controlFlowNode`, `visit`): `void`

Defined in: [providers/diagnostics.ts:1097](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1097)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `controlFlowNode` | [`ControlFlowNode`](../types/template-ast.md#controlflownode) |
| `visit` | (`nodesList`) => `void` |

###### Returns

`void`

##### processElementOrTemplateNode()

> `private` **processElementOrTemplateNode**(`node`, `processingCtx`, `docCtx`, `astCtors`): `void`

Defined in: [providers/diagnostics.ts:1123](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1123)

Processes element or template nodes

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `node` | [`TmplAstElement`](../types/template-ast.md#tmplastelement) \| [`TmplAstTemplate`](../types/template-ast.md#tmplasttemplate) | The element or template node |
| `processingCtx` | `ProcessingContext` | Processing context |
| `docCtx` | `TemplateDocumentContext` | Document context |
| `astCtors` | `AstConstructors` | AST constructors |

###### Returns

`void`

##### processHtmlDocument()

> `private` **processHtmlDocument**(`document`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:316](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L316)

Processes HTML document diagnostics.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### processNonPipeCandidate()

> `private` **processNonPipeCandidate**(`element`, `candidate`, `severity`, `sourceFile`, `processedCandidates`, `CssSelector`, `SelectorMatcher`): `null` \| `Diagnostic`

Defined in: [providers/diagnostics.ts:645](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L645)

Processes a non-pipe candidate (component/directive).

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `severity` | `DiagnosticSeverity` |
| `sourceFile` | `SourceFile` |
| `processedCandidates` | `Set`\<`string`\> |
| `CssSelector` | `any` |
| `SelectorMatcher` | `any` |

###### Returns

`null` \| `Diagnostic`

##### processPipeCandidate()

> `private` **processPipeCandidate**(`element`, `candidate`, `severity`, `sourceFile`, `processedCandidates`): `null` \| `Diagnostic`

Defined in: [providers/diagnostics.ts:628](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L628)

Processes a pipe candidate.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `severity` | `DiagnosticSeverity` |
| `sourceFile` | `SourceFile` |
| `processedCandidates` | `Set`\<`string`\> |

###### Returns

`null` \| `Diagnostic`

##### processSingleAttribute()

> `private` **processSingleAttribute**(`attr`, `isTemplateAttr`, `nodeName`, `attributes`, `processingCtx`, `docCtx`, `astCtors`): `void`

Defined in: [providers/diagnostics.ts:1236](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1236)

Processes a single attribute

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `attr` | `unknown` | The attribute to process |
| `isTemplateAttr` | `boolean` | Whether this is a template attribute |
| `nodeName` | `string` | Name of the node |
| `attributes` | `object`[] | Parsed attributes array |
| `processingCtx` | `ProcessingContext` | Processing context |
| `docCtx` | `TemplateDocumentContext` | Document context |
| `astCtors` | `AstConstructors` | AST constructors |

###### Returns

`void`

##### processTemplateNode()

> `private` **processTemplateNode**(`node`, `processingCtx`, `docCtx`, `astCtors`): `void`

Defined in: [providers/diagnostics.ts:987](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L987)

Processes a template AST node

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `node` | [`TemplateAstNode`](../types/template-ast.md#templateastnode) | The template node to process |
| `processingCtx` | `ProcessingContext` | Processing context with callbacks and data structures |
| `docCtx` | `TemplateDocumentContext` | Document context for parsing |
| `astCtors` | `AstConstructors` | AST node constructors |

###### Returns

`void`

##### processTypescriptDocument()

> `private` **processTypescriptDocument**(`document`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:346](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L346)

Processes TypeScript document diagnostics.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### publishFilteredDiagnostics()

> `private` **publishFilteredDiagnostics**(`uri`): `void`

Defined in: [providers/diagnostics.ts:1339](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1339)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `uri` | `Uri` |

###### Returns

`void`

##### runDiagnostics()

> `private` **runDiagnostics**(`templateText`, `document`, `offset`, `_componentPath`, `_tsDocument`, `sourceFile`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:407](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L407)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `templateText` | `string` |
| `document` | `TextDocument` |
| `offset` | `number` |
| `_componentPath` | `string` |
| `_tsDocument` | `TextDocument` |
| `sourceFile` | `SourceFile` |

###### Returns

`Promise`\<`void`\>

##### shouldProcessCandidate()

> `private` **shouldProcessCandidate**(`candidate`, `processedCandidates`): `candidate is AngularElementData`

Defined in: [providers/diagnostics.ts:589](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L589)

Checks if a candidate should be processed.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `candidate` | `null` \| [`AngularElementData`](../types/angular.md#angularelementdata) |
| `processedCandidates` | `Set`\<`string`\> |

###### Returns

`candidate is AngularElementData`

##### shouldProcessDocument()

> `private` **shouldProcessDocument**(`sourceFile`, `document`): `boolean`

Defined in: [providers/diagnostics.ts:376](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L376)

Checks if document should be processed for diagnostics.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `document` | `TextDocument` |

###### Returns

`boolean`

##### updateDiagnostics()

> `private` **updateDiagnostics**(`document`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:288](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L288)

Updates diagnostics for a document.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### updateImportCache()

> `private` **updateImportCache**(`cacheKey`, `elementName`, `isImported`): `void`

Defined in: [providers/diagnostics.ts:884](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L884)

Updates import cache with result.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cacheKey` | `string` |
| `elementName` | `string` |
| `isImported` | `boolean` |

###### Returns

`void`

##### updateRelatedHtmlDiagnostics()

> `private` **updateRelatedHtmlDiagnostics**(`tsDocument`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:204](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L204)

Updates diagnostics for related HTML files when a TypeScript file changes.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tsDocument` | `TextDocument` |

###### Returns

`Promise`\<`void`\>
