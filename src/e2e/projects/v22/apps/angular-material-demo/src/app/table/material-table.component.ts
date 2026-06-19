import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatChip } from '@angular/material/chips';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { createMaterialEmployees, MaterialEmployee } from '../shared/material-demo.data';

@Component({
  selector: 'app-material-table',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatSuffix,
    MatButton,
    MatTable,
    MatSort,
    MatColumnDef,
    MatSortHeader,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatChip,
    CurrencyPipe,
    DatePipe,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
  ],
  templateUrl: './material-table.component.html',
  styleUrl: './material-table.component.css',
})
export class MaterialTableComponent implements AfterViewInit {
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
