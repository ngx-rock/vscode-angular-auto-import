[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / utils/angular

# utils/angular

Utilities for working with Angular elements and selectors.

## Functions

### generateImportStatement()

> **generateImportStatement**(`name`, `path`): `string`

Defined in: [utils/angular.ts:350](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/angular.ts#L350)

Generates an import statement for a given symbol and path.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the symbol to import (e.g., 'MyComponent'). |
| `path` | `string` | The path to import from (e.g., './my-component'). |

#### Returns

`string`

The generated import statement.

***

### getAngularElementAsync()

> **getAngularElementAsync**(`selector`, `indexer`): `Promise`\<`undefined` \| [`AngularElementData`](../types/angular.md#angularelementdata)\>

Defined in: [utils/angular.ts:212](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/angular.ts#L212)

Asynchronously gets the best matching Angular element for a given selector.
This function uses the Angular `SelectorMatcher` for precise matching.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selector` | `string` | The selector to find the best match for. |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) | An instance of the AngularIndexer to search for elements. |

#### Returns

`Promise`\<`undefined` \| [`AngularElementData`](../types/angular.md#angularelementdata)\>

A promise that resolves to the best matching `AngularElementData` or `undefined` if no match is found.

***

### getAngularElements()

> **getAngularElements**(`selector`, `indexer`): [`AngularElementData`](../types/angular.md#angularelementdata)[]

Defined in: [utils/angular.ts:122](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/angular.ts#L122)

Retrieves Angular elements that match a given selector.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selector` | `string` | The selector to search for. |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) | An instance of the AngularIndexer to search for elements. |

#### Returns

[`AngularElementData`](../types/angular.md#angularelementdata)[]

An array of `AngularElementData` that match the selector.

***

### isAngularFile()

> **isAngularFile**(`filePath`): `boolean`

Defined in: [utils/angular.ts:335](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/angular.ts#L335)

Checks if a file path corresponds to an Angular file type (component, directive, or pipe).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The path of the file to check. |

#### Returns

`boolean`

`true` if the file is an Angular file, `false` otherwise.

***

### isStandalone()

> **isStandalone**(`classDeclaration`): `boolean`

Defined in: [utils/angular.ts:446](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/angular.ts#L446)

Checks if an Angular component, directive, or pipe class is standalone.
Applies Angular v19+ default: if `standalone` flag is omitted, treats as standalone for Angular >= 19.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `classDeclaration` | `ClassDeclaration` | The ts-morph ClassDeclaration to check. |

#### Returns

`boolean`

`true` if the class is standalone, `false` otherwise.

***

### parseAngularSelector()

> **parseAngularSelector**(`selectorString`): `Promise`\<`string`[]\>

Defined in: [utils/angular.ts:27](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/angular.ts#L27)

Parses a complex Angular selector and returns an array of individual selectors.
This function uses the Angular compiler's `CssSelector.parse` for reliable parsing.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selectorString` | `string` | The complex selector string to parse. |

#### Returns

`Promise`\<`string`[]\>

A promise that resolves to an array of individual selectors.

#### Example

```typescript
const selectors = await parseAngularSelector('my-component[some-attribute], .another-class');
console.log(selectors); // ['my-component[some-attribute]', '.another-class']
```

***

### resolveRelativePath()

> **resolveRelativePath**(`from`, `to`): `string`

Defined in: [utils/angular.ts:361](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/angular.ts#L361)

Resolves the relative path from one file to another.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `from` | `string` | The absolute path of the file to import from. |
| `to` | `string` | The absolute path of the file to import to. |

#### Returns

`string`

The relative path from `from` to `to`.
