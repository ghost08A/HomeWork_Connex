    import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
    import { provideRouter } from '@angular/router';
    import { provideHttpClient , withInterceptors} from '@angular/common/http';
    import { routes } from './app.routes';
    import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
    import { authInterceptor } from './core/interceptor/auth.interceptor';

    export const appConfig: ApplicationConfig = {
      providers: [
        provideBrowserGlobalErrorListeners(),
        provideHttpClient(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideRouter(routes), provideClientHydration(withEventReplay())
      ]
    };
