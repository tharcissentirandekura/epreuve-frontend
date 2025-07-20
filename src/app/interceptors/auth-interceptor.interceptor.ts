import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { TokenService } from '../services/auth/token.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip authentication for certain URLs
    if (this.shouldSkipAuth(req)) {
      return next.handle(req);
    }

    const token = this.tokenService.getAccessToken();
    
    if (token && this.tokenService.isTokenValid(token)) {
      // Add valid token to request
      const authReq = this.addTokenToRequest(req, token);
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => this.handleAuthError(error, req, next))
      );
    } else if (this.tokenService.shouldRefreshToken() && !this.isRefreshing) {
      // Token is expired but refresh token exists, attempt refresh
      return this.handleTokenRefresh(req, next);
    }

    // No valid token, proceed without authentication
    return next.handle(req);
  }

  private shouldSkipAuth(req: HttpRequest<any>): boolean {
    // Skip auth for login, register, password reset, and external URLs
    const skipUrls = [
      '/login/',
      '/register/',
      '/password-reset/',
      '/token/refresh/',
      'oauth',
      'facebook.com',
      'google.com'
    ];
    
    return skipUrls.some(url => req.url.includes(url)) || 
           !req.url.includes('/api/');
  }

  private addTokenToRequest(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handleAuthError(
    error: HttpErrorResponse, 
    req: HttpRequest<any>, 
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (error.status === 401 && !this.isRefreshing) {
      // Unauthorized - attempt token refresh
      return this.handleTokenRefresh(req, next);
    }
    
    return throwError(() => error);
  }

  private handleTokenRefresh(
    req: HttpRequest<any>, 
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      // If already refreshing, wait and retry with new token
      return throwError(() => new Error('Token refresh in progress'));
    }

    this.isRefreshing = true;

    return this.authService.refreshToken().pipe(
      switchMap((response) => {
        // Token refreshed successfully, retry original request
        const newToken = this.tokenService.getAccessToken();
        if (newToken) {
          const authReq = this.addTokenToRequest(req, newToken);
          return next.handle(authReq);
        }
        throw new Error('No token after refresh');
      }),
      catchError((refreshError) => {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError);
        this.authService.logout();
        return throwError(() => new Error('Session expired. Please log in again.'));
      }),
      finalize(() => {
        this.isRefreshing = false;
      })
    );
  }
}