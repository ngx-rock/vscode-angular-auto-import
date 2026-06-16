import { Directive } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'jupiter-table, table[jupiter-table]',
})
export class JupiterTableDirective {}
