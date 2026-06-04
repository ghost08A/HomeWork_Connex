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
    return this.http.post(this.apiUrl+ '/Auth/login', data,{withCredentials:true}).pipe(
      tap(() => {
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
