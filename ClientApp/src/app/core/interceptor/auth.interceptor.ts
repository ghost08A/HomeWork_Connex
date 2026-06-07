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
      
      // 🌐 เคส: เน็ตหลุด / เซิร์ฟเวอร์ตาย
      if (error.status === 0 || error.status === 500) {
        router.navigate(['/network-error']);
        return throwError(() => error);
      }

      // 🔄 เคส: 401 Unauthorized (Token หมดอายุ)
      if (error.status === 401) {
        
        // 💡 [ป้องกัน Infinite Loop] 
        // ถ้า API ที่พังคือ API ขอ Refresh Token หรือ Login แปลว่าพังของจริง ห้ามยิงซ้ำ! ให้เตะออกเลย
        if (req.url.includes('/Auth/refresh-token') || req.url.includes('/Auth/login')) {
          authService.logout().subscribe(); // ล้างสิทธิ์
          router.navigate(['/unauthorized']);
          return throwError(() => error);
        }

        // แอบไปเรียก API ขอ Refresh Token
        return authService.refreshToken().pipe(
          switchMap((res) => {
            // สมมติว่าหลังบ้านส่ง Token ใหม่กลับมาใน body ให้เซ็ตลง localStorage ด้วย
            if (res && res.token) {
              localStorage.setItem('token', res.token);
              // โคลน Request อีกรอบเพื่ออัปเดต Token ตัวใหม่ล่าสุดก่อนยิงซ้ำ
              authReq = req.clone({
                withCredentials: true,
                setHeaders: { Authorization: `Bearer ${res.token}` }
              });
            }
            
            // ส่ง Request เดิมที่เคยพัง ไปใหม่อีกรอบ!
            return next(authReq);
          }),
          catchError((refreshErr) => {
            // ถ้า Refresh Token ก็หมดอายุ หรือตายสนิท -> เตะกลับหน้า Login
            authService.logout().subscribe();
            router.navigate(['/unauthorized']);
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