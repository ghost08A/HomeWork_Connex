import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/envaronment';
import { HttpClient } from '@angular/common/http';
import { NavigationModel, PrivPageResponse } from '../models/navigation.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostLoginService {
     private apiUrl = environment.apiUrl;

     constructor(private http: HttpClient) { }

     public getNavbar(): Observable<NavigationModel[]> {
        return this.http.get<NavigationModel[]>(this.apiUrl + '/Navbar/menus', { withCredentials: true });
     }

     public getPrivPage(pageCode: string): Observable<PrivPageResponse> {
        return this.http.get<PrivPageResponse>(this.apiUrl + `/Permission/GetPrivPage/${pageCode}`, { withCredentials: true });
     }
}