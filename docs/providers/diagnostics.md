[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/diagnostics

# providers/diagnostics

Angular Auto-Import Diagnostic Provider

## Classes

### DiagnosticProvider

Defined in: [providers/diagnostics.ts:45](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L45)

Provides diagnostics for Angular templates.

#### Constructors

##### Constructor

> **new DiagnosticProvider**(`context`): [`DiagnosticProvider`](#diagnosticprovider)

Defined in: [providers/diagnostics.ts:60](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L60)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`DiagnosticProvider`](#diagnosticprovider)

#### Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="candidatediagnostics"></a> `candidateDiagnostics` | `private` | `Map`\<`string`, `Diagnostic`[]\> | `undefined` | - | [providers/diagnostics.ts:48](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L48) |
| <a id="compiler"></a> `compiler` | `private` | `any` | `null` | - | [providers/diagnostics.ts:52](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L52) |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | `undefined` | - | [providers/diagnostics.ts:60](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L60) |
| <a id="diagnosticcollection"></a> `diagnosticCollection` | `private` | `DiagnosticCollection` | `undefined` | - | [providers/diagnostics.ts:46](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L46) |
| <a id="disposables"></a> `disposables` | `private` | `Disposable`[] | `[]` | - | [providers/diagnostics.ts:47](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L47) |
| <a id="importedelementscache"></a> `importedElementsCache` | `private` | `Map`\<`string`, `Map`\<`string`, `boolean`\>\> | `undefined` | Cache for storing whether a specific Angular element (component, directive, pipe) is imported in a given TypeScript component file. Key: path to the TypeScript component file. Value: Map where key is the Angular element name (e.g., 'MyComponent') and value is a boolean indicating if it's imported. | [providers/diagnostics.ts:58](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L58) |
| <a id="templatecache"></a> `templateCache` | `private` | `Map`\<`string`, \{ `nodes`: `unknown`[]; `version`: `number`; \}\> | `undefined` | - | [providers/diagnostics.ts:49](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L49) |

#### Methods

##### \_findPipesInExpression()

> `private` **\_findPipesInExpression**(`expressionText`, `document`, `baseOffset`, `valueOffset`): [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[]

Defined in: [providers/diagnostics.ts:781](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L781)

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

Defined in: [providers/diagnostics.ts:68](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L68)

Activates the diagnostic provider.

###### Returns

`void`

##### addAngularElementsToList()

> `private` **addAngularElementsToList**(`node`, `nodeName`, `foundElements`, `elements`, `document`, `offset`, `attributes`): `void`

Defined in: [providers/diagnostics.ts:1173](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1173)

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

Defined in: [providers/diagnostics.ts:913](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L913)

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

Defined in: [providers/diagnostics.ts:494](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L494)

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

Defined in: [providers/diagnostics.ts:939](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L939)

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

Defined in: [providers/diagnostics.ts:253](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L253)

Clears diagnostics for a document.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`void`

##### clearDiagnosticsForNoTemplate()

> `private` **clearDiagnosticsForNoTemplate**(`document`): `void`

Defined in: [providers/diagnostics.ts:334](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L334)

Clears diagnostics when no template is found.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`void`

##### createMissingImportDiagnostic()

> `private` **createMissingImportDiagnostic**(`element`, `candidate`, `specificSelector`, `severity`): `Diagnostic`

Defined in: [providers/diagnostics.ts:658](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L658)

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

Defined in: [providers/diagnostics.ts:136](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L136)

Deactivates the diagnostic provider.

###### Returns

`void`

##### extractInlineTemplate()

> `private` **extractInlineTemplate**(`_document`, `sourceFile`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:699](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L699)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `_document` | `TextDocument` |
| `sourceFile` | `SourceFile` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### extractTemplateFromClass()

> `private` **extractTemplateFromClass**(`classDeclaration`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:715](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L715)

Extracts template from a class declaration.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDeclaration` | `ClassDeclaration` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### extractTemplateFromObjectLiteral()

> `private` **extractTemplateFromObjectLiteral**(`objectLiteral`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:751](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L751)

Extracts template from an object literal expression.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `objectLiteral` | `ObjectLiteralExpression` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### forceUpdateDiagnosticsForFile()

> **forceUpdateDiagnosticsForFile**(`filePath`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:192](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L192)

Public method to force-update diagnostics for a file.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`Promise`\<`void`\>

##### getComponentDecoratorObjectLiteral()

> `private` **getComponentDecoratorObjectLiteral**(`componentDecorator`): `null` \| `ObjectLiteralExpression`

Defined in: [providers/diagnostics.ts:734](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L734)

Gets the object literal from a Component decorator.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `componentDecorator` | `Decorator` |

###### Returns

`null` \| `ObjectLiteralExpression`

##### getComponentImportsArray()

> `private` **getComponentImportsArray**(`classDeclaration`): `undefined` \| `ArrayLiteralExpression`

Defined in: [providers/diagnostics.ts:888](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L888)

Gets the imports array from a Component decorator.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDeclaration` | `ClassDeclaration` |

###### Returns

`undefined` \| `ArrayLiteralExpression`

##### getImportFromCache()

> `private` **getImportFromCache**(`cacheKey`, `elementName`): `undefined` \| `boolean`

Defined in: [providers/diagnostics.ts:868](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L868)

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

Defined in: [providers/diagnostics.ts:623](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L623)

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

> `private` **getProjectContextForDocument**(`document`): `undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

Defined in: [providers/diagnostics.ts:801](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L801)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

##### getSeverityFromConfig()

> `private` **getSeverityFromConfig**(`severityLevel`): `DiagnosticSeverity`

Defined in: [providers/diagnostics.ts:1330](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1330)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `severityLevel` | `string` |

###### Returns

`DiagnosticSeverity`

##### getSourceFile()

> `private` **getSourceFile**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/diagnostics.ts:672](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L672)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### getTsDocument()

> `private` **getTsDocument**(`document`, `componentPath`): `Promise`\<`null` \| `TextDocument`\>

Defined in: [providers/diagnostics.ts:824](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L824)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `componentPath` | `string` |

###### Returns

`Promise`\<`null` \| `TextDocument`\>

##### hasChildren()

> `private` **hasChildren**(`node`): `boolean`

Defined in: [providers/diagnostics.ts:1325](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1325)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | `unknown` |

###### Returns

`boolean`

##### isControlFlowNode()

> `private` **isControlFlowNode**(`nodeName`): `boolean`

Defined in: [providers/diagnostics.ts:1022](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1022)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `nodeName` | `string` |

###### Returns

`boolean`

##### isElementImported()

> `private` **isElementImported**(`sourceFile`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:840](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L840)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`boolean`

##### isValidTemplateInitializer()

> `private` **isValidTemplateInitializer**(`initializer`): initializer is StringLiteral \| NoSubstitutionTemplateLiteral

Defined in: [providers/diagnostics.ts:772](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L772)

Checks if an initializer is a valid template initializer.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `initializer` | `undefined` \| `Node`\<`Node`\> |

###### Returns

initializer is StringLiteral \| NoSubstitutionTemplateLiteral

##### loadCompiler()

> `private` **loadCompiler**(): `void`

Defined in: [providers/diagnostics.ts:1356](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1356)

###### Returns

`void`

##### logCheckElementDuration()

> `private` **logCheckElementDuration**(`elementName`, `startTime`): `void`

Defined in: [providers/diagnostics.ts:652](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L652)

Logs the duration of checkElement operation.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elementName` | `string` |
| `startTime` | `bigint` |

###### Returns

`void`

##### logDiagnosticsDuration()

> `private` **logDiagnosticsDuration**(`fileName`, `startTime`): `void`

Defined in: [providers/diagnostics.ts:346](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L346)

Logs the duration of diagnostics operation.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `fileName` | `string` |
| `startTime` | `bigint` |

###### Returns

`void`

##### parseCompleteTemplate()

> `private` **parseCompleteTemplate**(`text`, `document`, `offset`, `indexer`): `ParsedHtmlFullElement`[]

Defined in: [providers/diagnostics.ts:398](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L398)

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

> `private` **processAttributes**(`regularAttrs`, `templateAttrs`, `nodeName`, `attributes`, `elements`, `document`, `offset`, `text`, `TmplAstBoundEvent`, `TmplAstReference`, `TmplAstBoundAttribute`): `void`

Defined in: [providers/diagnostics.ts:1204](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1204)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `regularAttrs` | `unknown`[] |
| `templateAttrs` | `unknown`[] |
| `nodeName` | `string` |
| `attributes` | `object`[] |
| `elements` | [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[] |
| `document` | `TextDocument` |
| `offset` | `number` |
| `text` | `string` |
| `TmplAstBoundEvent` | (...`args`) => [`TmplAstBoundEvent`](../types/template-ast.md#tmplastboundevent) |
| `TmplAstReference` | (...`args`) => [`TmplAstReference`](../types/template-ast.md#tmplastreference) |
| `TmplAstBoundAttribute` | (...`args`) => [`TmplAstBoundAttribute`](../types/template-ast.md#tmplastboundattribute) |

###### Returns

`void`

##### processBoundTextNode()

> `private` **processBoundTextNode**(`node`, `elements`, `document`, `offset`, `text`): `void`

Defined in: [providers/diagnostics.ts:1304](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1304)

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

Defined in: [providers/diagnostics.ts:1062](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1062)

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

Defined in: [providers/diagnostics.ts:1090](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1090)

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

Defined in: [providers/diagnostics.ts:547](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L547)

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

Defined in: [providers/diagnostics.ts:1076](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1076)

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

Defined in: [providers/diagnostics.ts:1050](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1050)

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

Defined in: [providers/diagnostics.ts:1028](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1028)

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

Defined in: [providers/diagnostics.ts:1103](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1103)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `controlFlowNode` | [`ControlFlowNode`](../types/template-ast.md#controlflownode) |
| `visit` | (`nodesList`) => `void` |

###### Returns

`void`

##### processElementOrTemplateNode()

> `private` **processElementOrTemplateNode**(`node`, `elements`, `document`, `offset`, `text`, `indexer`, `TmplAstTemplate`, `TmplAstBoundEvent`, `TmplAstReference`, `TmplAstBoundAttribute`): `void`

Defined in: [providers/diagnostics.ts:1122](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1122)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TmplAstElement`](../types/template-ast.md#tmplastelement) \| [`TmplAstTemplate`](../types/template-ast.md#tmplasttemplate) |
| `elements` | [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[] |
| `document` | `TextDocument` |
| `offset` | `number` |
| `text` | `string` |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |
| `TmplAstTemplate` | (...`args`) => [`TmplAstTemplate`](../types/template-ast.md#tmplasttemplate) |
| `TmplAstBoundEvent` | (...`args`) => [`TmplAstBoundEvent`](../types/template-ast.md#tmplastboundevent) |
| `TmplAstReference` | (...`args`) => [`TmplAstReference`](../types/template-ast.md#tmplastreference) |
| `TmplAstBoundAttribute` | (...`args`) => [`TmplAstBoundAttribute`](../types/template-ast.md#tmplastboundattribute) |

###### Returns

`void`

##### processHtmlDocument()

> `private` **processHtmlDocument**(`document`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:261](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L261)

Processes HTML document diagnostics.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### processNonPipeCandidate()

> `private` **processNonPipeCandidate**(`element`, `candidate`, `severity`, `sourceFile`, `processedCandidates`, `CssSelector`, `SelectorMatcher`): `null` \| `Diagnostic`

Defined in: [providers/diagnostics.ts:593](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L593)

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

Defined in: [providers/diagnostics.ts:576](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L576)

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

> `private` **processSingleAttribute**(`attr`, `isTemplateAttr`, `nodeName`, `attributes`, `elements`, `document`, `offset`, `text`, `TmplAstBoundEvent`, `TmplAstReference`, `TmplAstBoundAttribute`): `void`

Defined in: [providers/diagnostics.ts:1241](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1241)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `attr` | `unknown` |
| `isTemplateAttr` | `boolean` |
| `nodeName` | `string` |
| `attributes` | `object`[] |
| `elements` | [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[] |
| `document` | `TextDocument` |
| `offset` | `number` |
| `text` | `string` |
| `TmplAstBoundEvent` | (...`args`) => [`TmplAstBoundEvent`](../types/template-ast.md#tmplastboundevent) |
| `TmplAstReference` | (...`args`) => [`TmplAstReference`](../types/template-ast.md#tmplastreference) |
| `TmplAstBoundAttribute` | (...`args`) => [`TmplAstBoundAttribute`](../types/template-ast.md#tmplastboundattribute) |

###### Returns

`void`

##### processTemplateNode()

> `private` **processTemplateNode**(`node`, `visit`, `extractPipesFromExpression`, `elements`, `document`, `offset`, `text`, `indexer`, `TmplAstElement`, `TmplAstTemplate`, `TmplAstBoundEvent`, `TmplAstReference`, `TmplAstBoundAttribute`, `TmplAstBoundText`): `void`

Defined in: [providers/diagnostics.ts:972](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L972)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TemplateAstNode`](../types/template-ast.md#templateastnode) |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |
| `elements` | [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[] |
| `document` | `TextDocument` |
| `offset` | `number` |
| `text` | `string` |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |
| `TmplAstElement` | (...`args`) => [`TmplAstElement`](../types/template-ast.md#tmplastelement) |
| `TmplAstTemplate` | (...`args`) => [`TmplAstTemplate`](../types/template-ast.md#tmplasttemplate) |
| `TmplAstBoundEvent` | (...`args`) => [`TmplAstBoundEvent`](../types/template-ast.md#tmplastboundevent) |
| `TmplAstReference` | (...`args`) => [`TmplAstReference`](../types/template-ast.md#tmplastreference) |
| `TmplAstBoundAttribute` | (...`args`) => [`TmplAstBoundAttribute`](../types/template-ast.md#tmplastboundattribute) |
| `TmplAstBoundText` | (...`args`) => [`TmplAstBoundText`](../types/template-ast.md#tmplastboundtext) |

###### Returns

`void`

##### processTypescriptDocument()

> `private` **processTypescriptDocument**(`document`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:291](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L291)

Processes TypeScript document diagnostics.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### publishFilteredDiagnostics()

> `private` **publishFilteredDiagnostics**(`uri`): `void`

Defined in: [providers/diagnostics.ts:1343](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1343)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `uri` | `Uri` |

###### Returns

`void`

##### runDiagnostics()

> `private` **runDiagnostics**(`templateText`, `document`, `offset`, `_componentPath`, `_tsDocument`, `sourceFile`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:352](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L352)

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

Defined in: [providers/diagnostics.ts:537](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L537)

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

Defined in: [providers/diagnostics.ts:321](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L321)

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

Defined in: [providers/diagnostics.ts:233](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L233)

Updates diagnostics for a document.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### updateImportCache()

> `private` **updateImportCache**(`cacheKey`, `elementName`, `isImported`): `void`

Defined in: [providers/diagnostics.ts:876](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L876)

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

Defined in: [providers/diagnostics.ts:149](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L149)

Updates diagnostics for related HTML files when a TypeScript file changes.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tsDocument` | `TextDocument` |

###### Returns

`Promise`\<`void`\>
