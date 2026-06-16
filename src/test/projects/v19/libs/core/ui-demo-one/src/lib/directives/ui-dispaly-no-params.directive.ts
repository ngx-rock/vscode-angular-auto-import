import { Directive, TemplateRef, ViewContainerRef, effect } from '@angular/core';

@Directive({
  selector: '[libUiDisplayNoParams]',
  standalone: true,
})
export class UiDisplayNoParamsDirective {
  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
  ) {
    effect(() => {
      this.viewContainer.createEmbeddedView(this.templateRef);
    });
  }
}
