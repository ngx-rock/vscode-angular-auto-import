import { Component, Directive } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[libDoubleWay]',
})
export class DoubleWayDirective {}

@Component({
  selector: 'lib-ui-moon-double',
  imports: [CommonModule],
  templateUrl: './ui-moon-double.component.html',
  styleUrl: './ui-moon-double.component.css',
})
export class UiMoonDoubleComponent {}
