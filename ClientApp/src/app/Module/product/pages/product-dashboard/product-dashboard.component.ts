import { Component } from '@angular/core';
import { CustomGridComponent } from '../../../Shared/components/custom-grid/custom-grid/custom-grid.component';

@Component({
  selector: 'product-dashboard',
  imports: [CustomGridComponent],
  templateUrl: './product-dashboard.component.html',
  styleUrl: './product-dashboard.component.scss',
})
export class ProductDashboardComponent {}
