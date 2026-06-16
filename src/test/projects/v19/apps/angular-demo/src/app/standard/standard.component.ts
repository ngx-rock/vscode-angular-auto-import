import { Component, inject, Type } from '@angular/core';
import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  I18nPluralPipe,
  I18nSelectPipe,
  JsonPipe,
  KeyValuePipe,
  LowerCasePipe,
  NgClass,
  NgComponentOutlet,
  NgForOf,
  NgIf,
  NgPlural,
  NgPluralCase,
  NgStyle,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet,
  PercentPipe,
  SlicePipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiDemoBytesPipe, UiDemoOneComponent } from '@angular-demo/ui-demo-one';
import { DirectivePrefixLess } from '@angular-demo/ui-moon';

@Component({
  selector: 'app-standard',

  templateUrl: './standard.component.html',

  styleUrl: './standard.component.css',

  imports: [
    NgStyle,
    NgClass,
    NgIf,
    NgForOf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    PercentPipe,
    KeyValuePipe,
    JsonPipe,
    LowerCasePipe,
    UpperCasePipe,
    TitleCasePipe,
    SlicePipe,
    I18nPluralPipe,
    I18nSelectPipe,
    NgPlural,
    NgPluralCase,
    NgComponentOutlet,
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    ReactiveFormsModule,
    UiDemoOneComponent,
    UiDemoBytesPipe,
    DirectivePrefixLess,
  ],
})
export class StandardComponent {
  fb = inject(FormBuilder);
  show = true;
  isActive = false;
  color = 'darkblue';
  items = ['один', 'два', 'три'];
  mode = 'B';
  inputText = '';
  itemCount = 3;

  // Pipes
  promise = Promise.resolve('Привет!');
  today = new Date();
  obj = { a: 1, b: 2 };
  pluralMap = { '=0': 'нет', '=1': 'один', other: 'много' };
  gender = 'male';
  genderMap = { male: 'Он', female: 'Она', other: 'Они' };

  // Templates
  context = { name: 'Standalone Angular' };
  dynamicComponent: Type<unknown> = HelloComponent;

  // Form
  form = this.fb.group({
    name: ['', Validators.required],
    address: this.fb.group({
      city: [''],
    }),
    items: this.fb.array(['']),
  });

  email = this.fb.control('');
}

@Component({
  selector: 'app-hello',
  standalone: true,
  template: `
    <p>Динамический компонент: HelloComponent!</p>
  `,
})
export class HelloComponent {}
