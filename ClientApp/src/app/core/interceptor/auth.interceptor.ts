import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
const router = inject(Router);    
    const clonedRequest = req.clone({
        withCredentials: true
    })

    return next(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
            if(error.status === 401){
                router.navigate(['/auth/login']);
            }
            return throwError(() => error);
        }
        )
    );
}