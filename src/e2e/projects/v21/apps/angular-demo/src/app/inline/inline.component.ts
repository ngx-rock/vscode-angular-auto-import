import { Component } from '@angular/core';
import { UiDemoOneComponent } from '@angular-demo/ui-demo-one';
import { NgClass, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-inline',
  imports: [UiDemoOneComponent, NgStyle, NgClass, NgIf],
  template: `
    <div *ngIf="show" [ngClass]="{ active: isActive }" [ngStyle]="{ color: color }">
      *ngIf, ngClass и ngStyle работают!
    </div>

    <lib-ui-demo-one></lib-ui-demo-one>
  `,
})
export class InlineComponent {
  show = true;
  isActive = false;
  color = 'darkblue';
}
