import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[libUiDemoBgColorWithParams]',
})
export class UiDemoBgColorWithParamsDirective {
  @Input() libUiDemoBgColorWithParams = 1;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', 'red');
  }
}
