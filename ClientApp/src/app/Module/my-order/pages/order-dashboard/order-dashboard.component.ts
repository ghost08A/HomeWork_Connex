import { Component } from '@angular/core';
import { SharedOrderDashboardComponent } from '../../../Shared/components/shared-order-dashboard/shared-order-dashboard.component';

@Component({
  selector: 'order-dashboard',
  standalone: true,
  imports: [SharedOrderDashboardComponent],
  template: '<shared-order-dashboard mode="USER"></shared-order-dashboard>',
})
export class OrderDashboardComponent {
}
