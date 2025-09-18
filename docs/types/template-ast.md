[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / types/template-ast

# types/template-ast

Basic type definitions for Angular template AST nodes.
These are simplified interfaces for the Angular template parser AST.

## Interfaces

### ControlFlowNode

Defined in: [types/template-ast.ts:78](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L78)

Angular template control flow node (for @if, @for, @switch).

#### Extends

- [`TemplateAstNode`](#templateastnode)

#### Properties

| Property | Type | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="branches"></a> `branches?` | `ControlFlowBranch`[] | - | - | [types/template-ast.ts:81](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L81) |
| <a id="cases"></a> `cases?` | `ControlFlowCase`[] | - | - | [types/template-ast.ts:82](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L82) |
| <a id="children"></a> `children?` | [`TemplateAstNode`](#templateastnode)[] | [`TemplateAstNode`](#templateastnode).[`children`](#children-1) | - | [types/template-ast.ts:80](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L80) |
| <a id="constructor"></a> `constructor` | `object` | - | [`TemplateAstNode`](#templateastnode).[`constructor`](#constructor-1) | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| `constructor.name` | `string` | - | - | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| <a id="empty"></a> `empty?` | `object` | - | - | [types/template-ast.ts:83](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L83) |
| `empty.children?` | [`TemplateAstNode`](#templateastnode)[] | - | - | [types/template-ast.ts:83](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L83) |
| <a id="expression"></a> `expression?` | `unknown` | - | - | [types/template-ast.ts:79](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L79) |
| <a id="sourcespan"></a> `sourceSpan?` | `object` | - | [`TemplateAstNode`](#templateastnode).[`sourceSpan`](#sourcespan-1) | [types/template-ast.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L13) |
| `sourceSpan.end` | `object` | - | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.end.offset` | `number` | - | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.start` | `object` | - | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| `sourceSpan.start.offset` | `number` | - | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |

***

### TemplateAstNode

Defined in: [types/template-ast.ts:10](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L10)

Base interface for Angular template AST nodes.

#### Extended by

- [`TmplAstElement`](#tmplastelement)
- [`TmplAstTemplate`](#tmplasttemplate)
- [`TmplAstBoundEvent`](#tmplastboundevent)
- [`TmplAstReference`](#tmplastreference)
- [`TmplAstBoundAttribute`](#tmplastboundattribute)
- [`TmplAstBoundText`](#tmplastboundtext)
- [`ControlFlowNode`](#controlflownode)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="children-1"></a> `children?` | [`TemplateAstNode`](#templateastnode)[] | [types/template-ast.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L12) |
| <a id="constructor-1"></a> `constructor` | `object` | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| `constructor.name` | `string` | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| <a id="sourcespan-1"></a> `sourceSpan?` | `object` | [types/template-ast.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L13) |
| `sourceSpan.end` | `object` | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.end.offset` | `number` | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.start` | `object` | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| `sourceSpan.start.offset` | `number` | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |

***

### TmplAstBoundAttribute

Defined in: [types/template-ast.ts:63](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L63)

Angular template bound attribute node.

#### Extends

- [`TemplateAstNode`](#templateastnode)

#### Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="children-2"></a> `children?` | [`TemplateAstNode`](#templateastnode)[] | [`TemplateAstNode`](#templateastnode).[`children`](#children-1) | [types/template-ast.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L12) |
| <a id="constructor-2"></a> `constructor` | `object` | [`TemplateAstNode`](#templateastnode).[`constructor`](#constructor-1) | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| `constructor.name` | `string` | - | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| <a id="name"></a> `name` | `string` | - | [types/template-ast.ts:64](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L64) |
| <a id="sourcespan-2"></a> `sourceSpan?` | `object` | [`TemplateAstNode`](#templateastnode).[`sourceSpan`](#sourcespan-1) | [types/template-ast.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L13) |
| `sourceSpan.end` | `object` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.end.offset` | `number` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.start` | `object` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| `sourceSpan.start.offset` | `number` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| <a id="value"></a> `value?` | `unknown` | - | [types/template-ast.ts:65](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L65) |

***

### TmplAstBoundEvent

Defined in: [types/template-ast.ts:45](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L45)

Angular template bound event node.

#### Extends

- [`TemplateAstNode`](#templateastnode)

#### Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="children-3"></a> `children?` | [`TemplateAstNode`](#templateastnode)[] | [`TemplateAstNode`](#templateastnode).[`children`](#children-1) | [types/template-ast.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L12) |
| <a id="constructor-3"></a> `constructor` | `object` | [`TemplateAstNode`](#templateastnode).[`constructor`](#constructor-1) | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| `constructor.name` | `string` | - | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| <a id="handler"></a> `handler?` | `unknown` | - | [types/template-ast.ts:49](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L49) |
| <a id="name-1"></a> `name` | `string` | - | [types/template-ast.ts:46](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L46) |
| <a id="phase"></a> `phase?` | `string` | - | [types/template-ast.ts:48](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L48) |
| <a id="sourcespan-3"></a> `sourceSpan?` | `object` | [`TemplateAstNode`](#templateastnode).[`sourceSpan`](#sourcespan-1) | [types/template-ast.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L13) |
| `sourceSpan.end` | `object` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.end.offset` | `number` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.start` | `object` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| `sourceSpan.start.offset` | `number` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| <a id="target"></a> `target?` | `string` | - | [types/template-ast.ts:47](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L47) |

***

### TmplAstBoundText

Defined in: [types/template-ast.ts:71](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L71)

Angular template bound text node.

#### Extends

- [`TemplateAstNode`](#templateastnode)

#### Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="children-4"></a> `children?` | [`TemplateAstNode`](#templateastnode)[] | [`TemplateAstNode`](#templateastnode).[`children`](#children-1) | [types/template-ast.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L12) |
| <a id="constructor-4"></a> `constructor` | `object` | [`TemplateAstNode`](#templateastnode).[`constructor`](#constructor-1) | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| `constructor.name` | `string` | - | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| <a id="sourcespan-4"></a> `sourceSpan?` | `object` | [`TemplateAstNode`](#templateastnode).[`sourceSpan`](#sourcespan-1) | [types/template-ast.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L13) |
| `sourceSpan.end` | `object` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.end.offset` | `number` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.start` | `object` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| `sourceSpan.start.offset` | `number` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| <a id="value-1"></a> `value?` | `unknown` | - | [types/template-ast.ts:72](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L72) |

***

### TmplAstElement

Defined in: [types/template-ast.ts:22](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L22)

Angular template element node.

#### Extends

- [`TemplateAstNode`](#templateastnode)

#### Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attributes"></a> `attributes?` | `unknown`[] | - | [types/template-ast.ts:24](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L24) |
| <a id="children-5"></a> `children?` | [`TemplateAstNode`](#templateastnode)[] | [`TemplateAstNode`](#templateastnode).[`children`](#children-1) | [types/template-ast.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L12) |
| <a id="constructor-5"></a> `constructor` | `object` | [`TemplateAstNode`](#templateastnode).[`constructor`](#constructor-1) | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| `constructor.name` | `string` | - | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| <a id="inputs"></a> `inputs?` | `unknown`[] | - | [types/template-ast.ts:25](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L25) |
| <a id="name-2"></a> `name` | `string` | - | [types/template-ast.ts:23](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L23) |
| <a id="outputs"></a> `outputs?` | `unknown`[] | - | [types/template-ast.ts:26](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L26) |
| <a id="references"></a> `references?` | `unknown`[] | - | [types/template-ast.ts:27](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L27) |
| <a id="sourcespan-5"></a> `sourceSpan?` | `object` | [`TemplateAstNode`](#templateastnode).[`sourceSpan`](#sourcespan-1) | [types/template-ast.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L13) |
| `sourceSpan.end` | `object` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.end.offset` | `number` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.start` | `object` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| `sourceSpan.start.offset` | `number` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |

***

### TmplAstReference

Defined in: [types/template-ast.ts:55](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L55)

Angular template reference node.

#### Extends

- [`TemplateAstNode`](#templateastnode)

#### Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="children-6"></a> `children?` | [`TemplateAstNode`](#templateastnode)[] | [`TemplateAstNode`](#templateastnode).[`children`](#children-1) | [types/template-ast.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L12) |
| <a id="constructor-6"></a> `constructor` | `object` | [`TemplateAstNode`](#templateastnode).[`constructor`](#constructor-1) | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| `constructor.name` | `string` | - | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| <a id="name-3"></a> `name` | `string` | - | [types/template-ast.ts:56](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L56) |
| <a id="sourcespan-6"></a> `sourceSpan?` | `object` | [`TemplateAstNode`](#templateastnode).[`sourceSpan`](#sourcespan-1) | [types/template-ast.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L13) |
| `sourceSpan.end` | `object` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.end.offset` | `number` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.start` | `object` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| `sourceSpan.start.offset` | `number` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| <a id="value-2"></a> `value?` | `string` | - | [types/template-ast.ts:57](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L57) |

***

### TmplAstTemplate

Defined in: [types/template-ast.ts:33](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L33)

Angular template template node (ng-template).

#### Extends

- [`TemplateAstNode`](#templateastnode)

#### Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attributes-1"></a> `attributes?` | `unknown`[] | - | [types/template-ast.ts:35](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L35) |
| <a id="children-7"></a> `children?` | [`TemplateAstNode`](#templateastnode)[] | [`TemplateAstNode`](#templateastnode).[`children`](#children-1) | [types/template-ast.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L12) |
| <a id="constructor-7"></a> `constructor` | `object` | [`TemplateAstNode`](#templateastnode).[`constructor`](#constructor-1) | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| `constructor.name` | `string` | - | [types/template-ast.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L11) |
| <a id="inputs-1"></a> `inputs?` | `unknown`[] | - | [types/template-ast.ts:36](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L36) |
| <a id="outputs-1"></a> `outputs?` | `unknown`[] | - | [types/template-ast.ts:37](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L37) |
| <a id="references-1"></a> `references?` | `unknown`[] | - | [types/template-ast.ts:38](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L38) |
| <a id="sourcespan-7"></a> `sourceSpan?` | `object` | [`TemplateAstNode`](#templateastnode).[`sourceSpan`](#sourcespan-1) | [types/template-ast.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L13) |
| `sourceSpan.end` | `object` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.end.offset` | `number` | - | [types/template-ast.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L15) |
| `sourceSpan.start` | `object` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| `sourceSpan.start.offset` | `number` | - | [types/template-ast.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L14) |
| <a id="tagname"></a> `tagName` | `string` | - | [types/template-ast.ts:34](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L34) |
| <a id="variables"></a> `variables?` | `unknown`[] | - | [types/template-ast.ts:39](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/template-ast.ts#L39) |
