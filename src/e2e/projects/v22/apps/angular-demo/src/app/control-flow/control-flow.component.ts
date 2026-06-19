import { Component, inject } from '@angular/core';
import { DirectivePrefixLess } from '@angular-demo/ui-moon';
import { UiDemoBytesPipe, UiDemoOneComponent } from '@angular-demo/ui-demo-one';
import { FormBuilder, Validators } from '@angular/forms';
import { KeyValuePipe, NgIf, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-control-flow',

  templateUrl: './control-flow.component.html',
  styleUrl: './control-flow.component.css',
  imports: [NgIf, UiDemoOneComponent, DirectivePrefixLess, UiDemoBytesPipe, PercentPipe, KeyValuePipe],
})
export class ControlFlowComponent {
  fb = inject(FormBuilder);
  show = true;
  isActive = false;
  color = 'darkblue';
  items = ['один', 'два', 'три'];
  itemCount = 3;

  // Pipes
  obj = { a: 1, b: 2 };

  // Templates
  context = { name: 'Standalone Angular' };
  // Form
  form = this.fb.group({
    name: ['', Validators.required],
    address: this.fb.group({
      city: [''],
    }),
    items: this.fb.array(['']),
  });
}
