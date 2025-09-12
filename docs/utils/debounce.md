[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / utils/debounce

# utils/debounce

## Description

Utility for debouncing function calls.

## Functions

### debounce()

> **debounce**\<`Args`\>(`func`, `delay`): (...`args`) => `void`

Defined in: [utils/debounce.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/debounce.ts#L14)

Debounces a function, ensuring it's only called after a specified delay since the last invocation.

#### Type Parameters

| Type Parameter |
| ------ |
| `Args` *extends* `unknown`[] |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `func` | (...`args`) => `unknown` | The function to debounce. |
| `delay` | `number` | The delay in milliseconds before the function is invoked. |

#### Returns

The debounced function.

> (...`args`): `void`

##### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`args` | `Args` |

##### Returns

`void`
