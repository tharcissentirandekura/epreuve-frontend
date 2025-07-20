import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
        
        // Handle different types of errors
        switch (error.status) {
          case 401:
            return this.handle401Error(error);
          case 403:
            return this.handle403Error(error);
          case 404:
            return this.handle404Error(error);
          case 429:
            return this.handle429Error(error);
          case 500:
          case 502:
          case 503:
          case 504:
            return this.handleServerError(error);
          case 0:
            return this.handleNetworkError(error);
          default:
            return this.handleGenericError(error);
        }
      })
    );
  }

  private handle401Error(error: HttpErrorResponse): Observable<never> {
    // Unauthorized - token expired or invalid
    if (!this.isAuthUrl(error.url)) {
      console.warn('Unauthorized access, logging out user');
      this.authService.logout();
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
    }
    
    return throwError(() => this.createUserFriendlyError(
      'Session expirée. Veuillez vous reconnecter.',
      error
    ));
  }

  private handle403Error(error: HttpErrorResponse): Observable<never> {
    // Forbidden - insufficient permissions
    console.warn('Access forbidden:', error);
    
    // Don't redirect if already on an error page
    if (!this.router.url.includes('/unauthorized')) {
      this.router.navigate(['/unauthorized']);
    }
    
    return throwError(() => this.createUserFriendlyError(
      'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
      error
    ));
  }

  private handle404Error(error: HttpErrorResponse): Observable<never> {
    // Not found
    console.warn('Resource not found:', error.url);
    
    return throwError(() => this.createUserFriendlyError(
      'Ressource non trouvée.',
      error
    ));
  }

  private handle429Error(error: HttpErrorResponse): Observable<never> {
    // Too many requests
    console.warn('Rate limit exceeded:', error);
    
    return throwError(() => this.createUserFriendlyError(
      'Trop de requêtes. Veuillez patienter avant de réessayer.',
      error
    ));
  }

  private handleServerError(error: HttpErrorResponse): Observable<never> {
    // Server errors (5xx)
    console.error('Server error:', error);
    
    let message = 'Erreur du serveur. Veuillez réessayer plus tard.';
    
    if (error.status === 502) {
      message = 'Service temporairement indisponible.';
    } else if (error.status === 503) {
      message = 'Service en maintenance. Veuillez réessayer plus tard.';
    } else if (error.status === 504) {
      message = 'Délai d\'attente dépassé. Veuillez réessayer.';
    }
    
    return throwError(() => this.createUserFriendlyError(message, error));
  }

  private handleNetworkError(error: HttpErrorResponse): Observable<never> {
    // Network error (status 0)
    console.error('Network error:', error);
    
    return throwError(() => this.createUserFriendlyError(
      'Problème de connexion. Vérifiez votre connexion internet.',
      error
    ));
  }

  private handleGenericError(error: HttpErrorResponse): Observable<never> {
    // Generic error handling
    console.error('Generic error:', error);
    
    let message = 'Une erreur inattendue s\'est produite.';
    
    // Try to extract error message from response
    if (error.error) {
      if (typeof error.error === 'string') {
        message = error.error;
      } else if (error.error.message) {
        message = error.error.message;
      } else if (error.error.detail) {
        message = error.error.detail;
      } else if (error.error.error) {
        message = error.error.error;
      }
    }
    
    return throwError(() => this.createUserFriendlyError(message, error));
  }

  private isAuthUrl(url: string | null): boolean {
    if (!url) return false;
    
    const authUrls = ['/login/', '/register/', '/token/refresh/'];
    return authUrls.some(authUrl => url.includes(authUrl));
  }

  private createUserFriendlyError(message: string, originalError: HttpErrorResponse): any {
    return {
      message,
      status: originalError.status,
      statusText: originalError.statusText,
      url: originalError.url,
      timestamp: new Date().toISOString(),
      originalError
    };
  }
}

// Error handling service for components to use
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  
  handleAuthError(error: any): string {
    if (!error) return 'Une erreur inattendue s\'est produite.';
    
    // If it's our custom error format
    if (error.message) {
      return error.message;
    }
    
    // Handle HTTP error responses
    if (error.status) {
      switch (error.status) {
        case 400:
          return this.handleValidationError(error);
        case 401:
          return 'Nom d\'utilisateur ou mot de passe incorrect.';
        case 403:
          return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        case 404:
          return 'Utilisateur non trouvé. Vérifiez vos identifiants.';
        case 409:
          return 'Ce nom d\'utilisateur ou email existe déjà.';
        case 429:
          return 'Trop de tentatives. Veuillez réessayer plus tard.';
        case 500:
          return 'Erreur du serveur. Veuillez réessayer plus tard.';
        default:
          return 'Une erreur inattendue s\'est produite.';
      }
    }
    
    return 'Une erreur inattendue s\'est produite.';
  }

  private handleValidationError(error: any): string {
    if (error.error && error.error.errors) {
      const firstError = Object.values(error.error.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError as string;
    }
    return 'Veuillez vérifier vos informations et réessayer.';
  }

  handleFormError(error: any, fieldName?: string): string {
    if (fieldName && error.error && error.error.errors && error.error.errors[fieldName]) {
      const fieldError = error.error.errors[fieldName];
      return Array.isArray(fieldError) ? fieldError[0] : fieldError;
    }
    
    return this.handleAuthError(error);
  }
}