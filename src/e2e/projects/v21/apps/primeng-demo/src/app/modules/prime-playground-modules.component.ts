import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import type { AutoCompleteCompleteEvent } from 'primeng/types/autocomplete';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { BlockUIModule } from 'primeng/blockui';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';
import { ScrollTopModule } from 'primeng/scrolltop';
import { SelectButtonModule } from 'primeng/selectbutton';
import type { SelectButtonChangeEvent } from 'primeng/types/selectbutton';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { StyleClassModule } from 'primeng/styleclass';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import {
  primeBreadcrumbHome,
  primeBreadcrumbItems,
  primeCities,
  primeContextItems,
  primeMenuItems,
  primeModes,
  PrimeProduct,
  primeProducts,
  primeTeams
} from "../shared/prime-playground.data";

@Component({
  selector: 'app-prime-playground-modules',
  standalone: true,
  imports: [
    FormsModule,
    AccordionModule,
    AutoCompleteModule,
    AvatarModule,
    BadgeModule,
    BlockUIModule,
    BreadcrumbModule,
    ButtonModule,
    CheckboxModule,
    ChipModule,
    ColorPickerModule,
    ContextMenuModule,
    DatePickerModule,
    DialogModule,
    DividerModule,
    FloatLabelModule,
    InputNumberModule,
    InputTextModule,
    MenubarModule,
    MessageModule,
    PanelModule,
    ProgressBarModule,
    RippleModule,
    ScrollTopModule,
    SelectButtonModule,
    SelectModule,
    SkeletonModule,
    StyleClassModule,
    TableModule,
    TabsModule,
    TagModule,
    ToastModule,
    ToggleSwitchModule,
    ToolbarModule,
    TooltipModule,
    PrimeTemplate
  ],
  templateUrl: './prime-playground-modules.component.html',
})
export class PrimePlaygroundModulesComponent {
  private readonly messageService = inject(MessageService);

  readonly menuItems = primeMenuItems;
  readonly breadcrumbHome = primeBreadcrumbHome;
  readonly breadcrumbItems = primeBreadcrumbItems;
  readonly contextItems = primeContextItems;
  readonly cities = primeCities;
  readonly modeOptions = primeModes;
  readonly teams = primeTeams;

  products: PrimeProduct[] = [...primeProducts];
  selectedCity = this.cities[0];
  selectedDate = new Date('2026-03-14');
  quantity = 42;
  selectedMode = 'parser';
  notificationsEnabled = true;
  panelBlocked = false;
  dialogVisible = false;
  overlaySuggestions: string[] = ['Dialog', 'Toast', 'Tooltip'];
  selectedOverlays: string[] = ['Dialog', 'Toast'];
  themeColor = '#2563eb';
  coverage = 73;

  searchOverlay(event: AutoCompleteCompleteEvent): void {
    const query = (event.query ?? '').toLowerCase();
    this.overlaySuggestions = ['Dialog', 'Toast', 'Tooltip', 'ContextMenu'].filter(item =>
      item.toLowerCase().includes(query),
    );
  }

  showToast(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'PrimeNG',
      detail: 'Toast visible for e2e verification',
    });
  }

  toggleBlock(): void {
    this.panelBlocked = !this.panelBlocked;
  }

  handleModeChange(event: SelectButtonChangeEvent): void {
    this.selectedMode = event.value;
  }
}
