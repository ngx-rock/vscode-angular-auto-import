[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / types/angular

# types/angular

Defines the core data types for Angular elements.

## Classes

### AngularElementData

Defined in: [types/angular.ts:69](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L69)

Represents data for an Angular element to be indexed.

#### Constructors

##### Constructor

> **new AngularElementData**(`options`): [`AngularElementData`](#angularelementdata)

Defined in: [types/angular.ts:83](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L83)

Creates an instance of AngularElementData.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | `AngularElementDataOptions` | Configuration options for the Angular element |

###### Returns

[`AngularElementData`](#angularelementdata)

#### Properties

| Property | Modifier | Type | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="exportingmodulename"></a> `exportingModuleName?` | `readonly` | `string` | [types/angular.ts:77](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L77) |
| <a id="isexternal"></a> `isExternal` | `readonly` | `boolean` | [types/angular.ts:76](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L76) |
| <a id="isstandalone"></a> `isStandalone` | `readonly` | `boolean` | [types/angular.ts:75](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L75) |
| <a id="name"></a> `name` | `readonly` | `string` | [types/angular.ts:71](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L71) |
| <a id="originalselector"></a> `originalSelector` | `readonly` | `string` | [types/angular.ts:73](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L73) |
| <a id="path"></a> `path` | `readonly` | `string` | [types/angular.ts:70](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L70) |
| <a id="selectors"></a> `selectors` | `readonly` | `string`[] | [types/angular.ts:74](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L74) |
| <a id="type"></a> `type` | `readonly` | `"directive"` \| `"pipe"` \| `"component"` | [types/angular.ts:72](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L72) |

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

Defined in: [types/angular.ts:98](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L98)

Information about Angular elements found in a single file.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="elements"></a> `elements` | [`ComponentInfo`](#componentinfo)[] | An array of component information found in the file. | [types/angular.ts:114](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L114) |
| <a id="filepath"></a> `filePath` | `string` | The path to the file. | [types/angular.ts:102](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L102) |
| <a id="hash-1"></a> `hash` | `string` | A hash of the file content. | [types/angular.ts:110](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L110) |
| <a id="lastmodified-1"></a> `lastModified` | `number` | The timestamp of the last modification of the file. | [types/angular.ts:106](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L106) |

***

### ParsedHtmlElement

Defined in: [types/angular.ts:138](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L138)

A base interface for HTML elements found in a template.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="name-2"></a> `name` | `string` | The name of the element. | [types/angular.ts:146](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L146) |
| <a id="range"></a> `range` | `Range` | The range of the element in the document. | [types/angular.ts:150](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L150) |
| <a id="tagname"></a> `tagName` | `string` | The tag name of the HTML element. | [types/angular.ts:154](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L154) |
| <a id="type-2"></a> `type` | `"pipe"` \| `"component"` \| `"attribute"` \| `"structural-directive"` \| `"property-binding"` \| `"template-reference"` | The type of the parsed HTML element. | [types/angular.ts:142](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L142) |

***

### ProjectContext

Defined in: [types/angular.ts:120](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L120)

The project context to be passed to providers.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="indexer"></a> `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) | An instance of the Angular indexer. | [types/angular.ts:128](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L128) |
| <a id="projectrootpath"></a> `projectRootPath` | `string` | The root path of the Angular project. | [types/angular.ts:124](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L124) |
| <a id="tsconfig"></a> `tsConfig` | `null` \| [`ProcessedTsConfig`](tsconfig.md#processedtsconfig) | The processed tsconfig for the project. | [types/angular.ts:132](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L132) |
