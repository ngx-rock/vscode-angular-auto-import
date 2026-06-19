import { Component } from '@angular/core';
import {
  InvisibleDirective,
  UiDemoBgColorDirective,
  UiDemoBgColorWithParamsDirective,
  UiDemoBgColorWithSignalParamsDirective,
  UiDemoBytesPipe,
  UiDemoFontColorDirective,
  UiDemoPhoneFormatPipe,
  UiDemoShowIfDirective,
  UiDisplayDirective,
  UiDisplayNoParamsDirective,
  UiDisplaySignalDirective,
} from '@angular-demo/ui-demo-one';
import {
  ButtonComponent,
  CapitalizePipe,
  CardComponent,
  DirectivePrefixLess,
  DoubleWayDirective,
  HighlightDirective,
  InvisibleSmartCaptchaComponent,
  MoonComponent,
  PipePrefixLess,
  PrefixLess,
  SmartCaptchaComponent,
  UiMoonDoubleComponent,
} from '@angular-demo/ui-moon';
import { NxWelcomeComponent } from '../nx-welcome.component';
import { AttributeValueDirective, ModModule, UiMarsComponentDirectiveDirective } from '@angular-demo/ui-mars';
import { UiDemoOneAliasComponent } from '../tsconfig-aliases/ui-demo-one-alias.component';
import {
  JupiterBigRowsDirective,
  JupiterButtonDirective,
  JupiterTableDirective,
  JupiterTemplateDirective,
} from '@angular-demo/jupiter-feature';
import { CustomInputNotSelectorDirective } from '@angular-demo/feature-mercury';

@Component({
  selector: 'app-home',
  imports: [
    PrefixLess,
    PipePrefixLess,
    DirectivePrefixLess,
    UiDemoOneAliasComponent,
    NxWelcomeComponent,
    MoonComponent,
    UiMoonDoubleComponent,
    DoubleWayDirective,
    SmartCaptchaComponent,
    InvisibleDirective,
    InvisibleSmartCaptchaComponent,
    UiDemoBytesPipe,
    UiDemoPhoneFormatPipe,
    ButtonComponent,
    CardComponent,
    HighlightDirective,
    CapitalizePipe,
    UiDemoBgColorDirective,
    UiDemoBgColorWithParamsDirective,
    UiDemoBgColorWithSignalParamsDirective,
    UiDemoShowIfDirective,
    UiDisplayDirective,
    UiDisplaySignalDirective,
    UiDisplayNoParamsDirective,
    UiMarsComponentDirectiveDirective,
    AttributeValueDirective,
    CustomInputNotSelectorDirective,
    UiDemoFontColorDirective,
    JupiterButtonDirective,
    JupiterTableDirective,
    JupiterBigRowsDirective,
    JupiterTemplateDirective,
    ModModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
