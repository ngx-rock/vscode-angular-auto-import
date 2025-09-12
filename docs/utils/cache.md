[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / utils/cache

# utils/cache

LRUCache

## Classes

### LruCache\<K, V\>

Defined in: [utils/cache.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/cache.ts#L13)

A simple LRU (Least Recently Used) cache implementation.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `K` | The type of the keys in the cache. |
| `V` | The type of the values in the cache. |

#### Constructors

##### Constructor

> **new LruCache**\<`K`, `V`\>(`capacity`): [`LruCache`](#lrucache)\<`K`, `V`\>

Defined in: [utils/cache.ts:21](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/cache.ts#L21)

Creates an instance of LRUCache.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `capacity` | `number` | The maximum number of items to store in the cache. |

###### Returns

[`LruCache`](#lrucache)\<`K`, `V`\>

#### Properties

| Property | Modifier | Type | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="cache"></a> `cache` | `private` | `Map`\<`K`, `V`\> | [utils/cache.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/cache.ts#L15) |
| <a id="capacity"></a> `capacity` | `private` | `number` | [utils/cache.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/cache.ts#L14) |

#### Accessors

##### size

###### Get Signature

> **get** **size**(): `number`

Defined in: [utils/cache.ts:82](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/cache.ts#L82)

Gets the current size of the cache.

###### Returns

`number`

#### Methods

##### clear()

> **clear**(): `void`

Defined in: [utils/cache.ts:75](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/cache.ts#L75)

Clears all items from the cache.

###### Returns

`void`

##### delete()

> **delete**(`key`): `void`

Defined in: [utils/cache.ts:68](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/cache.ts#L68)

Removes an item from the cache.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `K` | The key of the item to remove. |

###### Returns

`void`

##### get()

> **get**(`key`): `undefined` \| `V`

Defined in: [utils/cache.ts:30](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/cache.ts#L30)

Retrieves an item from the cache.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `K` | The key of the item to retrieve. |

###### Returns

`undefined` \| `V`

The value associated with the key, or undefined if the key is not in the cache.

##### set()

> **set**(`key`, `value`): `void`

Defined in: [utils/cache.ts:47](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/utils/cache.ts#L47)

Adds or updates an item in the cache.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `K` | The key of the item to add or update. |
| `value` | `V` | The value of the item. |

###### Returns

`void`
