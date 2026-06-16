import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uiDemoPhoneFormat',
})
export class UiDemoPhoneFormatPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return '+7 921 189 89 90' + value;
  }
}
