import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Module/Authentication/service/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. โคลน Request เพื่อแนบ Cookie และ Token ไปด้วยอัตโนมัติ
  let authReq = req.clone({
    withCredentials: true,
  });

  // 2. ปล่อย Request วิ่งไปหาหลังบ้าน และดักรอผลลัพธ์
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
     
      if (error.status === 0 || error.status === 500) {
        router.navigate(['/network-error']);
        return throwError(() => error);
      }

      if (error.status === 401) {
        
       
        if (req.url.includes('/Auth/refresh-token') || req.url.includes('/Auth/login') || req.url.includes('/Auth/logout')) {
          authService.clearLocalSession();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }

        // แอบไปเรียก API ขอ Refresh Token
        return authService.refreshToken().pipe(
          switchMap((res) => {
            const retryReq = req.clone({
              withCredentials: true, // แนบ Cookie ไปด้วยเหมือนเดิม
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            // ถ้า Refresh Token ก็หมดอายุ หรือตายสนิท -> เตะกลับหน้า Login
            authService.clearLocalSession();
            // router.navigate(['/unauthorized']);
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

      // เคส Error อื่นๆ (เช่น 500, 404, 400) ปล่อยให้ Component จัดการ
      return throwError(() => error);
    })
  );
};