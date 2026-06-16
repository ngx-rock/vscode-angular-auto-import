import { Component } from '@angular/core';

@Component({
  selector: 'lib-mod-simple',
  template: `
    hello module
  `,
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
})
export class LibModSimpleComponent {}
