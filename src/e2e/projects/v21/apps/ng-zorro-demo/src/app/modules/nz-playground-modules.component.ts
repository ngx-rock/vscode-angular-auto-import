import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropdownDirective, NzDropdownMenuComponent, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabComponent, NzTabsComponent } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTableItem, nzTableItems, nzTreeNodes } from '../shared/nz-playground.data';

@Component({
  selector: 'app-nz-playground-modules',
  standalone: true,
  imports: [
    FormsModule,
    NzAutocompleteModule,
    NzAvatarModule,
    NzBadgeModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzCollapseModule,
    NzDatePickerModule,
    NzDividerModule,
    NzDropDownModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzLayoutModule,
    NzMenuModule,
    NzModalModule,
    NzProgressModule,
    NzRadioModule,
    NzRateModule,
    NzSegmentedModule,
    NzSelectModule,
    NzSkeletonModule,
    NzSpinModule,
    NzStatisticModule,
    NzSwitchModule,
    NzTableModule,
    NzTabsComponent,
    NzTabComponent,
    NzTagModule,
    NzTooltipModule,
    NzTreeSelectModule,
    NzDropdownMenuComponent,
    NzDropdownDirective,
  ],
  templateUrl: './nz-playground-modules.component.html',
})
export class NzPlaygroundModulesComponent {
  readonly tableData = nzTableItems;
  readonly treeNodes = nzTreeNodes;
  readonly segmentedOptions = ['Smoke', 'Full', 'Parser'];

  searchValue = 'NG-ZORRO';
  selectedCity = 'Moscow';
  selectedMode = 'Parser';
  selectedDate = new Date('2026-03-14');
  selectedStatus = 'ready';
  selectedTreeNode = '0-1';
  checked = true;
  switched = true;
  radioValue = 'a';
  rateValue = 4;
  modalVisible = false;
  loading = false;
  progress = 76;

  readonly cityOptions = ['Moscow', 'Saint Petersburg', 'Kazan'];

  updateSort(sort: { key: string; value: string | null }): void {
    if (!sort.value) {
      return;
    }

    const direction = sort.value === 'ascend' ? 1 : -1;
    this.tableData.sort((a: NzTableItem, b: NzTableItem) => {
      const left = a[sort.key as keyof NzTableItem];
      const right = b[sort.key as keyof NzTableItem];
      if (left < right) {
        return -1 * direction;
      }
      if (left > right) {
        return 1 * direction;
      }
      return 0;
    });
  }
}
