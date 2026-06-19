import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytes',
})
export class UiDemoBytesPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return (value || 0) + ' bytes';
  }
}
