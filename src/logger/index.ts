import { Logger, LogMethod } from "./logger";

/**
 * The singleton logger instance for the extension.
 *
 * @example
 * ```typescript
 * import { logger } from '../logger';
 *
 * logger.info('This is an informational message.');
 * logger.error('This is an error message.', new Error('Something went wrong'));
 * ```
 */
export const logger = Logger.getInstance();

/**
 * Decorator to automatically log method entry and exit.
 * @param level The log level to use for the trace messages.
 *
 * @example
 * ```typescript
 * import { LogMethod } from '../logger';
 *
 * class MyClass {
 *   @LogMethod('INFO')
 *   myMethod(arg1: string) {
 *     // ...
 *   }
 * }
 * ```
 */
export { LogMethod };
