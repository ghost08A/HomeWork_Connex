import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from '../../Module/Authentication/service/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, of } from 'rxjs';
import { GuardService } from '../../Module/Shared/services/guard.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);

    const router = inject(Router);
    const guardService = inject(GuardService);
    
    return authService.fetchGetProfile().pipe(
        map((profileRes) => {
            guardService.setPermission(profileRes.roles); // เก็บข้อมูลสิทธิ์ไว้ใน GuardService
            // อนุญาตให้เข้าถึงหน้าเพจได้ (ถ้าถึงตรงนี้ได้แสดงว่า Token ยังไม่หมดอายุ และดึงข้อมูลโปรไฟล์มาได้สำเร็จ)
            return true;
        }),
        catchError(() => {
            router.navigate(['/auth/login']);
            return of(false);
        })
    )
   
}