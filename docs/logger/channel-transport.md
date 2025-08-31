[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / logger/channel-transport

# logger/channel-transport

## Classes

### ChannelTransport

Defined in: [logger/channel-transport.ts:4](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/channel-transport.ts#L4)

#### Implements

- [`Transport`](types.md#transport)

#### Constructors

##### Constructor

> **new ChannelTransport**(`config`): [`ChannelTransport`](#channeltransport)

Defined in: [logger/channel-transport.ts:8](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/channel-transport.ts#L8)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`LoggerConfig`](types.md#loggerconfig) |

###### Returns

[`ChannelTransport`](#channeltransport)

#### Properties

| Property | Modifier | Type | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="config"></a> `config` | `private` | [`LoggerConfig`](types.md#loggerconfig) | [logger/channel-transport.ts:6](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/channel-transport.ts#L6) |
| <a id="outputchannel"></a> `outputChannel` | `private` | `OutputChannel` | [logger/channel-transport.ts:5](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/channel-transport.ts#L5) |

#### Methods

##### dispose()

> **dispose**(): `void`

Defined in: [logger/channel-transport.ts:48](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/channel-transport.ts#L48)

###### Returns

`void`

###### Implementation of

[`Transport`](types.md#transport).[`dispose`](types.md#dispose)

##### format()

> `private` **format**(`entry`): `string`

Defined in: [logger/channel-transport.ts:22](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/channel-transport.ts#L22)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entry` | [`LogEntry`](types.md#logentry) |

###### Returns

`string`

##### log()

> **log**(`entry`): `void`

Defined in: [logger/channel-transport.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/channel-transport.ts#L13)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entry` | [`LogEntry`](types.md#logentry) |

###### Returns

`void`

###### Implementation of

[`Transport`](types.md#transport).[`log`](types.md#log)
