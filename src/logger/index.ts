import { Logger } from "./logger";

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
