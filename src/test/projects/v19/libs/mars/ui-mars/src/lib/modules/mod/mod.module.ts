import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibModSimpleComponent } from './lib-mod-simple.component';

@NgModule({
  declarations: [LibModSimpleComponent],
  imports: [CommonModule],
  exports: [LibModSimpleComponent],
})
export class ModModule {}
