import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard';
import { PreLoginLayoutComponent } from './layouts/pre-login-layout/pre-login-layout.component';
import { PostLoginLayoutComponent } from './layouts/post-login-layout/post-login-layout.component';
import { AuthenticationRoute } from './Module/Shared/routers/authentication.const';

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
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadChildren: () => import('./Module/home/home.routes').then(m => m.HOME_ROUTES)
      },
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
