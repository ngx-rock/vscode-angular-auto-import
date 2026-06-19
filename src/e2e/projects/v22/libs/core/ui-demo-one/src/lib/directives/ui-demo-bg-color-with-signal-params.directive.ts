import { AfterViewInit, Directive, ElementRef, input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[libUiDemoBgColorWithSignalParams]',
})
export class UiDemoBgColorWithSignalParamsDirective implements AfterViewInit {
  value = input('red', { alias: 'libUiDemoBgColorWithSignalParams' });
  size = input(123);

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', this.value());
  }
}
