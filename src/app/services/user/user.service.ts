import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/token.service';
import { User, UserPreferences, PasswordChangeData } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiBaseUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Initialize with cached user if available
    const cachedUser = this.tokenService.getUser();
    if (cachedUser) {
      this.currentUserSubject.next(cachedUser);
    }
  }

  private get headers(): HttpHeaders {
    const token = this.tokenService.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Core user operations
  getProfile(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/profile/`, { headers: this.headers })
      .pipe(
        map(response => this.transformUserData(response.data || response)),
        tap(user => this.updateUserState(user)),
        catchError(this.handleError)
      );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    const payload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar
    };

    return this.http.put<any>(`${this.apiUrl}/profile/`, payload, { headers: this.headers })
      .pipe(
        map(response => this.transformUserData(response.data || response)),
        tap(user => this.updateUserState(user)),
        catchError(this.handleError)
      );
  }

  changePassword(passwordData: PasswordChangeData): Observable<void> {
    const payload = {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      confirm_password: passwordData.confirmPassword
    };

    return this.http.post<any>(`${this.apiUrl}/change-password/`, payload, { headers: this.headers })
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  uploadAvatar(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<any>(`${this.apiUrl}/upload-avatar/`, formData, { headers: this.headers })
      .pipe(
        map(response => response.avatar_url || response.url),
        catchError(this.handleError)
      );
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/profile/`, { headers: this.headers })
      .pipe(
        map(() => void 0),
        tap(() => this.clearUserState()),
        catchError(this.handleError)
      );
  }

  // User preferences
  getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<any>(`${this.apiUrl}/preferences/`, { headers: this.headers })
      .pipe(
        map(response => response.data || response),
        catchError(this.handleError)
      );
  }

  updatePreferences(preferences: UserPreferences): Observable<UserPreferences> {
    return this.http.put<any>(`${this.apiUrl}/preferences/`, preferences, { headers: this.headers })
      .pipe(
        map(response => response.data || response),
        catchError(this.handleError)
      );
  }

  // Password reset
  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/password-reset/`, { email })
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/password-reset/confirm/`, {
      token,
      new_password: newPassword
    }).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  // User state management
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshUserData(): Observable<User> {
    return this.getProfile();
  }

  // Helper methods
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

  private updateUserState(user: User): void {
    this.currentUserSubject.next(user);
    this.tokenService.setUser(user);
  }

  private clearUserState(): void {
    this.currentUserSubject.next(null);
    this.tokenService.clearUser();
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('UserService error:', error);
    
    const errorMap: Record<number, string> = {
      400: 'Bad request. Please check your input.',
      401: 'Unauthorized. Please log in again.',
      403: 'Forbidden. You do not have permission.',
      404: 'Resource not found.',
      409: 'Conflict. Resource already exists.',
      422: 'Validation error. Please check your input.',
      500: 'Internal server error. Please try again later.'
    };

    const message = error.error instanceof ErrorEvent 
      ? `Error: ${error.error.message}`
      : errorMap[error.status] || `Error Code: ${error.status}`;

    return throwError(() => ({
      message,
      status: error.status,
      error: error.error
    }));
  };
}