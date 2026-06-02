import { Routes } from '@angular/router';
import { LoginComponent } from './Module/Authentication/pages/login/login.component';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes =  [  
{ path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  
  // 2. ใช้ Lazy Loading วิ่งไปหา Authentication Module
 { 
    path: 'auth/login', 
    loadComponent: () => import('./Module/Authentication/pages/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./Module/Authentication/pages/register/register.component').then(c => c.RegisterComponent)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./Module/home/pages/home/home.component').then(c => c.HomeComponent)
  }




];
