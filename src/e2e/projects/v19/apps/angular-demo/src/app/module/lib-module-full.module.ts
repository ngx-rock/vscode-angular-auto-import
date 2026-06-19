import { NgModule } from '@angular/core';
import { LibModuleFullComponent } from './lib-module-full.component';
import { NgIf } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { InnerMod1Component } from './components/inner-mod1.component';
import { MatIcon } from '@angular/material/icon';
import { ModModule } from '@angular-demo/ui-mars';
import { MatIconButton } from '@angular/material/button';

@NgModule({
  declarations: [LibModuleFullComponent, InnerMod1Component],
  imports: [NgIf, MatToolbar, MatIcon, ModModule, MatIconButton],
  exports: [LibModuleFullComponent],
})
export class LibModuleFullModule {}
