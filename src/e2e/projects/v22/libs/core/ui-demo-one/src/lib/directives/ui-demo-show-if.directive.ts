import { Directive, TemplateRef, ViewContainerRef, Input, Optional } from '@angular/core';

@Directive({
  selector: '[libUiDemoShowIf]',
  standalone: true,
})
export class UiDemoShowIfDirective {
  @Input() set libUiDemoShowIfShow(value: boolean) {
    console.log(value);
  }

  // Основной инпут (совпадает с именем директивы)
  @Input() set libUiDemoShowIf(value: any) {
    console.log(value);
  }

  constructor(
    @Optional() private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
  ) {
    if (this.libUiDemoShowIf) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
