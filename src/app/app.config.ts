import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, HttpInterceptorFn } from '@angular/common/http';

import { routes } from './app.routes';

// Definimos el interceptor aquí mismo (o podrías moverlo a un archivo separado)
const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  // Si hay token, clonamos la petición y agregamos el header Authorization
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  
  // Si no hay token, la petición pasa igual (el backend decidirá si la rechaza)
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    // Configuramos HttpClient con fetch y el interceptor de autenticación
    provideHttpClient(
      withFetch(), 
      withInterceptors([authInterceptor])
    ) 
  ]
};