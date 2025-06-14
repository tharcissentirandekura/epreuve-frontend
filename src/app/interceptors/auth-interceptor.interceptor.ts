import { HttpInterceptorFn } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      const clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next.handle(clonedReq).pipe(
        catchError((error) => {
          if (error.status === 401) {
            // Attempt to refresh token if unauthorized
            return this.authService.refreshToken().pipe(
              switchMap((newToken: any) => {
                const newReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken.access}` },
                });
                return next.handle(newReq);
              }),
              catchError(() => {
                this.authService.logout();
                return throwError(() => new Error('Session expired. Please log in again.'));
              })
            );
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req);
  }
}