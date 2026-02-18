import {
    ApplicationConfig,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
    providers: [
      provideRouter(appRoutes),
      provideHttpClient(withInterceptors([authInterceptor])),
    ],
};

