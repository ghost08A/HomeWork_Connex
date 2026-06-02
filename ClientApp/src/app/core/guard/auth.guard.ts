import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from '../../Module/Authentication/service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // ถ้ามี Token ถือว่าล็อกอินแล้ว อนุญาตให้ผ่านได้ (return true)
    if (authService.isLoggedIn()) {
        return true;
     }

     // ถ้าไม่มี Token ให้ redirect ไปยังหน้า login
    router.navigate(['/login']);
    return false;
}