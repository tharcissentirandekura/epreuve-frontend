import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { Observable, tap, throwError } from "rxjs";
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment'
import { RegisterData, LoginCredentials } from "../../models/user.model";
import { Token } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  private tokenKey = "auth_token";

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(credentials: LoginCredentials): Observable<{ token: Token }> {
    return this.http.post<{ token: Token }>(`${this.apiUrl}/login/`, credentials)
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, JSON.stringify(response));
          }
        })
      );
  }

  register(user: RegisterData): Observable<RegisterData> {
    // Transform camelCase to snake_case for Django backend
    const backendData = {
      first_name: user.firstName,
      last_name: user.lastName,
      username: user.username,
      email: user.email,
      password: user.password,
      confirm_password: user.confirmPassword
    };

    return this.http.post<RegisterData>(`${this.apiUrl}/register/`, backendData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
    this.router.navigate(['/login']);
  }

  getToken(): Token | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const token = localStorage.getItem(this.tokenKey);
    return token ? JSON.parse(token) : null;
  }
  refreshToken(): Observable<{ token: Token }> {
    const currentToken = this.getToken();
    if (!currentToken || !currentToken.refresh) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ token: Token }>(`${this.apiUrl}/token/refresh`, { refresh: currentToken.refresh })
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, JSON.stringify(response.token));
          }
        })
      );
  }


  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !!token.access;
  }
}
