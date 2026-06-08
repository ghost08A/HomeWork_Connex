import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from '../../Module/Authentication/service/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, of } from 'rxjs';
import { GuardService } from '../../Module/Shared/services/guard.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);

    const router = inject(Router);    
    return authService.fetchGetProfile().pipe(
        map((profileRes) => {
            return true;
        }),
        catchError(() => {
            router.navigate(['/auth/login']);
            return of(false);
        })
    )
   
}