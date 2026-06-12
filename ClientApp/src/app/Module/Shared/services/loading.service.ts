import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private requestCount = 0;
  // ตัวแปรส่วนกลางสำหรับบอกว่าตอนนี้ Loading อยู่หรือไม่
  public isLoading = signal<boolean>(false);

  show() {
    this.requestCount++;
    this.isLoading.set(true);
  }

  hide() {
    this.requestCount--;
    // ถ้านับแล้วไม่มี Request ค้างอยู่ ค่อยปิด Loading
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.isLoading.set(false);
    }
  }
}
