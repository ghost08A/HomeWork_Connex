import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, MonoTypeOperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  ProductSearchRequestModel,
  ProductSearchResult,
  ProductForm
} from '../models/product.model';
import { environment } from '../../../../environments/envaronment';
import { ErrorEditorState } from '../../Shared/directives/validate-error.directive';
import { catchErrorHandler } from '../../Shared/utils/swalHandler';
import { valueOption } from '../../Shared/models/typecustom.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

    private apiUrl = environment.apiUrl + '/Product';

    constructor(private http: HttpClient) { }

    public getCategories(): Observable<valueOption[]> {
        return this.http.get<valueOption[]>(this.apiUrl + '/Categories').pipe(this.apiPipe());
    }

    public getStatusProducts(): Observable<valueOption[]> {
        return this.http.get<valueOption[]>(this.apiUrl + '/Statuses').pipe(this.apiPipe());
    }

    public searchProducts(request: ProductSearchRequestModel): Observable<ProductSearchResult> {
        return this.http.post<ProductSearchResult>(this.apiUrl + '/ProductSearch', request).pipe(this.apiPipe());
    }

    public createProduct(request: ProductForm, validateHelper?: ErrorEditorState): Observable<void> {
        return this.http.post<void>(this.apiUrl + '/CreateProduct', request).pipe(this.apiPipe(validateHelper));
    }

    public updateProduct(request: ProductForm, validateHelper?: ErrorEditorState): Observable<void> {
        return this.http.put<void>(this.apiUrl + '/UpdateProduct', request).pipe(this.apiPipe(validateHelper));
    }

    // ตัวดักจับ Error
    private apiPipe<T>(validateHelper?: ErrorEditorState): MonoTypeOperatorFunction<T> {
        return (source$) => source$.pipe(catchError((err) => catchErrorHandler(err, validateHelper)));
    }
}