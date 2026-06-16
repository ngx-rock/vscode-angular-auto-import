import { Route } from '@angular/router';
import { MaterialOverviewComponent } from './overview/material-overview.component';
import { MaterialTableComponent } from './table/material-table.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: MaterialOverviewComponent,
  },
  {
    path: 'table',
    component: MaterialTableComponent,
  },
];
