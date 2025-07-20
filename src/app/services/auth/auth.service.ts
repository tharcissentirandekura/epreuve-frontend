
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserRole
} from '../../models/user.model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;

  // Enhanced authentication state management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Legacy support
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeAuth();
  }

  // Initialize authentication state on service creation
  private initializeAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.tokenService.cleanupExpiredTokens();

      if (this.tokenService.hasValidSession()) {
        const user = this.tokenService.getUser();
        if (user) {
          this.setAuthenticationState(true, user);
        } else {
          // Token exists but no user data, fetch user info
          this.fetchCurrentUser().subscribe({
            next: (user) => this.setAuthenticationState(true, user),
            error: () => this.logout()
          });
        }
      } else {
        this.setAuthenticationState(false, null);
      }
    }
  }

  // Enhanced authentication methods
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/login/`, {
      username: credentials.username,
      password: credentials.password
    }).pipe(
      tap(response => {
        // Store tokens using the new token service
        this.tokenService.setTokens(
          response.access,
          response.refresh,
          credentials.rememberMe || false
        );

        // Fetch and store user data
        this.fetchCurrentUser().subscribe({
          next: (user) => {
            this.tokenService.setUser(user);
            this.setAuthenticationState(true, user);
          },
          error: (error) => {
            console.error('Failed to fetch user data:', error);
            // Still set as authenticated but without user data
            this.setAuthenticationState(true, null);
          }
        });
      }),
      map(response => {
        if (!response.user) {
          throw new Error('No user data received from login');
        }
        return {
          user: response.user,
          access: response.access,
          refresh: response.refresh,
          expiresIn: response.expiresIn
        };
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    const registerPayload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      username: userData.username,
      email: userData.email,
      password: userData.password
    };

    return this.http.post<any>(`${this.apiUrl}/register/`, registerPayload)
      .pipe(
        map(response => {
          if (!response.user) {
            throw new Error('No user data received from registration');
          }
          return {
            user: response.user,
            access: response.access || '',
            refresh: response.refresh || '',
            expiresIn: response.expiresIn
          };
        }),
        catchError((error) => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    // Clear all authentication data
    this.tokenService.removeTokens();
    this.setAuthenticationState(false, null);

    // Navigate to home page
    this.router.navigate(['/home']);
  }

  // Enhanced authentication state management
  private setAuthenticationState(isAuthenticated: boolean, user: User | null): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
    this.currentUserSubject.next(user);

    // Legacy support
    this.isLoggedInSubject.next(isAuthenticated);
  }

  // Legacy support method
  setIsLoggedInState(isLoggedIn: boolean): void {
    this.isLoggedInSubject.next(isLoggedIn);
  }

  // Enhanced token management methods
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(`${this.apiUrl}/token/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        // Update access token
        this.tokenService.updateAccessToken(response.access);
      }),
      map(response => {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
          throw new Error('No current user available');
        }
        return {
          user: currentUser,
          access: response.access,
          refresh: refreshToken,
          expiresIn: response.expiresIn
        };
      }),
      catchError((error) => {
        console.error('Token refresh error:', error);
        // If refresh fails, logout user
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // User data methods
  fetchCurrentUser(): Observable<User> {
    const token = this.tokenService.getAccessToken();
    if (!token) {
      return throwError(() => new Error('No access token available'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/users/`, { headers }).pipe(
      map(response => {
        // Transform API response to User model
        const userData = response.data || response;
        return {
          id: userData.id,
          firstName: userData.first_name || userData.firstName,
          lastName: userData.last_name || userData.lastName,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
          role: userData.role || UserRole.USER,
          isActive: userData.is_active !== false,
          createdAt: userData.created_at ? new Date(userData.created_at) : undefined,
          updatedAt: userData.updated_at ? new Date(userData.updated_at) : undefined,
          preferences: userData.preferences
        } as User;
      }),
      catchError((error) => {
        console.error('Fetch user error:', error);
        return throwError(() => error);
      })
    );
  }

  // Public getter methods
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value && this.tokenService.hasValidSession();
  }

  // Legacy support methods
  getToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.tokenService.getRefreshToken();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getTokenExpirationDate(): Date | null {
    return this.tokenService.getTokenExpirationDate();
  }

  isTokenExpired(): boolean {
    return this.tokenService.isTokenExpired();
  }

  checkSession(): void {
    if (this.tokenService.shouldRefreshToken()) {
      // Attempt to refresh token
      this.refreshToken().subscribe({
        next: () => {
          console.log('Token refreshed successfully');
        },
        error: (error) => {
          console.error('Token refresh failed:', error);
          this.logout();
        }
      });
    } else if (!this.tokenService.hasValidSession()) {
      this.logout();
    }
  }

  // Social authentication placeholder
  socialLogin(provider: string): Observable<AuthResponse> {
    // This will be implemented when social auth is added
    return throwError(() => new Error('Social authentication not implemented yet'));
  }

  // User management methods
  getUser(): Observable<User> {
    return this.fetchCurrentUser();
  }

  // Legacy token methods for backward compatibility
  setToken(refresh: string, access: string): void {
    this.tokenService.setTokens(access, refresh, false);
  }

  removeToken(): void {
    this.tokenService.removeTokens();
  }
}