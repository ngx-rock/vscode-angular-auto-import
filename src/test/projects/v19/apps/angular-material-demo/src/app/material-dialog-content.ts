import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-material-dialog-content',
  standalone: true,
  imports: [MatDialogTitle, MatDialogActions, MatDialogContent, MatButton, MatDialogClose],
  template: `
    <h2 mat-dialog-title>Overlay target</h2>
    <mat-dialog-content>
      <p>This dialog exists mostly to give e2e tests a stable overlay target.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-flat-button color="primary" mat-dialog-close>Confirm</button>
    </mat-dialog-actions>
  `,
})
export class MaterialDialogContentComponent {}
