import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, MonoTypeOperatorFunction, Observable,tap } from 'rxjs';
import {  LoginRequestModel, RegisterModel } from '../models/authentication.model';
import { environment } from '../../../../environments/envaronment';
import { ErrorEditorState } from '../../Shared/directives/validate-error.directive';
import { catchErrorHandler } from '../../Shared/utils/swalHandler';
import { UserProfileResponseModel } from '../models/user-profile.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl ;

private currentUserSubject: BehaviorSubject<UserProfileResponseModel | null> = new BehaviorSubject<UserProfileResponseModel | null>(null);    public currentUser$ = this.currentUserSubject.asObservable();
    

    constructor(private http: HttpClient) {}

  public login(data: LoginRequestModel, validateHelper?: ErrorEditorState): Observable<any> {
    
    return this.http.post(this.apiUrl+ '/Auth/login', data, {withCredentials:true})
    
      .pipe(
      
        tap(() => {
       
          this.fetchGetProfile().subscribe();
        }),
        this.apiPipe(validateHelper)
      );
}

  public fetchGetProfile(): Observable<UserProfileResponseModel> {
    return this.http.get<UserProfileResponseModel>(this.apiUrl + '/Auth/GetProfile', { withCredentials: true }).pipe(
      tap((user) => {
        this.currentUserSubject.next(user); // เก็บข้อมูล User ไว้ใน State
      }),
      catchError((err) => {
        this.currentUserSubject.next(null); // ถ้า Token หมดอายุ หรือ Error ก็เคลียร์ State ทิ้ง
        throw err;
      })
    );
  }

  public register(data: RegisterModel, validateHelper?: ErrorEditorState): Observable<any> {
    return this.http.post(this.apiUrl + '/Auth/register', data).pipe(this.apiPipe(validateHelper));
  }
  
  public refreshToken(): Observable<any> {
    return this.http.post(this.apiUrl + '/Auth/refresh-token', {}, { withCredentials: true });
  }

  public clearLocalSession(): void {
    this.currentUserSubject.next(null); // เคลียร์ State
  }

 
  public isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;  }

  public logout(): Observable<any> {
    return this.http.post(this.apiUrl + '/Auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.clearLocalSession(); // เคลียร์ข้อมูล User ใน State
      }),
      catchError((err) => {
        this.clearLocalSession(); // เคลียร์ข้อมูล User ใน State แม้เกิด Error
        throw err;
      })
    )
  }

  private apiPipe<T>(validateHelper?: ErrorEditorState): MonoTypeOperatorFunction<T> {
    return source$ =>
      source$.pipe(catchError(err => catchErrorHandler(err, validateHelper)));
  }
}
