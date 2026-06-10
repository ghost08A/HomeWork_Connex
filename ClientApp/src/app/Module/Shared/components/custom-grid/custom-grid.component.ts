import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { Employee, EmployeesService } from './test.service';

@Component({
  selector: 'custom-grid',
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './custom-grid.component.html',
  styleUrl: './custom-grid.component.scss',
})
export class CustomGridComponent {
    employees: Employee[] = [];
    selectedEmployee: Employee | undefined = undefined;
     constructor(service: EmployeesService) {
        this.employees = service.getEmployees();
    }
    selectEmployee(e: any) {
        this.selectedEmployee = e.selectedRowsData[0];
    }
    selectEmployeeByRow(e: any) {
        this.selectedEmployee = e.data;
    }
}
