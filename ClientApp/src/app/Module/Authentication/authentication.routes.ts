import { Routes } from '@angular/router';
import { AuthenticationRoute } from '../Shared/routers/authentication.const';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const AUTHENTICATION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: AuthenticationRoute.login,
    pathMatch: 'full',
  },
  {
    path: AuthenticationRoute.login,
    component: LoginComponent,
    data: { pageCode: AuthenticationRoute.loginPageCode },
  },
  {
    path: AuthenticationRoute.register,
    component: RegisterComponent,
    data: { pageCode: AuthenticationRoute.registerPageCode },
  },
];