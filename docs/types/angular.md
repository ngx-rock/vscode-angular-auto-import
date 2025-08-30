[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / types/angular

# types/angular

Defines the core data types for Angular elements.

## Classes

### AngularElementData

Defined in: [types/angular.ts:46](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L46)

Represents data for an Angular element to be indexed.

#### Constructors

##### Constructor

> **new AngularElementData**(`path`, `name`, `type`, `originalSelector`, `selectors`, `isStandalone`, `isExternal`, `exportingModuleName?`): [`AngularElementData`](#angularelementdata)

Defined in: [types/angular.ts:56](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L56)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | The file path where the element is defined. |
| `name` | `string` | The name of the element's class. |
| `type` | `"directive"` \| `"pipe"` \| `"component"` | The type of the element. |
| `originalSelector` | `string` | The original selector of the element. |
| `selectors` | `string`[] | An array of possible selectors for the element. |
| `isStandalone` | `boolean` | Indicates if the element is standalone. |
| `isExternal` | `boolean` | - |
| `exportingModuleName?` | `string` | The name of the module that exports this element, if applicable. |

###### Returns

[`AngularElementData`](#angularelementdata)

#### Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="exportingmodulename"></a> `exportingModuleName?` | `readonly` | `string` | The name of the module that exports this element, if applicable. | [types/angular.ts:64](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L64) |
| <a id="isexternal"></a> `isExternal` | `readonly` | `boolean` | - | [types/angular.ts:63](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L63) |
| <a id="isstandalone"></a> `isStandalone` | `readonly` | `boolean` | Indicates if the element is standalone. | [types/angular.ts:62](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L62) |
| <a id="name"></a> `name` | `readonly` | `string` | The name of the element's class. | [types/angular.ts:58](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L58) |
| <a id="originalselector"></a> `originalSelector` | `readonly` | `string` | The original selector of the element. | [types/angular.ts:60](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L60) |
| <a id="path"></a> `path` | `readonly` | `string` | The file path where the element is defined. | [types/angular.ts:57](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L57) |
| <a id="selectors"></a> `selectors` | `readonly` | `string`[] | An array of possible selectors for the element. | [types/angular.ts:61](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L61) |
| <a id="type"></a> `type` | `readonly` | `"directive"` \| `"pipe"` \| `"component"` | The type of the element. | [types/angular.ts:59](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L59) |

## Interfaces

### ComponentInfo

Defined in: [types/angular.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L12)

Represents information about an Angular component, directive, or pipe.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="hash"></a> `hash` | `string` | A hash of the file content to detect changes. | [types/angular.ts:36](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L36) |
| <a id="isstandalone-1"></a> `isStandalone` | `boolean` | Indicates if the component is standalone. | [types/angular.ts:40](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L40) |
| <a id="lastmodified"></a> `lastModified` | `number` | The timestamp of the last modification of the file. | [types/angular.ts:32](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L32) |
| <a id="name-1"></a> `name` | `string` | The name of the component class. | [types/angular.ts:20](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L20) |
| <a id="path-1"></a> `path` | `string` | The file path where the component is defined. | [types/angular.ts:16](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L16) |
| <a id="selector"></a> `selector` | `string` | The CSS selector for the component. | [types/angular.ts:24](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L24) |
| <a id="type-1"></a> `type` | `"directive"` \| `"pipe"` \| `"component"` | The type of the element. | [types/angular.ts:28](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L28) |

***

### FileElementsInfo

Defined in: [types/angular.ts:71](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L71)

Information about Angular elements found in a single file.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="elements"></a> `elements` | [`ComponentInfo`](#componentinfo)[] | An array of component information found in the file. | [types/angular.ts:87](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L87) |
| <a id="filepath"></a> `filePath` | `string` | The path to the file. | [types/angular.ts:75](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L75) |
| <a id="hash-1"></a> `hash` | `string` | A hash of the file content. | [types/angular.ts:83](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L83) |
| <a id="lastmodified-1"></a> `lastModified` | `number` | The timestamp of the last modification of the file. | [types/angular.ts:79](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L79) |

***

### ParsedHtmlElement

Defined in: [types/angular.ts:111](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L111)

A base interface for HTML elements found in a template.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="name-2"></a> `name` | `string` | The name of the element. | [types/angular.ts:119](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L119) |
| <a id="range"></a> `range` | `Range` | The range of the element in the document. | [types/angular.ts:123](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L123) |
| <a id="tagname"></a> `tagName` | `string` | The tag name of the HTML element. | [types/angular.ts:127](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L127) |
| <a id="type-2"></a> `type` | `"pipe"` \| `"component"` \| `"attribute"` \| `"structural-directive"` \| `"property-binding"` \| `"template-reference"` | The type of the parsed HTML element. | [types/angular.ts:115](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L115) |

***

### ProjectContext

Defined in: [types/angular.ts:93](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L93)

The project context to be passed to providers.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="indexer"></a> `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) | An instance of the Angular indexer. | [types/angular.ts:101](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L101) |
| <a id="projectrootpath"></a> `projectRootPath` | `string` | The root path of the Angular project. | [types/angular.ts:97](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L97) |
| <a id="tsconfig"></a> `tsConfig` | `null` \| [`ProcessedTsConfig`](tsconfig.md#processedtsconfig) | The processed tsconfig for the project. | [types/angular.ts:105](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L105) |
