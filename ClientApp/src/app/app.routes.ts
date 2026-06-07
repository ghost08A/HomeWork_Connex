import { Routes } from '@angular/router';
import { LoginComponent } from './Module/Authentication/pages/login/login.component';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes =  [  
// 1. Pre-login layout routes
{
  path: 'auth',
  loadComponent: () => import('./layouts/pre-login-layout/pre-login-layout.component').then(m => m.PreLoginLayoutComponent),
  children: [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
      path: 'login',
      loadComponent: () => import('./Module/Authentication/pages/login/login.component').then(c => c.LoginComponent)
    },
    {
      path: 'register',
      loadComponent: () => import('./Module/Authentication/pages/register/register.component').then(c => c.RegisterComponent)
    }
  ]
},

// 2. Post-login layout routes (protected by auth guard)
{
  path: '',
  loadComponent: () => import('./layouts/post-login-layout/post-login-layout.component').then(m => m.PostLoginLayoutComponent),
  canActivate: [authGuard],
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
      path: 'home',
      loadComponent: () => import('./Module/home/pages/home/home.component').then(c => c.HomeComponent)
    }
  ]
},

// 3. Wildcard route for 404 - Not Found
{
  path: '**',
  redirectTo: 'home'
}

];
