[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / logger/logger

# logger/logger

## Classes

### Logger

Defined in: [logger/logger.ts:17](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L17)

#### Constructors

##### Constructor

> `private` **new Logger**(): [`Logger`](#logger)

Defined in: [logger/logger.ts:34](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L34)

###### Returns

[`Logger`](#logger)

#### Properties

| Property | Modifier | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="config"></a> `config` | `private` | [`LoggerConfig`](types.md#loggerconfig) | `undefined` | [logger/logger.ts:19](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L19) |
| <a id="context"></a> `context` | `private` | `null` \| `ExtensionContext` | `null` | [logger/logger.ts:23](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L23) |
| <a id="extensionversion"></a> `extensionVersion` | `private` | `string` | `undefined` | [logger/logger.ts:22](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L22) |
| <a id="loglevelmap"></a> `logLevelMap` | `private` | `Record`\<[`LogLevel`](types.md#loglevel), `number`\> | `undefined` | [logger/logger.ts:26](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L26) |
| <a id="logpoints"></a> `logPoints` | `private` | `Map`\<`string`, [`ILogPoint`](types.md#ilogpoint)\> | `undefined` | [logger/logger.ts:24](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L24) |
| <a id="sessionid"></a> `sessionId` | `private` | `string` | `undefined` | [logger/logger.ts:21](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L21) |
| <a id="transports"></a> `transports` | `private` | [`ITransport`](types.md#itransport)[] | `[]` | [logger/logger.ts:20](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L20) |
| <a id="instance"></a> `instance` | `private` | [`Logger`](#logger) | `undefined` | [logger/logger.ts:18](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L18) |

#### Methods

##### anonymizeFilePath()

> `private` **anonymizeFilePath**(`filePath`): `string`

Defined in: [logger/logger.ts:182](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L182)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`string`

##### debug()

> **debug**(`message`, `context?`): `void`

Defined in: [logger/logger.ts:87](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L87)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### dispose()

> **dispose**(): `void`

Defined in: [logger/logger.ts:226](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L226)

###### Returns

`void`

##### error()

> **error**(`message`, `error?`, `context?`): `void`

Defined in: [logger/logger.ts:99](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L99)

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

Defined in: [logger/logger.ts:110](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L110)

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

Defined in: [logger/logger.ts:165](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L165)

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `fileName?` | `string` | [logger/logger.ts:165](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L165) |
| `lineNumber?` | `number` | [logger/logger.ts:165](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L165) |

##### getMetadata()

> `private` **getMetadata**(`isDev`): `object`

Defined in: [logger/logger.ts:147](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L147)

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

Defined in: [logger/logger.ts:215](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L215)

###### Returns

[`PerformanceMetrics`](types.md#performancemetrics)

##### info()

> **info**(`message`, `context?`): `void`

Defined in: [logger/logger.ts:91](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L91)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### initialize()

> **initialize**(`context`): `void`

Defined in: [logger/logger.ts:46](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L46)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | `ExtensionContext` |

###### Returns

`void`

##### log()

> `private` **log**(`level`, `message`, `context?`): `void`

Defined in: [logger/logger.ts:122](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L122)

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

Defined in: [logger/logger.ts:222](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L222)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `Error` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### setupTransports()

> `private` **setupTransports**(): `void`

Defined in: [logger/logger.ts:72](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L72)

###### Returns

`void`

##### startTimer()

> **startTimer**(`name`): `void`

Defined in: [logger/logger.ts:198](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L198)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

###### Returns

`void`

##### stopTimer()

> **stopTimer**(`name`): `void`

Defined in: [logger/logger.ts:203](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L203)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

###### Returns

`void`

##### updateConfig()

> `private` **updateConfig**(): `void`

Defined in: [logger/logger.ts:61](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L61)

###### Returns

`void`

##### warn()

> **warn**(`message`, `context?`): `void`

Defined in: [logger/logger.ts:95](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L95)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `context?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### getInstance()

> `static` **getInstance**(): [`Logger`](#logger)

Defined in: [logger/logger.ts:39](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/logger.ts#L39)

###### Returns

[`Logger`](#logger)
