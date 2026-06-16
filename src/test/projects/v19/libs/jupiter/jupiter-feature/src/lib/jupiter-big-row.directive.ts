import { Directive } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'jupiter-table[bigRows], table[jupiter-table][bigRows]',
})
export class JupiterBigRowsDirective {}
