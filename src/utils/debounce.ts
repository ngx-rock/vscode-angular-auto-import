/**
 * @module
 * @description Utility for debouncing function calls.
 */

/**
 * Debounces a function, ensuring it's only called after a specified delay since the last invocation.
 *
 * @template T - The type of the function to debounce.
 * @param {T} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds before the function is invoked.
 * @returns {(this: This, ...args: Parameters<T>) => void} The debounced function.
 */
export function debounce<Args extends unknown[]>(
  func: (...args: Args) => unknown,
  delay: number
): (...args: Args) => void {
  let timeout: NodeJS.Timeout | undefined;

  return function (this: ThisParameterType<typeof func>, ...args: Args): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
