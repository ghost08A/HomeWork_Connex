import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guard/permission.guard';
import { MyOrderRoute } from '../Shared/routers/myOrder.const';
import { OrderDashboardComponent } from './pages/order-dashboard/order-dashboard.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';


export const MY_ORDER_ROUTES: Routes = [
    {
        path: MyOrderRoute.orderDashboard,
        component: OrderDashboardComponent,
        canActivate: [permissionGuard],
        data: {pageCode : MyOrderRoute.orderDashboard}
    },
    {
        path: MyOrderRoute.orderDetail,
        component: OrderDetailComponent,
        canActivate: [permissionGuard],
        data: {pageCode : MyOrderRoute.orderDashboard}
    },
    {
        path: '',
        redirectTo: MyOrderRoute.orderDashboard,
        pathMatch: 'full'
    
    }
]