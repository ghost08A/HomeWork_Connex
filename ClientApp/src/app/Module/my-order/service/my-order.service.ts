import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, MonoTypeOperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/envaronment';
import { ErrorEditorState } from '../../Shared/directives/validate-error.directive';
import { catchErrorHandler } from '../../Shared/utils/swalHandler';
import { valueOption } from '../../Shared/models/typecustom.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

    private apiUrl = environment.apiUrl + '/Product';

    
    // ตัวดักจับ Error
    private apiPipe<T>(validateHelper?: ErrorEditorState): MonoTypeOperatorFunction<T> {
        return (source$) => source$.pipe(catchError((err) => catchErrorHandler(err, validateHelper)));
    }
}