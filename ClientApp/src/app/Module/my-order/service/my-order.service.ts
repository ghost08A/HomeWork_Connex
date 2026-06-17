import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, MonoTypeOperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/envaronment';
import { ErrorEditorState } from '../../Shared/directives/validate-error.directive';
import { catchErrorHandler } from '../../Shared/utils/swalHandler';
import { valueOption } from '../../Shared/models/typecustom.model';
import { OrderSearchRequestModel, OrderSearchResult } from '../models/order.model';
import { ProductDetail } from '../models/orderDetail.model';

@Injectable({
  providedIn: 'root'
})
export class MyOrderService {

    constructor(private http: HttpClient) { }
    private apiUrl = environment.apiUrl;

    public getProductOptions(): Observable<valueOption[]> {
        return this.http.get<valueOption[]>(this.apiUrl + '/Product/Product').pipe(this.apiPipe());
    }

    
    public getStatusOrder(): Observable<valueOption[]> {
        return this.http.get<valueOption[]>(this.apiUrl + '/Order/OrderStatus').pipe(this.apiPipe());
    }

    public getProductById(productId: number): Observable<ProductDetail>{
        return this.http.get<ProductDetail>(`${this.apiUrl}/Product/${productId}`).pipe(this.apiPipe());
    }

    public searchOrders(request: OrderSearchRequestModel): Observable<OrderSearchResult> {
            return this.http.post<OrderSearchResult>(this.apiUrl + '/Order/SearchOrder', request).pipe(this.apiPipe());
    }

    // ตัวดักจับ Error
    private apiPipe<T>(validateHelper?: ErrorEditorState): MonoTypeOperatorFunction<T> {
        return (source$) => source$.pipe(catchError((err) => catchErrorHandler(err, validateHelper)));
    }
}