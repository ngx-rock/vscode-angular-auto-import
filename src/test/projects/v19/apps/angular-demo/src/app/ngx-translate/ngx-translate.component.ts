import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Reproduction for https://github.com/ngx-rock/vscode-angular-auto-import/issues/33
 *
 * The `translate` pipe is provided by `TranslateModule`, which is correctly
 * listed in the standalone component's `imports` array. The extension must NOT
 * report a "missing import" diagnostic for it.
 */
@Component({
  selector: 'app-ngx-translate',
  standalone: true,
  templateUrl: './ngx-translate.component.html',
  imports: [TranslateModule],
})
export class NgxTranslateComponent {
  private readonly translate = inject(TranslateService);
}
