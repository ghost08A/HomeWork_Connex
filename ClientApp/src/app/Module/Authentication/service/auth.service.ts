import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { loginModel, registerModel } from '../models/authentication.model';
import { environment } from '../../../../environments/envaronment';
import { ErrorEditorState } from '../../Shared/directives/validate-error.directive';
import { catchErrorHandler } from '../../Shared/utils/swalHandler';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl ;

    constructor(private http: HttpClient) {}

   public login(data: loginModel): Observable<any> {
    // การทำงานคือ: ส่ง HTTP POST ไปที่ 'http://localhost:5140/api/auth/login' 
    // พร้อมกับแนบก้อนข้อมูล (data) ที่มี username กับ password ไปด้วย
    return this.http.post(this.apiUrl+ '/Auth/login', data);
  }

  public register(data: registerModel, validateHelper?: ErrorEditorState): Observable<any> {
    return this.http.post(this.apiUrl + '/Auth/register', data).pipe(this.apiPipe(validateHelper));
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  public isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  public logout(): void {
    localStorage.removeItem('token');
  }

  private apiPipe<T>(validateHelper?: ErrorEditorState): MonoTypeOperatorFunction<T> {
    return source$ =>
      source$.pipe(catchError(err => catchErrorHandler(err, validateHelper)));
  }
}
