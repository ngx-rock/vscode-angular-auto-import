[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / logger/logger

# logger/logger

## Classes

### Logger

Defined in: [logger/logger.ts:10](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L10)

#### Constructors

##### Constructor

> `private` **new Logger**(): [`Logger`](#logger)

Defined in: [logger/logger.ts:36](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L36)

###### Returns

[`Logger`](#logger)

#### Properties

| Property | Modifier | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="config"></a> `config` | `private` | [`LoggerConfig`](types.md#loggerconfig) | `undefined` | [logger/logger.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L12) |
| <a id="context"></a> `context` | `private` | `null` \| `ExtensionContext` | `null` | [logger/logger.ts:16](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L16) |
| <a id="extensionversion"></a> `extensionVersion` | `private` | `string` | `undefined` | [logger/logger.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L15) |
| <a id="logpoints"></a> `logPoints` | `private` | `Map`\<`string`, [`LogPoint`](types.md#logpoint)\> | `undefined` | [logger/logger.ts:17](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L17) |
| <a id="sessionid"></a> `sessionId` | `private` | `string` | `undefined` | [logger/logger.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L14) |
| <a id="transports"></a> `transports` | `private` | [`Transport`](types.md#transport)[] | `[]` | [logger/logger.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L13) |
| <a id="instance"></a> `instance` | `private` | [`Logger`](#logger) | `undefined` | [logger/logger.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L11) |

#### Methods

##### anonymizeFilePath()

> `private` **anonymizeFilePath**(`filePath`): `string`

Defined in: [logger/logger.ts:187](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L187)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`string`

##### buildErrorContext()

> `private` **buildErrorContext**(`error`, `context?`): `Record`\<`string`, `unknown`\>

Defined in: [logger/logger.ts:105](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L105)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `undefined` \| `Error` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`Record`\<`string`, `unknown`\>

##### debug()

> **debug**(`message`, `context?`): `void`

Defined in: [logger/logger.ts:93](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L93)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### dispose()

> **dispose**(): `void`

Defined in: [logger/logger.ts:235](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L235)

###### Returns

`void`

##### error()

> **error**(`message`, `error?`, `context?`): `void`

Defined in: [logger/logger.ts:116](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L116)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `error?` | `Error` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### fatal()

> **fatal**(`message`, `error?`, `context?`): `void`

Defined in: [logger/logger.ts:120](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L120)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `error?` | `Error` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### getCallerLocation()

> `private` **getCallerLocation**(): `object`

Defined in: [logger/logger.ts:170](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L170)

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `fileName?` | `string` | [logger/logger.ts:170](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L170) |
| `lineNumber?` | `number` | [logger/logger.ts:170](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L170) |

##### getLogLevelValue()

> `private` **getLogLevelValue**(`level`): `number`

Defined in: [logger/logger.ts:19](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L19)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `level` | [`LogLevel`](types.md#loglevel) |

###### Returns

`number`

##### getMetadata()

> `private` **getMetadata**(`isDev`): `object`

Defined in: [logger/logger.ts:152](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L152)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `isDev` | `boolean` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `extensionVersion` | `string` | [logger/types.ts:22](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L22) |
| `fileName?` | `string` | [logger/types.ts:26](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L26) |
| `lineNumber?` | `number` | [logger/types.ts:27](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L27) |
| `nodeVersion` | `string` | [logger/types.ts:25](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L25) |
| `platform` | `string` | [logger/types.ts:24](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L24) |
| `sessionId` | `string` | [logger/types.ts:21](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L21) |
| `vscodeVersion` | `string` | [logger/types.ts:23](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L23) |

##### getPerformanceMetrics()

> **getPerformanceMetrics**(): [`PerformanceMetrics`](types.md#performancemetrics)

Defined in: [logger/logger.ts:224](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L224)

###### Returns

[`PerformanceMetrics`](types.md#performancemetrics)

##### info()

> **info**(`message`, `context?`): `void`

Defined in: [logger/logger.ts:97](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L97)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### initialize()

> **initialize**(`context`): `void`

Defined in: [logger/logger.ts:48](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L48)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | `ExtensionContext` |

###### Returns

`void`

##### log()

> `private` **log**(`level`, `message`, `context?`): `void`

Defined in: [logger/logger.ts:125](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L125)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `level` | [`LogLevel`](types.md#loglevel) |
| `message` | `string` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### logException()

> **logException**(`error`, `context?`): `void`

Defined in: [logger/logger.ts:231](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L231)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `Error` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### setupTransports()

> `private` **setupTransports**(): `void`

Defined in: [logger/logger.ts:76](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L76)

###### Returns

`void`

##### startTimer()

> **startTimer**(`name`): `void`

Defined in: [logger/logger.ts:203](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L203)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

###### Returns

`void`

##### stopTimer()

> **stopTimer**(`name`): `void`

Defined in: [logger/logger.ts:210](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L210)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

###### Returns

`void`

##### updateConfig()

> `private` **updateConfig**(): `void`

Defined in: [logger/logger.ts:63](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L63)

###### Returns

`void`

##### warn()

> **warn**(`message`, `context?`): `void`

Defined in: [logger/logger.ts:101](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L101)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### getInstance()

> `static` **getInstance**(): [`Logger`](#logger)

Defined in: [logger/logger.ts:41](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L41)

###### Returns

[`Logger`](#logger)
