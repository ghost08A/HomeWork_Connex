import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Module/Authentication/service/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. ส่ง Request พร้อม Cookie (ให้หลังบ้านตรวจสอบ token ผ่าน cookie)
  let authReq = req.clone({
    withCredentials: true,
  });

  // 2. ปล่อย Request วิ่งไปหาหลังบ้าน และดักรอผลลัพธ์
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 🌐 เคส: Network Error หรือ 500 Internal Server Error
      if (error.status === 0 ) {
        router.navigate(['/network-error']);
        return throwError(() => error);
      }

      // 🔐 เคส: 401 Unauthorized (Access Token หมดอายุ)
      if (error.status === 401) {
        
        // ✋ ถ้าเป็น Request สำหรับ Refresh Token, Login, หรือ Logout แล้ว error 401
        // = ทั้ง Access Token และ Refresh Token หมดแล้ว -> ไปหน้า Login
        if (req.url.includes('/Auth/refresh-token') || req.url.includes('/Auth/login') || req.url.includes('/Auth/logout')) {
          authService.clearLocalSession();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }

        // 🔄 พยายาม Refresh Token จาก Backend (Backend จะตรวจสอบ Refresh Token ผ่าน Cookie)
        return authService.refreshToken().pipe(
          switchMap((res) => {
            // ✅ Refresh Token สำเร็จ -> ลอง Request เดิมอีกครั้ง (Cookie ใหม่ถูก set แล้ว)
            const retryReq = req.clone({
              withCredentials: true,
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            // ❌ Refresh Token ล้มเหลว -> ทั้ง Access Token และ Refresh Token หมดแล้ว
            authService.clearLocalSession();
            router.navigate(['/auth/login']);
            return throwError(() => refreshErr);
          })
        );
      }

      // 🚫 เคส: 403 Forbidden (ไม่มีสิทธิ์เข้าถึง)
      if (error.status === 403) {
        router.navigate(['/forbidden']);
        return throwError(() => error);
      }

      // เคส Error อื่นๆ (เช่น 404, 400) ปล่อยให้ Component จัดการ
      return throwError(() => error);
    })
  );
};