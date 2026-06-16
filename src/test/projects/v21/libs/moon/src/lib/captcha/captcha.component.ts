import { ChangeDetectionStrategy, Component, forwardRef, input, OnInit } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smart-captcha',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SmartCaptchaComponent {
  invisible = input.required<boolean>();
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'invisible-smart-captcha',
  template: ``,
  styles: [``],

  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvisibleSmartCaptchaComponent extends SmartCaptchaComponent implements OnInit {
  ngOnInit(): void {
    console.log('Method not implemented.');
  }
  // Always set invisible to true
  override invisible = input(true);
}
