import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Companion to the `ngx-translate` reproduction case for
 * https://github.com/ngx-rock/vscode-angular-auto-import/issues/33
 *
 * This inline-template variant is used with imports stripped, to prove that the
 * `translate` pipe is actually indexed (i.e. the no-false-positive case is not a
 * trivial pass). With `TranslateModule` removed the pipe MUST be flagged as a
 * missing import and a quick fix must be offered.
 */
@Component({
  selector: 'app-ngx-translate-missing',
  standalone: true,
  template: `<p>{{ 'demo.greeting' | translate }}</p>`,
  imports: [TranslateModule],
})
export class NgxTranslateMissingComponent {
  private readonly translate = inject(TranslateService);
}
