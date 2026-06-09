
import { Routes } from '@angular/router';
import { ProductRoute } from '../Shared/routers/product.const';
import { ProductDashboardComponent } from './pages/product-dashboard/product-dashboard.component';
import { permissionGuard } from '../../core/guard/permission.guard';
import { ProductCategoryComponent } from './pages/product-category/product-category.component';

export const PRODUCT_ROUTES: Routes = [
    {
        //เส้นทางสำหรับ /product/product-dashboard
        path: ProductRoute.productDashboard,
        component: ProductDashboardComponent,
        canActivate: [permissionGuard],
        data: {pageCode : ProductRoute.productDashboard}
    },
    {
        //เส้นทางสำหรับ /product/product-category
        path: ProductRoute.productCategory,
        component: ProductCategoryComponent,
        canActivate: [permissionGuard],
        data: {pageCode : ProductRoute.productCategory}
    },
    {
        //ถ้ามีแค่ /product ให้รีไดเรกไปที่ /product/product-dashboard
        path: '',
        redirectTo: ProductRoute.productDashboard,
        pathMatch: 'full'
    }
];