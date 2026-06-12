import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../../Module/Shared/services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // เปิด Loading ก่อนที่ Request จะยิงออกไป
  loadingService.show();
  
  return next(req).pipe(
    // finalize จะทำงานเสมอ ไม่ว่า Request จะสำเร็จหรือล้มเหลว
    finalize(() => {
      loadingService.hide();
    })
  );
};
