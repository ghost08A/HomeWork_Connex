import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { PostLoginService } from '../../layouts/post-login-layout/services/post-login.service';
import { GuardService } from '../../Module/Shared/services/guard.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const postLoginService = inject(PostLoginService);
    const guardService = inject(GuardService);
    const router = inject(Router);

    // 1. ดึง pageCode ออกมาจาก route.data ตรงๆ (ที่เซ็ตไว้ใน app.routes.ts)
    const pageCode = route.data['pageCode'];

    // 2. ถ้าหน้านี้ไม่มีการตั้งค่า pageCode (เช่น หน้า /home) ให้ปล่อยผ่านทันที
    if (!pageCode) {
        return true;
    }

    // 3. เอา pageCode ไปถามหลังบ้านเลยว่าเข้าได้ไหม
    return postLoginService.getPrivPage(pageCode).pipe(
        map((response) => {
            if (response && response.canAccess) {
                // 4. ถ้าเข้าได้ ให้จดสิทธิ์ (r/rw) ไว้ให้ปุ่มบนหน้าจอใช้งาน
                guardService.setPermission(response.permission);
                return true;
            }
            
            // ถ้าหลังบ้านบอก canAccess: false
            router.navigate(['/forbidden']);
            return false;
        }),
        catchError(() => {
            // ดักจับกรณี API พัง หรือ Token ขาด
            router.navigate(['/forbidden']);
            return of(false);
        })
    );
};