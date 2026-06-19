import { Directive, TemplateRef, ViewContainerRef, effect, input } from '@angular/core';

@Directive({
  selector: '[libUiDisplaySignal]',
  standalone: true,
})
export class UiDisplaySignalDirective {
  displaySignal = input('123', { alias: 'libUiDisplaySignal' });

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
  ) {
    // Используем effect для реакции на изменения input signal
    effect(() => {
      if (this.displaySignal()) {
        // Показываем элемент - создаем embedded view
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        // Скрываем элемент - очищаем контейнер
        this.viewContainer.clear();
      }
    });
  }
}
