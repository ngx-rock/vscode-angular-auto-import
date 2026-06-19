import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-ui-demo-one-sibling',
  imports: [CommonModule],
  templateUrl: './ui-demo-one-sibling.component.html',
  styleUrl: './ui-demo-one-sibling.component.css',
})
export class UiDemoOneSiblingComponent {
  title = input.required();
}
