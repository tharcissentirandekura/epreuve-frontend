import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { Observable, tap, throwError } from "rxjs";
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment'
import { RegisterData, LoginCredentials } from "../../models/user.model";
import { Token } from '../../models/auth.model';
import { TokenService } from "./token.service";
import { UserService } from "./user/user.service";
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  private tokenKey = "auth_token";

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private userService: UserService,
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
    const backendData = {
      username: user.username,
      password: user.password,
      confirm_password: user.confirmPassword
    };

    return this.http.post<RegisterData>(`${this.apiUrl}/register/`, backendData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      // Also clean up any other token-related storage
      this.tokenService.removeTokens();
      // Only navigate if we're in the browser
      this.router.navigate(['/login']);
    }
  }

  // Silent logout for token expiration (no navigation)
  silentLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      this.tokenService.removeTokens();
    }
  }

  isAuthenticated(): boolean {
    // Don't perform token validation during SSR to avoid timeouts
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = this.tokenService.getToken();
    if (!token || !token.access) {
      return false;
    }

    // Check if access token is still valid
    const isValid = this.tokenService.isTokenValid(token.access);

    if (!isValid) {
      // Token is expired, clean up silently (don't call logout to avoid router navigation during SSR)
      this.tokenService.removeTokens();
      return false;
    }

    return true;
  }
}
