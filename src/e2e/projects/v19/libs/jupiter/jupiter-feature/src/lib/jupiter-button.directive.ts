import { Directive } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'button[jupiter-icon-button], a[jupiter-icon-button], button[jupiterIconButton], a[jupiterIconButton]',
})
export class JupiterButtonDirective {}
