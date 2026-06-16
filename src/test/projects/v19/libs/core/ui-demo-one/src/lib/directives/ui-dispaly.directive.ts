import { Directive, TemplateRef, ViewContainerRef, effect, Input } from '@angular/core';

@Directive({
  selector: '[libUiDisplay]',
  standalone: true,
})
export class UiDisplayDirective {
  @Input() libUiDisplay = true;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
  ) {
    // Используем effect для реакции на изменения input signal
    effect(() => {
      if (this.libUiDisplay) {
        // Показываем элемент - создаем embedded view
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        // Скрываем элемент - очищаем контейнер
        this.viewContainer.clear();
      }
    });
  }
}
