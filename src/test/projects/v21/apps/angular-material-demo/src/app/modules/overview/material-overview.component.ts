import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { materialFeatureHighlights } from '../../shared/material-demo.data';
import { MaterialDialogContentComponent } from '../../material-dialog-content';

@Component({
  selector: 'app-material-overview',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTabsModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './material-overview.component.html',
  styleUrl: './material-overview.component.css',
})
export class MaterialOverviewModuleComponent {
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
