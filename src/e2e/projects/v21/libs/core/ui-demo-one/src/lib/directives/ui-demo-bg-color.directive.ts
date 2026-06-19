import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[libUiDemoBgColor]',
})
export class UiDemoBgColorDirective {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', 'red');
  }
}
