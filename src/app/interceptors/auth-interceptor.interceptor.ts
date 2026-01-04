import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, finalize, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { TokenService } from '../services/auth/token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Debug: log the URL and skip status
    console.log('Interceptor - URL:', req.url, 'shouldSkip:', this.shouldSkipAuth(req));
    
    // Skip authentication for certain URLs
    if (this.shouldSkipAuth(req)) {
      return next.handle(req);
    }

    const token = this.tokenService.getToken();
    
    if (token && this.tokenService.isTokenValid(token.access)) {
      // Add valid token to request
      const authReq = this.addTokenToRequest(req, token.access);
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => this.handleAuthError(error, req, next))
      );
    } else if (token?.refresh && this.tokenService.isRefreshTokenValid(token.refresh)) {
      // Token is expired but refresh token exists, attempt refresh
      return this.handleTokenRefresh(req, next);
    } else {
      // No valid tokens, force logout
      console.warn('No valid tokens available, logging out user');
      this.authService.logout();
      return throwError(() => new Error('No valid authentication tokens'));
    }
  }

  private shouldSkipAuth(req: HttpRequest<any>): boolean {
    const url = req.url.toLowerCase();
    
    // Explicitly check for authentication endpoints that should never require auth
    const authEndpoints = [
      '/login/',
      '/register/',
      '/password-reset/',
      '/token/refresh'
    ];
    
    // Check if this is an authentication endpoint
    const isAuthEndpoint = authEndpoints.some(endpoint => url.includes(endpoint));
    
    // Skip auth for authentication endpoints
    if (isAuthEndpoint) {
      return true;
    }
    
    // Skip auth for non-API requests (external URLs, etc.)
    if (!url.includes('/api/')) {
      return true;
    }
    
    // All other API requests need authentication
    return false;
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
    if (error.status === 401) {
      const token = this.tokenService.getToken();
      
      // Check if we have a refresh token to try
      if (token?.refresh && this.tokenService.isRefreshTokenValid(token.refresh)) {
        return this.handleTokenRefresh(req, next);
      } else {
        // No refresh token or refresh token is also expired
        console.warn('401 error and no valid refresh token, logging out user');
        this.authService.logout();
        return throwError(() => new Error('Session expired. Please log in again.'));
      }
    }
    
    if (error.status === 403) {
      console.warn('403 Forbidden - User may not have required permissions');
      // Optionally logout on 403 depending on your app's requirements
      // this.authService.logout();
    }
    
    return throwError(() => error);
  }

  private handleTokenRefresh(
    req: HttpRequest<any>, 
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the result
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => {
          const newToken = this.tokenService.getToken();
          if (newToken?.access) {
            return next.handle(this.addTokenToRequest(req, newToken.access));
          }
          throw new Error('No token available after refresh');
        })
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.tokenService.refreshToken().pipe(
      switchMap((response) => {
        // Token refreshed successfully
        const newToken = this.tokenService.getToken();
        if (newToken?.access) {
          this.refreshTokenSubject.next(newToken.access);
          const authReq = this.addTokenToRequest(req, newToken.access);
          return next.handle(authReq);
        }
        throw new Error('No token received after refresh');
      }),
      catchError((refreshError) => {
        // Refresh failed, force logout
        console.error('Token refresh failed:', refreshError);
        this.refreshTokenSubject.next(null);
        this.authService.logout();
        return throwError(() => new Error('Session expired. Please log in again.'));
      }),
      finalize(() => {
        this.isRefreshing = false;
      })
    );
  }
}