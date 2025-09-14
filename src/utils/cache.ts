/**
 *
 * LRUCache
 *
 * @module
 */

/**
 * A simple LRU (Least Recently Used) cache implementation.
 * @template K The type of the keys in the cache.
 * @template V The type of the values in the cache.
 */
export class LruCache<K, V> {
  private readonly capacity: number;
  private readonly cache = new Map<K, V>();

  /**
   * Creates an instance of LRUCache.
   * @param capacity The maximum number of items to store in the cache.
   */
  constructor(capacity: number) {
    this.capacity = capacity;
  }

  /**
   * Retrieves an item from the cache.
   * @param key The key of the item to retrieve.
   * @returns The value associated with the key, or undefined if the key is not in the cache.
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    const value = this.cache.get(key) as V;
    // Move to the end to mark it as recently used
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Adds or updates an item in the cache.
   * @param key The key of the item to add or update.
   * @param value The value of the item.
   */
  set(key: K, value: V): void {
    // If the key already exists, delete it to move it to the end
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // If the cache is full, remove the least recently used item
    if (this.cache.size >= this.capacity) {
      const lruKey = this.cache.keys().next().value;
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
      }
    }

    this.cache.set(key, value);
  }

  /**
   * Removes an item from the cache.
   * @param key The key of the item to remove.
   */
  delete(key: K): void {
    this.cache.delete(key);
  }

  /**
   * Clears all items from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Gets the current size of the cache.
   */
  get size(): number {
    return this.cache.size;
  }
}
