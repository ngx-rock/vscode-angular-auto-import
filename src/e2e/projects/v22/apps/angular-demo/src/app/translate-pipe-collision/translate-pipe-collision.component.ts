import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Reproduction for a false positive when another indexed pipe has the same
 * selector as the pipe provided by TranslateModule.
 */
@Component({
  selector: 'app-translate-pipe-collision',
  standalone: true,
  templateUrl: './translate-pipe-collision.component.html',
  imports: [TranslateModule],
})
export class TranslatePipeCollisionComponent {
  private readonly translate = inject(TranslateService);

  readonly title = this.translate.instant('demo.collision.title');
}
