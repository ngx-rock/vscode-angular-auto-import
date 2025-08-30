[**Angular Auto Import Extension API Documentation**](README.md)

***

[Angular Auto Import Extension](README.md) / logger

# logger

## Variables

### logger

> `const` **logger**: [`Logger`](logger/logger-1.md#logger)

Defined in: [logger/index.ts:14](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/index.ts#L14)

The singleton logger instance for the extension.

#### Example

```typescript
import { logger } from '../logger';

logger.info('This is an informational message.');
logger.error('This is an error message.', new Error('Something went wrong'));
```
