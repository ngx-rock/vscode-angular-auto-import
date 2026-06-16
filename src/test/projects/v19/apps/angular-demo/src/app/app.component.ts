import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {}
