[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / types/angular

# types/angular

Defines the core data types for Angular elements.

## Classes

### AngularElementData

Defined in: [types/angular.ts:88](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L88)

Represents data for an Angular element to be indexed.

#### Constructors

##### Constructor

> **new AngularElementData**(`options`): [`AngularElementData`](#angularelementdata)

Defined in: [types/angular.ts:103](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L103)

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
| <a id="absolutepath"></a> `absolutePath?` | `readonly` | `string` | [types/angular.ts:97](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L97) |
| <a id="exportingmodulename"></a> `exportingModuleName?` | `readonly` | `string` | [types/angular.ts:96](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L96) |
| <a id="isexternal"></a> `isExternal` | `readonly` | `boolean` | [types/angular.ts:95](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L95) |
| <a id="isstandalone"></a> `isStandalone` | `readonly` | `boolean` | [types/angular.ts:94](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L94) |
| <a id="name"></a> `name` | `readonly` | `string` | [types/angular.ts:90](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L90) |
| <a id="originalselector"></a> `originalSelector` | `readonly` | `string` | [types/angular.ts:92](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L92) |
| <a id="path"></a> `path` | `readonly` | `string` | [types/angular.ts:89](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L89) |
| <a id="selectors"></a> `selectors` | `readonly` | `string`[] | [types/angular.ts:93](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L93) |
| <a id="type"></a> `type` | `readonly` | `AngularElementType` | [types/angular.ts:91](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L91) |

## Interfaces

### ComponentInfo

Defined in: [types/angular.ts:17](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L17)

Represents information about an Angular component, directive, or pipe.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="hash"></a> `hash` | `string` | A hash of the file content to detect changes. | [types/angular.ts:41](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L41) |
| <a id="isstandalone-1"></a> `isStandalone` | `boolean` | Indicates if the component is standalone. | [types/angular.ts:45](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L45) |
| <a id="lastmodified"></a> `lastModified` | `number` | The timestamp of the last modification of the file. | [types/angular.ts:37](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L37) |
| <a id="name-1"></a> `name` | `string` | The name of the component class. | [types/angular.ts:25](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L25) |
| <a id="path-1"></a> `path` | `string` | The file path where the component is defined. | [types/angular.ts:21](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L21) |
| <a id="selector"></a> `selector` | `string` | The CSS selector for the component. | [types/angular.ts:29](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L29) |
| <a id="type-1"></a> `type` | `AngularElementType` | The type of the element. | [types/angular.ts:33](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L33) |

***

### FileElementsInfo

Defined in: [types/angular.ts:119](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L119)

Information about Angular elements found in a single file.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="elements"></a> `elements` | [`ComponentInfo`](#componentinfo)[] | An array of component information found in the file. | [types/angular.ts:135](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L135) |
| <a id="filepath"></a> `filePath` | `string` | The path to the file. | [types/angular.ts:123](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L123) |
| <a id="hash-1"></a> `hash` | `string` | A hash of the file content. | [types/angular.ts:131](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L131) |
| <a id="lastmodified-1"></a> `lastModified` | `number` | The timestamp of the last modification of the file. | [types/angular.ts:127](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L127) |

***

### ParsedHtmlElement

Defined in: [types/angular.ts:159](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L159)

A base interface for HTML elements found in a template.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="name-2"></a> `name` | `string` | The name of the element. | [types/angular.ts:167](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L167) |
| <a id="range"></a> `range` | `Range` | The range of the element in the document. | [types/angular.ts:171](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L171) |
| <a id="tagname"></a> `tagName` | `string` | The tag name of the HTML element. | [types/angular.ts:175](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L175) |
| <a id="type-2"></a> `type` | `"component"` \| `"pipe"` \| `"attribute"` \| `"structural-directive"` \| `"property-binding"` \| `"template-reference"` | The type of the parsed HTML element. | [types/angular.ts:163](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L163) |

***

### ProjectContext

Defined in: [types/angular.ts:141](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L141)

The project context to be passed to providers.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="indexer"></a> `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) | An instance of the Angular indexer. | [types/angular.ts:149](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L149) |
| <a id="projectrootpath"></a> `projectRootPath` | `string` | The root path of the Angular project. | [types/angular.ts:145](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L145) |
| <a id="tsconfig"></a> `tsConfig` | `null` \| [`ProcessedTsConfig`](tsconfig.md#processedtsconfig) | The processed tsconfig for the project. | [types/angular.ts:153](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L153) |

## Type Aliases

### Element

> **Element** = `object`

Defined in: [types/angular.ts:51](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L51)

Represents a generic Angular element configuration.

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="importpath"></a> `importPath?` | `string` | [types/angular.ts:53](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L53) |
| <a id="name-3"></a> `name` | `string` | [types/angular.ts:52](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L52) |
| <a id="originalselector-1"></a> `originalSelector` | `string` | [types/angular.ts:56](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L56) |
| <a id="selectors-1"></a> `selectors` | `string`[] | [types/angular.ts:55](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L55) |
| <a id="standalone"></a> `standalone` | `boolean` | [types/angular.ts:57](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L57) |
| <a id="type-3"></a> `type` | `AngularElementType` | [types/angular.ts:54](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/angular.ts#L54) |
