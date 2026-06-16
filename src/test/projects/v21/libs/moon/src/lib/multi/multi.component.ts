import { Component, Directive, Pipe, PipeTransform } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-button',
  template: '<button><ng-content></ng-content></button>',
})
export class ButtonComponent {}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-card',
  template: '<div class="card"><ng-content></ng-content></div>',
})
export class CardComponent {}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[appHighlight]',
})
export class HighlightDirective {}

@Pipe({
  name: 'capitalize',
})
export class CapitalizePipe implements PipeTransform {
  transform(arg = '') {
    return '';
  }
}
