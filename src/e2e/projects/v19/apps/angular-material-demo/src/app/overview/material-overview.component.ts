import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, startWith } from 'rxjs/operators';
import { materialFeatureHighlights } from '../shared/material-demo.data';

import { MaterialDialogContentComponent } from '../material-dialog-content';
import { MatButton, MatAnchor, MatIconButton, MatMiniFabButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatDrawerContainer, MatDrawer, MatDrawerContent } from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';
import { MatBadge } from '@angular/material/badge';
import {
  MatSelectionList,
  MatListOption,
  MatNavList,
  MatListItem,
  MatListItemIcon,
  MatListItemTitle,
} from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatChipSet, MatChip, MatChipOption } from '@angular/material/chips';
import { MatFormField, MatLabel, MatPrefix, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatExpansionPanelDescription,
} from '@angular/material/expansion';
import { MatStepper, MatStep, MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';

@Component({
  selector: 'app-material-overview',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatAnchor,
    RouterLink,
    MatDrawerContainer,
    MatDrawer,
    MatIconButton,
    MatTooltip,
    MatMiniFabButton,
    MatBadge,
    MatSelectionList,
    MatListOption,
    MatDivider,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatDrawerContent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatFabButton,
    MatButtonToggleGroup,
    FormsModule,
    MatButtonToggle,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatChipSet,
    MatChip,
    MatCardActions,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatSuffix,
    MatHint,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    MatAutocomplete,
    AsyncPipe,
    MatOption,
    MatSelect,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatRadioGroup,
    MatRadioButton,
    MatCheckbox,
    MatSlideToggle,
    MatSlider,
    MatSliderThumb,
    MatProgressSpinner,
    MatProgressBar,
    MatGridList,
    MatGridTile,
    MatChipOption,
    MatTabGroup,
    MatTab,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatStepper,
    MatStep,
    MatStepperNext,
    MatStepperPrevious,
  ],
  templateUrl: './material-overview.component.html',
  styleUrl: './material-overview.component.css',
})
export class MaterialOverviewComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly highlights = materialFeatureHighlights;
  readonly quickActions = ['Smoke', 'Regression', 'Visual', 'A11y'];
  readonly selectionItems = ['Drawer nav', 'Toolbar', 'Forms', 'Overlays'];
  readonly assignees = ['UI Platform', 'Design Systems', 'QA Guild', 'Frontend Core'];

  readonly assigneeControl = new FormControl('UI Platform', {
    nonNullable: true,
  });
  readonly filteredAssignees = this.assigneeControl.valueChanges.pipe(
    startWith(this.assigneeControl.value),
    map(value => this.filterAssignees(value)),
  );

  releaseName = 'Material e2e lab';
  notes = 'Dense page with stable selectors and many Material directives.';
  priority: 'low' | 'normal' | 'high' = 'high';
  selectedTrack = 'material';
  shipDate = new Date('2026-03-28');
  notificationsEnabled = true;
  compactDensity = true;
  drawerOpened = true;
  selectedMode: 'smoke' | 'full' = 'smoke';
  selectedSection = 'forms';
  status = 'ready';
  progress = 67;
  selectedTags = ['chips', 'overlay'];
  latency = 30;

  openDialog(): void {
    this.dialog.open(MaterialDialogContentComponent, {
      width: '24rem',
      autoFocus: false,
    });
  }

  openSnackBar(): void {
    this.snackBar.open('Snack-bar opened for e2e verification', 'Dismiss', {
      duration: 3000,
    });
  }

  advanceProgress(): void {
    this.progress = Math.min(this.progress + 11, 100);
  }

  resetState(): void {
    this.releaseName = 'Material e2e lab';
    this.notes = 'Dense page with stable selectors and many Material directives.';
    this.priority = 'high';
    this.selectedTrack = 'material';
    this.shipDate = new Date('2026-03-28');
    this.notificationsEnabled = true;
    this.compactDensity = true;
    this.drawerOpened = true;
    this.selectedMode = 'smoke';
    this.selectedSection = 'forms';
    this.status = 'ready';
    this.progress = 67;
    this.selectedTags = ['chips', 'overlay'];
    this.latency = 30;
    this.assigneeControl.setValue('UI Platform');
  }

  private filterAssignees(value: string): string[] {
    const query = value.toLowerCase();
    return this.assignees.filter(item => item.toLowerCase().includes(query));
  }
}
