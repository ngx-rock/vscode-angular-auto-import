import { Component } from '@angular/core';
import { UiDemoOneComponent, UiDemoOneSiblingComponent } from '@angular-demo/ui-demo-one';
import { UiMoonComponent } from '@angular-demo/ui-moon';
import { UiMarsComponent } from '@angular-demo/ui-mars'; 
import { AliasComponent } from '@alias/alias.component'; 
import { DeepAliasComponent } from '@deep-alias';

@Component({
  selector: 'app-ui-demo-one-alias',
  imports: [
    UiDemoOneComponent,
    UiDemoOneSiblingComponent,
    UiMoonComponent,
    UiMarsComponent,
    AliasComponent,
    DeepAliasComponent,
  ],
  templateUrl: './ui-demo-one-alias.component.html',
  styleUrl: './ui-demo-one-alias.component.css',
})
export class UiDemoOneAliasComponent {}
