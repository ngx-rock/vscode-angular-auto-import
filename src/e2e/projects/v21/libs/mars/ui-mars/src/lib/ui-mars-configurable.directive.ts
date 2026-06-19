import { Directive, input } from '@angular/core';

@Directive({
  selector: '[libUiMarsConfigurable]',
})
export class UiMarsConfigurableDirective {
  value = input.required<boolean>({ alias: 'libUiMarsConfigurable' });
}
