import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from '../../Module/Authentication/service/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    // ถ้ามี Token ถือว่าล็อกอินแล้ว อนุญาตให้ผ่านได้ (return true)
    if(isPlatformBrowser(platformId)){
        if (authService.isLoggedIn()) {
                return true;
            }
    }
    

     // ถ้าไม่มี Token ให้ redirect ไปยังหน้า login
    router.navigate(['/auth/login']);
    return false;
}