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
import { HttpHeaders } from '@angular/common/http';

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

  login(credentials: LoginCredentials): Observable<Token> {
    return this.http.post<Token>(`${this.apiUrl}/login/`, credentials)
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            // store the token - response is directly a Token object
            this.tokenService.setToken(response);
            
            // Only get user AFTER token is stored and verified
            setTimeout(() => {
              const token = this.tokenService.getToken();
              if (token?.access) {
                this.userService.getCurrentUser().subscribe({
                  next: (user) => {
                    this.tokenService.setUser(user);
                  },
                  error: (error) => {
                    console.error('Error fetching current user:', error);
                  }
                });
              }
            }, 100);
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

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<RegisterData>(
      `${this.apiUrl}/register/`,
      backendData,
      { headers }
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // token-related storage
      this.tokenService.removeTokens();
      // Only navigate if we're in the browser
      this.router.navigate(['/login']);
    }
  }

  // Silent logout for token expiration (no navigation)
  silentLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
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
