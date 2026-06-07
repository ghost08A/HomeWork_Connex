import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, MonoTypeOperatorFunction, Observable,tap } from 'rxjs';
import { loginModel, registerModel } from '../models/authentication.model';
import { environment } from '../../../../environments/envaronment';
import { ErrorEditorState } from '../../Shared/directives/validate-error.directive';
import { catchErrorHandler } from '../../Shared/utils/swalHandler';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl ;

    private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    

    constructor(private http: HttpClient) {}

  public login(data: loginModel): Observable<any> {
    
    // 1. สร้างตั๋วพัสดุ (Observable) เตรียมส่ง Username/Password ไปให้หลังบ้าน
    return this.http.post(this.apiUrl+ '/Auth/login', data, {withCredentials:true})
    
      // 2. เอาพัสดุขากลับ (ผลการ Login) เข้าสายพาน (pipe) เพื่อดักรอก่อนส่งกลับไปหน้า UI
      .pipe(
        
        // 3. ใช้เครื่องแอบดู (tap) ดักว่า: 
        // "ถ้าหลังบ้านตอบกลับมาว่าล็อกอินสำเร็จนะ... ให้แอบไปทำคำสั่งข้างในวงเล็บนี้หน่อย"
        tap(() => {
            
          // 4. คำสั่งแทรกซ้อน: สั่งให้ไปดึงข้อมูลโปรไฟล์ (fetchGetProfile)
          // ⚠️ สาเหตุที่ต้องมี .subscribe() ตรงนี้ เพราะ fetchGetProfile() ก็เป็นพัสดุ (Observable) อีกกล่องนึง!
          // ถ้าไม่สั่ง subscribe() ขนส่งก็จะไม่ยอมวิ่งไปดึงข้อมูลโปรไฟล์มาให้ครับ
          this.fetchGetProfile().subscribe();
          
        })
      );
}

  //  เอาไว้ดึงข้อมูลส่วนตัว (เรียกใช้ตอนโหลดหน้าเว็บ หรือหลังล็อกอิน)
  public fetchGetProfile(): Observable<any> {
    return this.http.get(this.apiUrl + '/Auth/GetProfile', { withCredentials: true }).pipe(
      tap((user) => {
        this.currentUserSubject.next(user); // เก็บข้อมูล User ไว้ใน State
      }),
      catchError((err) => {
        this.currentUserSubject.next(null); // ถ้า Token หมดอายุ หรือ Error ก็เคลียร์ State ทิ้ง
        throw err;
      })
    );
  }

  public register(data: registerModel, validateHelper?: ErrorEditorState): Observable<any> {
    return this.http.post(this.apiUrl + '/Auth/register', data).pipe(this.apiPipe(validateHelper));
  }

 
  public isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;  }

  public logout(): Observable<any> {
    return this.http.post(this.apiUrl + '/Auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUserSubject.next(null); // เคลียร์ข้อมูล User ใน State
        localStorage.clear();
      })
    )
  }

  private apiPipe<T>(validateHelper?: ErrorEditorState): MonoTypeOperatorFunction<T> {
    return source$ =>
      source$.pipe(catchError(err => catchErrorHandler(err, validateHelper)));
  }
}
