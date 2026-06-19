import { Component } from '@angular/core';

import { TuiDay } from '@taiga-ui/cdk/date-time';
import { taigaFrameworks, taigaMap, taigaStatuses, taigaTabs, taigaUsers } from '../shared/taiga-playground.data';
import {
  TuiAppBarDirective,
  TuiAsideComponent,
  TuiAsideGroupComponent,
  TuiAsideItemDirective,
  TuiBlockStatusComponent,
  TuiHeaderComponent,
  TuiLogoComponent,
  TuiMainComponent,
  TuiSubheaderComponent,
  TuiBlockStatusDirective,
} from '@taiga-ui/layout';
import {
  TuiButton,
  TuiExpandComponent,
  TuiFormatNumberPipe,
  TuiHintDirective,
  TuiIcon,
  TuiInitialsPipe,
  TuiLabel,
  TuiNotification,
  TuiTextfieldComponent,
  TuiTextfieldDropdownDirective,
  TuiTextfieldMultiComponent,
} from '@taiga-ui/core';
import {
  TuiAccordionDirective,
  TuiAccordionItem,
  TuiAccordionItemContent,
  TuiAvatar,
  TuiBadge,
  TuiBreadcrumbs,
  TuiCheckbox,
  TuiChevron,
  TuiChip,
  TuiComboBox,
  TuiDataListWrapperComponent,
  TuiInputChipDirective,
  TuiInputDateDirective,
  TuiInputNumberDirective,
  TuiMessage,
  TuiProgressBar,
  TuiProgressCircle,
  TuiRating,
  TuiSelectDirective,
  TuiSliderComponent,
  TuiStatus,
  TuiSwitch,
  TuiTab,
  TuiTabsHorizontal,
  TuiTextarea,
} from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import {
  TuiIsPresentPipe,
  TuiKeysPipe,
  TuiObfuscatePipe,
  TuiRepeatTimesPipe,
  TuiReplacePipe,
  TuiToArrayPipe,
} from '@taiga-ui/cdk';

@Component({
  selector: 'app-taiga-playground',
  standalone: true,
  imports: [
    TuiHeaderComponent,
    TuiLogoComponent,
    TuiNotification,
    TuiButton,
    TuiHintDirective,
    TuiAsideComponent,
    TuiAsideItemDirective,
    TuiAsideGroupComponent,
    TuiMainComponent,
    TuiSubheaderComponent,
    TuiBreadcrumbs,
    TuiAvatar,
    TuiBadge,
    TuiChip,
    TuiIcon,
    TuiTabsHorizontal,
    TuiTab,
    TuiProgressBar,
    TuiProgressCircle,
    TuiMessage,
    TuiStatus,
    TuiLabel,
    TuiCheckbox,
    FormsModule,
    TuiSwitch,
    TuiSliderComponent,
    TuiRating,
    TuiTextfieldComponent,
    TuiComboBox,
    TuiTextfieldDropdownDirective,
    TuiDataListWrapperComponent,
    TuiChevron,
    TuiSelectDirective,
    TuiInputDateDirective,
    TuiInputNumberDirective,
    TuiTextfieldMultiComponent,
    TuiInputChipDirective,
    TuiTextarea,
    TuiBlockStatusComponent,
    TuiAppBarDirective,
    TuiAccordionDirective,
    TuiAccordionItem,
    TuiAccordionItemContent,
    TuiExpandComponent,
    NgForOf,
    TuiInitialsPipe,
    NgIf,
    TuiIsPresentPipe,
    TuiObfuscatePipe,
    TuiReplacePipe,
    TuiKeysPipe,
    TuiToArrayPipe,
    TuiRepeatTimesPipe,
    TuiFormatNumberPipe,
    AsyncPipe,
    TuiBlockStatusDirective,
  ],
  templateUrl: './taiga-playground.component.html',
  styleUrl: './taiga-playground.component.css',
})
export class TaigaPlaygroundComponent {
  readonly frameworks = taigaFrameworks;
  readonly statuses = taigaStatuses;
  readonly tabs = taigaTabs;
  readonly users = taigaUsers;
  readonly sections = taigaMap;
  readonly tagSet = new Set(['pipes', 'layout', 'forms']);

  activeTabIndex = 1;
  expanded = true;
  checkboxValue = true;
  switchValue = true;
  sliderValue = 42;
  ratingValue = 4;
  comboValue = 'Taiga UI';
  selectValue = 'Ready';
  dateValue = new TuiDay(2026, 2, 14);
  numberValue = 512;
  chipValues = ['directive', 'pipe', 'component'];
  notes = 'Taiga dense playground for VSCode plugin e2e';
  maybeValue: string | null = 'present';
  creditCard = '1234567812345678';
  progress = 76;

  readonly scoreMatcher = (item: string, query: string): boolean => item.toLowerCase().includes(query.toLowerCase());

  togglePresence(): void {
    this.maybeValue = this.maybeValue ? null : 'present';
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }
}
