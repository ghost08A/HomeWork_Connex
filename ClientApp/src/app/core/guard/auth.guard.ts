import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from '../../Module/Authentication/service/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, of } from 'rxjs';
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    console.log('AuthGuard: Checking authentication for route:', state.url);

    // ถ้ามี Token ถือว่าล็อกอินแล้ว อนุญาตให้ผ่านได้ (return true)
    if(isPlatformBrowser(platformId)){
        console.log('isPlatformBrowser', isPlatformBrowser(platformId));
        
        if (authService.isLoggedIn()) {
                console.log('AuthGuard: User is logged in, allowing access to route:', state.url);
                return true;
            }
    }

    //กรณีที่ไม่มีข้อมูลใน state  guard จะลองไป Auth/GetProfile เพื่อเช็คว่า Token ยังใช้ได้อยู่หรือไม่
    return authService.fetchGetProfile().pipe(
        map(user => {
            if (user) {
                console.log('AuthGuard: User profile fetched successfully, allowing access to route:', state.url);
                return true; // ถ้าได้ข้อมูลผู้ใช้กลับมา แสดงว่า Token ยังใช้ได้ อนุญาตให้ผ่าน
            }else{
                console.log('not found user');
                
                router.navigate(['/auth/login']); // ถ้าไม่ได้ข้อมูลผู้ใช้ แสดงว่า Token หมดอายุหรือไม่ถูกต้อง ให้ไปหน้า Login
                return false;
            }
        }),
        catchError(() => {
            router.navigate(['/auth/login']); // ถ้าเกิดข้อผิดพลาด เช่น Token หมดอายุ ให้ไปหน้า Login
            return of(false);
        })
    )
}