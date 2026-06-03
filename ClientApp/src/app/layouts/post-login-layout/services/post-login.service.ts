import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/envaronment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostLoginService {
     private apiUrl = environment.apiUrl;

     constructor(private http: HttpClient) { }

     public getPages(){
        return this.http.get(this.apiUrl + '/Navbar/my-menus');
     }
}