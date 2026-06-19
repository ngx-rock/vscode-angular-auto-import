import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

// @Directive({
//   // eslint-disable-next-line @angular-eslint/directive-selector
//   selector: 'custom-input',
// })
// export class CustomInputDirective  {
//   constructor(private el: ElementRef, private renderer: Renderer2) {
//     console.error('XXX')
//   }
//
//
//   ngAfterViewInit(): void {
//     this.renderer.setStyle(this.el.nativeElement, 'color', 'brown');
//   }
// }

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'custom-input:not([disabled]):not([readonly])',
})
export class CustomInputNotSelectorDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'color', 'black');
  }
}
