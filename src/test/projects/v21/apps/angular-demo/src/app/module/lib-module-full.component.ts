import { Component } from '@angular/core';

@Component({
  selector: 'app-module-full',
  template: `
    hello module
    <p *ngIf="true">inner-mod1 works!</p>

    <mat-toolbar color="primary">
      <span>Angular Material Demo</span>
      <span class="spacer"></span>
      <button mat-icon-button>
        <mat-icon>menu</mat-icon>
      </button>
    </mat-toolbar>

    <lib-mod-simple></lib-mod-simple>

    <app-inner-mod1></app-inner-mod1>
  `, 
  standalone: false,
})
export class LibModuleFullComponent {}
