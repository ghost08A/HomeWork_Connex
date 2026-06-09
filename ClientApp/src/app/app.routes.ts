import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard';
import { PreLoginLayoutComponent } from './layouts/pre-login-layout/pre-login-layout.component';
import { PostLoginLayoutComponent } from './layouts/post-login-layout/post-login-layout.component';
import { AuthenticationRoute } from './Module/Shared/routers/authentication.const';
import { permissionGuard } from './core/guard/permission.guard';
import { ProductRoute } from './Module/Shared/routers/product.const';
import { HomeRoute } from './Module/Shared/routers/home.const';
import { MemberRoute } from './Module/Shared/routers/member.const';
import { MyOrderRoute } from './Module/Shared/routers/myOrder.const';
import { AdminOrderRoute } from './Module/Shared/routers/adminOrder.const';

export const routes: Routes = [
  // Redirect empty path to the default authentication route (e.g., 'auth/login')
  {
    path: '',
    redirectTo: AuthenticationRoute.prefix,
    pathMatch: 'full',
  },

  // --- PUBLIC ZONE ---
  // Routes accessible without login, wrapped in a simple layout.
  {
    path: AuthenticationRoute.prefix, // Resolves to 'auth'
    component: PreLoginLayoutComponent,
    loadChildren: () =>
      import('./Module/Authentication/authentication.routes').then(
        (m) => m.AUTHENTICATION_ROUTES
      ),
  },

  // --- SECURE ZONE ---
  // Routes accessible only after login, protected by authGuard and wrapped in the main app layout.
  {
    path: '',
    component: PostLoginLayoutComponent,
    canActivate: [authGuard,permissionGuard],
    children: [
      {
        path: '',
        redirectTo: HomeRoute.prefix,
        pathMatch: 'full',
      },
      {
        path: HomeRoute.prefix,
        loadChildren: () => import('./Module/home/home.routes').then(m => m.HOME_ROUTES)
      },
      {
        path: ProductRoute.prefix,
        loadChildren: () => import('./Module/product/product.routes').then(m => m.PRODUCT_ROUTES)
      },
      {
        path: MemberRoute.prefix,
        loadChildren: () => import('./Module/member/member.routes').then(m => m.MEMBER_ROUTES)
      },
      {
        path: MyOrderRoute.prefix,
        loadChildren: () => import('./Module/my-order/my-order.routes').then(m => m.MY_ORDER_ROUTES)
      },
      {
        path: AdminOrderRoute.prefix,
        loadChildren: () => import('./Module/admin-order/admin-order.routes').then(m => m.ADMIN_ORDER_ROUTES)
      }
    ],
  },

 { 
    path: 'not-found', 
    loadComponent: () => import('./layouts/not-found/not-found.component').then(c => c.NotFoundComponent) 
  },
  { 
    path: 'unauthorized', 
    loadComponent: () => import('./layouts/unauthorize/unauthorize.component').then(c => c.UnauthorizeComponent) 
  },
  { 
    path: 'forbidden', 
    loadComponent: () => import('./layouts/forbidden/forbidden.component').then(c => c.ForbiddenComponent) 
  },
  { 
    path: 'network-error', 
    loadComponent: () => import('./layouts/network-error/network-error.component').then(c => c.NetworkErrorComponent) 
  },

  // ⚠️ ป้ายสุดท้าย: ถ้าพิมพ์พาทมั่ว ไม่ตรงกับอะไรเลย ให้วิ่งไปที่หน้า 'not-found'
  { path: '**', redirectTo: 'not-found' }
];
