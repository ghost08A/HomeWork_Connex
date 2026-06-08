import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class GuardService {
    private permission: string = ''; // เก็บแค่ 'r', 'rw' หรือ ''

    constructor() {}
    
    // เก็บสิทธิ์เมื่อ Guard ยืนยันว่าเข้าได้
    public setPermission(permission: string): void { 
        this.permission = permission; 
    }
    
    // ดึงสิทธิ์ไปใช้งาน (ถ้าต้องการค่าดิบ)
    public getPermission(): string { 
        return this.permission; 
    }
    
    // เอาไว้ให้ไฟล์ HTML เช็คเพื่อเปิด/ปิดปุ่มอย่างรวดเร็ว (@if (guardService.canWrite()))
    public canWrite(): boolean { 
        return this.permission === 'rw'; 
    }
    
    
}