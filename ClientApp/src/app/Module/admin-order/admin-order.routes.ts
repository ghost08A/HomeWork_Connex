import { Routes } from '@angular/router';
import { AdminOrderRoute } from '../Shared/routers/adminOrder.const';
import { OrderDashboardComponent } from './pages/order-dashboard/order-dashboard.component';
import { permissionGuard } from '../../core/guard/permission.guard';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';

export const ADMIN_ORDER_ROUTES: Routes = [
    {
        path: AdminOrderRoute.orderDashboard,
        component: OrderDashboardComponent,
        canActivate: [permissionGuard],
        data: {pageCode : AdminOrderRoute.orderDashboard}
    },
    {
        path: AdminOrderRoute.orderDetail,
        component: OrderDetailComponent, 
        canActivate: [permissionGuard],
        data: {pageCode : AdminOrderRoute.orderDetail}
    },
    {
        path: '',
        redirectTo: AdminOrderRoute.orderDashboard,
        pathMatch: 'full'
    
    }
];