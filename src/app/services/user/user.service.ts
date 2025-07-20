import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/token.service';
import { User, UserPreferences, PasswordChangeData } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiBaseUrl;
  
  // Caching and state management
  private userCache = new Map<string, { data: User; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Request timeout and retry configuration
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private readonly MAX_RETRIES = 2;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.initializeUserState();
  }

  // Initialize user state from token service
  private initializeUserState(): void {
    const cachedUser = this.tokenService.getUser();
    if (cachedUser) {
      this.currentUserSubject.next(cachedUser);
    }
  }

  // Get authenticated headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Enhanced user profile operations with caching
  getProfile(useCache: boolean = true): Observable<User> {
    // Check cache first if enabled
    if (useCache) {
      const cached = this.getCachedUser('current');
      if (cached) {
        return of(cached);
      }
    }

    return this.http.get<any>(`${this.apiUrl}/profile/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.MAX_RETRIES),
      map(response => {
        const userData = response.data || response;
        const user = this.transformUserData(userData);
        
        // Cache the user data
        this.setCachedUser('current', user);
        this.currentUserSubject.next(user);
        this.tokenService.setUser(user);
        
        return user;
      }),
      catchError((error) => {
        console.error('Get profile error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // Helper method to transform API user data to User model
  private transformUserData(userData: any): User {
    return {
      id: userData.id,
      firstName: userData.first_name || userData.firstName,
      lastName: userData.last_name || userData.lastName,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar,
      role: userData.role,
      isActive: userData.is_active !== false,
      createdAt: userData.created_at ? new Date(userData.created_at) : undefined,
      updatedAt: userData.updated_at ? new Date(userData.updated_at) : undefined,
      preferences: userData.preferences
    } as User;
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    const updatePayload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar
    };

    return this.http.put<any>(`${this.apiUrl}/profile/`, updatePayload, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.MAX_RETRIES),
      map(response => {
        const updatedUser = this.transformUserData(response.data || response);
        
        // Update cache and state
        this.setCachedUser('current', updatedUser);
        this.currentUserSubject.next(updatedUser);
        this.tokenService.setUser(updatedUser);
        
        return updatedUser;
      }),
      catchError((error) => {
        console.error('Update profile error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  changePassword(passwordData: PasswordChangeData): Observable<void> {
    const payload = {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      confirm_password: passwordData.confirmPassword
    };

    return this.http.post<any>(`${this.apiUrl}/change-password/`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error('Change password error:', error);
        return throwError(() => error);
      })
    );
  }

  uploadAvatar(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<any>(`${this.apiUrl}/upload-avatar/`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.avatar_url || response.url),
      catchError((error) => {
        console.error('Upload avatar error:', error);
        return throwError(() => error);
      })
    );
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/profile/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error('Delete account error:', error);
        return throwError(() => error);
      })
    );
  }

  // User preferences management
  getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<any>(`${this.apiUrl}/preferences/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data || response),
      catchError((error) => {
        console.error('Get preferences error:', error);
        return throwError(() => error);
      })
    );
  }

  updatePreferences(preferences: UserPreferences): Observable<UserPreferences> {
    return this.http.put<any>(`${this.apiUrl}/preferences/`, preferences, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data || response),
      catchError((error) => {
        console.error('Update preferences error:', error);
        return throwError(() => error);
      })
    );
  }

  // Password reset functionality
  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/password-reset/`, { email }).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error('Password reset request error:', error);
        return throwError(() => error);
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/password-reset/confirm/`, {
      token,
      new_password: newPassword
    }).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error('Password reset error:', error);
        return throwError(() => error);
      })
    );
  }

  // Utility methods
  validateUsername(username: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/validate-username/`, { username }).pipe(
      map(response => response.available || false),
      catchError((error) => {
        console.error('Username validation error:', error);
        return throwError(() => error);
      })
    );
  }

  validateEmail(email: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/validate-email/`, { email }).pipe(
      map(response => response.available || false),
      catchError((error) => {
        console.error('Email validation error:', error);
        return throwError(() => error);
      })
    );
  }

  // Cache management methods
  private getCachedUser(key: string): User | null {
    const cached = this.userCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.userCache.delete(key);
    return null;
  }

  private setCachedUser(key: string, user: User): void {
    this.userCache.set(key, { data: user, timestamp: Date.now() });
  }

  // Error handling method
  private handleError(error: HttpErrorResponse): any {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 409:
          errorMessage = 'Conflict. Resource already exists.';
          break;
        case 422:
          errorMessage = 'Validation error. Please check your input.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    return {
      message: errorMessage,
      status: error.status,
      error: error.error
    };
  }

  // Additional user management methods
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshUserData(): Observable<User> {
    return this.getProfile(false); // Force refresh without cache
  }

  clearCache(): void {
    this.userCache.clear();
  }

  // User activity tracking
  updateLastActivity(): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/activity/`, {
      timestamp: new Date().toISOString()
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error('Update activity error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // User statistics
  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data || response),
      catchError((error) => {
        console.error('Get user stats error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }
}