import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../Module/Authentication/service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

       // ถ้ามี Token ให้เพิ่ม Authorization Header ไปที่ Request
    if (token) {
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        // ส่ง Request ที่แปะ Token แล้วไปให้ Backend
        return next(clonedRequest);
    }
    // ถ้าไม่มี Token ก็ส่ง Request ปกติไปให้ Backend
    return next(req);
}