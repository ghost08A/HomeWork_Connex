    import { ApplicationConfig } from '@angular/core';
    import { provideRouter } from '@angular/router';
    import { HTTP_INTERCEPTORS, provideHttpClient , withInterceptorsFromDi} from '@angular/common/http';
    import { routes } from './app.routes';
    import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
    import { AuthInterceptor } from './core/interceptor/auth.interceptor';

    export const appConfig: ApplicationConfig = {
      providers: [
        provideRouter(routes), 
        provideClientHydration(withEventReplay()),

        // เปิดใช้งาน HttpClient พร้อมระบบรองรับคลาส Interceptor
        provideHttpClient(withInterceptorsFromDi()),
    
        // ลงทะเบียน AuthInterceptor ของเราเข้าไปในระบบ
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    };
