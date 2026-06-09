import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { HomeRoute } from '../Shared/routers/home.const';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,

  },
];