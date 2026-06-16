import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BadgeModule, RouterOutlet, ToolbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
