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
  TuiCheckbox,
  TuiExpand,
  TuiFormatNumberPipe,
  TuiHintDirective,
  TuiIcon,
  TuiLabel,
  TuiSlider,
  TuiTextfield,
} from '@taiga-ui/core';
import {
  TuiAccordion,
  TuiAvatar,
  TuiBadge,
  TuiBreadcrumbs,
  TuiChevron,
  TuiChip,
  TuiComboBox,
  TuiDataListWrapper,
  TuiInitialsPipe,
  TuiInputChip,
  TuiInputDate,
  TuiInputNumber,
  TuiMessage,
  TuiProgressBar,
  TuiProgressCircle,
  TuiRating,
  TuiSelect,
  TuiStatus,
  TuiSwitch,
  TuiTab,
  TuiTabsHorizontal,
  TuiTextarea,
} from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { TuiObfuscatePipe } from '@taiga-ui/cdk';

@Component({
  selector: 'app-taiga-playground',
  standalone: true,
  imports: [
    TuiHeaderComponent,
    TuiLogoComponent,
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
    TuiSlider,
    TuiRating,
    TuiTextfield,
    TuiComboBox,
    TuiDataListWrapper,
    TuiChevron,
    TuiSelect,
    TuiInputDate,
    TuiInputNumber,
    TuiInputChip,
    TuiTextarea,
    TuiBlockStatusComponent,
    TuiAppBarDirective,
    TuiAccordion,
    TuiExpand,
    NgForOf,
    TuiInitialsPipe,
    NgIf,
    TuiObfuscatePipe,
    TuiFormatNumberPipe,
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
  readonly sectionKeys = Object.keys(this.sections);
  readonly tagList = Array.from(this.tagSet);
  readonly repeatMarkers = Array.from({ length: 4 });
  readonly replacedLabel = 'taiga-ui playground'.replace(' ', '-');

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
