import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../../Module/Shared/services/loading.service';

// URL ที่ไม่ต้องการแสดง Loading (เช่น polling, refresh token, etc.)
const SKIP_LOADING_URLS = [
  '/Auth/refresh-token',
];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // ตรวจว่า Request นี้ควร skip Loading หรือไม่
  const shouldSkip = SKIP_LOADING_URLS.some(url => req.url.includes(url));
  if (shouldSkip) {
    return next(req);
  }

  // เปิด Loading ก่อนที่ Request จะยิงออกไป
  loadingService.show();

  return next(req).pipe(
    // finalize จะทำงานเสมอ ไม่ว่า Request จะสำเร็จหรือล้มเหลว
    finalize(() => {
      loadingService.hide();
    })
  );
};
