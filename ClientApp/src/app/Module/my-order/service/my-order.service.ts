import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, MonoTypeOperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/envaronment';
import { ErrorEditorState } from '../../Shared/directives/validate-error.directive';
import { catchErrorHandler } from '../../Shared/utils/swalHandler';
import { valueOption } from '../../Shared/models/typecustom.model';
import { OrderSearchRequestModel, OrderSearchResult } from '../models/order.model';
import {
  ProductDetail,
  UpsertOrderPayload,
  UpsertOrderResponse,
  GetOrderByIdResponse,
} from '../models/orderDetail.model';

@Injectable({
  providedIn: 'root',
})
export class MyOrderService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;

  public getProductOptions(onlyAvailable: boolean = false): Observable<valueOption[]> {
    let params = new HttpParams();

    if (onlyAvailable) {
      params = params.set('onlyAvailable', 'true');
    }

    // ผลลัพธ์จะได้ URL: /Product/Product หรือ /Product/Product?onlyAvailable=true
    return this.http
      .get<valueOption[]>(this.apiUrl + '/Product/Product', { params })
      .pipe(this.apiPipe()); // ใส่ Pipe ของคุณตามปกติ
  }

  public getStatusOrder(): Observable<valueOption[]> {
    return this.http.get<valueOption[]>(this.apiUrl + '/Order/OrderStatus').pipe(this.apiPipe());
  }

  public getProductById(productId: number): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.apiUrl}/Product/${productId}`).pipe(this.apiPipe());
  }

  public getOrderById(orderId: string): Observable<GetOrderByIdResponse> {
    return this.http
      .get<GetOrderByIdResponse>(`${this.apiUrl}/Order/${orderId}`)
      .pipe(this.apiPipe());
  }

  public searchOrders(request: OrderSearchRequestModel): Observable<OrderSearchResult> {
    return this.http
      .post<OrderSearchResult>(this.apiUrl + '/Order/SearchOrder', request)
      .pipe(this.apiPipe());
  }

  public upsertOrder(request: UpsertOrderPayload): Observable<UpsertOrderResponse> {
    return this.http
      .post<UpsertOrderResponse>(this.apiUrl + '/Order/UpsertOrder', request)
      .pipe(this.apiPipe());
  }

  // ตัวดักจับ Error
  private apiPipe<T>(validateHelper?: ErrorEditorState): MonoTypeOperatorFunction<T> {
    return (source$) => source$.pipe(catchError((err) => catchErrorHandler(err, validateHelper)));
  }
}
