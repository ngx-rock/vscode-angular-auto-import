[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / logger/file-transport

# logger/file-transport

## Classes

### FileTransport

Defined in: [logger/file-transport.ts:6](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L6)

#### Implements

- [`Transport`](types.md#transport)

#### Constructors

##### Constructor

> **new FileTransport**(`config`, `context`): [`FileTransport`](#filetransport)

Defined in: [logger/file-transport.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L15)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`LoggerConfig`](types.md#loggerconfig) |
| `context` | `ExtensionContext` |

###### Returns

[`FileTransport`](#filetransport)

#### Properties

| Property | Modifier | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="buffer"></a> `buffer` | `private` | [`LogEntry`](types.md#logentry)[] | `[]` | [logger/file-transport.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L11) |
| <a id="config"></a> `config` | `private` | [`LoggerConfig`](types.md#loggerconfig) | `undefined` | [logger/file-transport.ts:7](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L7) |
| <a id="context"></a> `context` | `private` | `ExtensionContext` | `undefined` | [logger/file-transport.ts:8](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L8) |
| <a id="flushinterval"></a> `flushInterval` | `private` | `Timeout` | `undefined` | [logger/file-transport.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L13) |
| <a id="iswriting"></a> `isWriting` | `private` | `boolean` | `false` | [logger/file-transport.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L12) |
| <a id="logdirectory"></a> `logDirectory` | `private` | `string` | `undefined` | [logger/file-transport.ts:9](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L9) |
| <a id="logfilepath"></a> `logFilePath` | `private` | `string` | `undefined` | [logger/file-transport.ts:10](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L10) |

#### Methods

##### checkRotation()

> `private` **checkRotation**(): `Promise`\<`void`\>

Defined in: [logger/file-transport.ts:70](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L70)

###### Returns

`Promise`\<`void`\>

##### dispose()

> **dispose**(): `Promise`\<`void`\>

Defined in: [logger/file-transport.ts:120](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L120)

###### Returns

`Promise`\<`void`\>

###### Implementation of

[`Transport`](types.md#transport).[`dispose`](types.md#dispose)

##### flush()

> `private` **flush**(): `Promise`\<`void`\>

Defined in: [logger/file-transport.ts:49](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L49)

###### Returns

`Promise`\<`void`\>

##### initialize()

> `private` **initialize**(): `Promise`\<`void`\>

Defined in: [logger/file-transport.ts:22](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L22)

###### Returns

`Promise`\<`void`\>

##### log()

> **log**(`entry`): `void`

Defined in: [logger/file-transport.ts:41](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L41)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entry` | [`LogEntry`](types.md#logentry) |

###### Returns

`void`

###### Implementation of

[`Transport`](types.md#transport).[`log`](types.md#log)

##### rotate()

> `private` **rotate**(): `Promise`\<`void`\>

Defined in: [logger/file-transport.ts:86](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/file-transport.ts#L86)

###### Returns

`Promise`\<`void`\>
