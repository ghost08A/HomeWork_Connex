import { Routes } from '@angular/router';
import { MemberRoute } from '../Shared/routers/member.const';
import { permissionGuard } from '../../core/guard/permission.guard';
import {MemberDashboardComponent} from './pages/member-dashboard/member-dashboard.component';

export const MEMBER_ROUTES: Routes = [
    {
        path: MemberRoute.memberDashboard,
        component: MemberDashboardComponent,
        canActivate: [permissionGuard],
        data: {pageCode : MemberRoute.memberDashboard}
    },
    {
        path: '',
        redirectTo: MemberRoute.memberDashboard,
        pathMatch: 'full'
    }
];