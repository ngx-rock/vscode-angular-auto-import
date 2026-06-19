import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipePrefixLess',
})
export class PipePrefixLess implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
