import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import notify from 'devextreme/ui/notify';

// สมมติว่า ErrorEditorState ของคุณมีโครงสร้างประมาณนี้ (หรือ import ของคุณมาใช้ได้เลย)
export interface ErrorEditorState {
  setError: (field: string, message: string) => void;
}

export const catchErrorHandler = (
  err: HttpErrorResponse, 
  validateHelper?: ErrorEditorState
) => {
  // 1. ดักจับ Validation Error (400 Bad Request) ที่เป็น Array จาก Backend
  if (err.status === 400 && err.error?.errors && Array.isArray(err.error.errors)) {
    err.error.errors.forEach((item: any) => {
      // ถ้ามีหน้าเว็บส่ง validateHelper (เช่น this.registerState) เข้ามา ให้ปัก Error ลงฟิลด์
      if (validateHelper && item.field) {
        // จัดการเรื่องตัวพิมพ์เล็ก-ใหญ่ให้ตรงกับฟอร์ม
        const formattedField = item.field.toLowerCase(); 
        validateHelper.setError(formattedField, item.message);
      }
    });
    
    notify({ message: 'userName หรือ password ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง', type: 'error', displayTime: 3000 });
  } 
  // 2. ดักจับ Error ร้ายแรงอื่นๆ (เช่น 500 Server Error)
  else {
    const errorMessage = err.error?.message || err.error?.Message || 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ';
    notify({ message: errorMessage, type: 'error', displayTime: 3000 });
  }

  // ส่ง Error กลับออกไป เผื่อใครต้องการใช้ต่อ (มาตรฐาน RxJS ต้อง return แบบนี้ครับ)
  return throwError(() => err);
};