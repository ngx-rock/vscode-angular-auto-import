import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

// ### src/app/class.directive.ts

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '.myClassDir' })
export class ClassDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', 'orange');
  }
}

// ### src/app/attribute-value.directive.ts

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[role="button"]' })
export class AttributeValueDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', 'pink');
  }
}

// ### src/app/multi.directive.ts

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: 'my-element-dir, [myAttributeDir], .myClassDir2' })
export class MultiDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', 'green');
  }
}
