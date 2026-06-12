import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, MonoTypeOperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import Model จากไฟล์ที่คุณสร้างไว้
import { ProductSearchRequestModel, ProductSearchResponseModel, PageResultResponseModel } from '../models/product.model';
import { environment } from '../../../../environments/envaronment';
import { ErrorEditorState } from '../../Shared/directives/validate-error.directive';
import { catchErrorHandler } from '../../Shared/utils/swalHandler';
import { valueOption } from '../../Shared/models/typecustom.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService{

    private apiUrl = environment.apiUrl+'/Product';

    constructor(private http: HttpClient) { }

    public getCategories(): Observable<valueOption[]> {
        return this.http.get<valueOption[]>(this.apiUrl + '/Categories').pipe(this.apiPipe());
    }

    public getStatusProducts(): Observable<valueOption[]> {
        return this.http.get<valueOption[]>(this.apiUrl + '/Statuses').pipe(this.apiPipe());
    }

    public searchProducts(request: ProductSearchRequestModel): Observable<PageResultResponseModel<ProductSearchResponseModel>> {
        return this.http.post<PageResultResponseModel<ProductSearchResponseModel>>(this.apiUrl + '/ProductSearch', request).pipe(this.apiPipe());
    }

    // ตัวดักจับ Error 
  private apiPipe<T>(validateHelper?: ErrorEditorState): MonoTypeOperatorFunction<T> {
      return (source$) => source$.pipe(catchError((err) => catchErrorHandler(err, validateHelper)));
    }
}