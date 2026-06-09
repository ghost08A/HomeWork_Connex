import { Routes } from '@angular/router';
import { AdminOrderRoute } from '../Shared/routers/adminOrder.const';
import { OrderDashboardComponent } from './pages/order-dashboard/order-dashboard.component';
import { permissionGuard } from '../../core/guard/permission.guard';

export const ADMIN_ORDER_ROUTES: Routes = [
    {
        path: AdminOrderRoute.orderDashboard,
        component: OrderDashboardComponent,
        canActivate: [permissionGuard],
        data: {pageCode : AdminOrderRoute.orderDashboard}
    },
    {
        path: '',
        redirectTo: AdminOrderRoute.orderDashboard,
        pathMatch: 'full'
    
    }
];