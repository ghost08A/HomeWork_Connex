import { Component } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import { Employee, EmployeesService } from '../test.service';

@Component({
  selector: 'custom-grid',
  imports: [DxDataGridModule],
  templateUrl: './custom-grid.component.html',
  styleUrl: './custom-grid.component.scss',
})
export class CustomGridComponent {
    employees: Employee[] = [];
 
    constructor(service: EmployeesService) {
        this.employees = service.getEmployees();
    }
}
