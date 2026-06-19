import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '.input:not(.red)',
})
export class InputClassDisabledDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', 'blue');
  }
}
