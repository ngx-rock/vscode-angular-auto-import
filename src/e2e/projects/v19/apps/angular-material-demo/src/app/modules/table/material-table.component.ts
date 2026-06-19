import { CurrencyPipe, DatePipe } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { createMaterialEmployees, MaterialEmployee } from '../../shared/material-demo.data';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-material-table-module',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './material-table.component.html',
  styleUrl: './material-table.component.css',
})
export class MaterialTableModuleComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['id', 'name', 'role', 'squad', 'status', 'salary', 'joinedAt'];

  readonly dataSource = new MatTableDataSource<MaterialEmployee>(createMaterialEmployees());

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  addEmployee(): void {
    const nextId = this.dataSource.data.length + 1;
    const statusCycle: MaterialEmployee['status'][] = ['Ready', 'Review', 'Blocked'];
    const nextStatus = statusCycle[(nextId - 1) % statusCycle.length];

    this.dataSource.data = [
      ...this.dataSource.data,
      {
        id: nextId,
        name: `Demo User ${nextId}`,
        email: `demo.user.${nextId}@company.com`,
        role: nextId % 2 === 0 ? 'UI Engineer' : 'Product Engineer',
        squad: nextId % 2 === 0 ? 'Growth' : 'Design Systems',
        status: nextStatus,
        salary: 150000 + nextId * 7000,
        joinedAt: '2026-03-14',
      },
    ];
  }

  resetTable(): void {
    this.dataSource.data = createMaterialEmployees();
    this.dataSource.filter = '';
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
}
