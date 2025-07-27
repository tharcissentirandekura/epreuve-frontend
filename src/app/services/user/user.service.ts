import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of, interval } from 'rxjs';
import { map, catchError, tap, retry, timeout, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/token.service';
import { 
  User, 
  UserPreferences, 
  PasswordChangeData,
  ExtendedUserPreferences,
  NotificationSettings,
  PrivacySettings,
  AppearanceSettings,
  SecuritySettings,
  UserActivity,
  ActivityType,
  ActivityStats,
  AvatarValidationResult,
  AvatarUploadOptions
} from '../../models/user.model';

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
  
  // Extended preferences state management
  private preferencesSubject = new BehaviorSubject<ExtendedUserPreferences | null>(null);
  public preferences$ = this.preferencesSubject.asObservable();
  
  // Activity tracking state management
  private activitiesSubject = new BehaviorSubject<UserActivity[]>([]);
  public activities$ = this.activitiesSubject.asObservable();
  
  // Request timeout and retry configuration
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private readonly MAX_RETRIES = 2;

  // Activity tracking settings
  private isTrackingEnabled = true;
  private heartbeatInterval = 5 * 60 * 1000; // 5 minutes
  private lastInteractionTrack = 0;

  // Avatar upload default options
  private readonly DEFAULT_AVATAR_OPTIONS: AvatarUploadOptions = {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8
  };

  // Default preferences
  private readonly DEFAULT_PREFERENCES: ExtendedUserPreferences = {
    theme: 'light',
    language: 'fr',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      security: true,
      updates: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLastSeen: true,
      allowSearchByEmail: true,
      allowSearchByPhone: false
    },
    appearance: {
      theme: 'light',
      language: 'fr',
      fontSize: 'medium',
      colorScheme: 'default',
      compactMode: false
    },
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: 30,
      requirePasswordForSensitiveActions: true
    },
    lastUpdated: new Date()
  };

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.initializeUserState();
    this.startActivityTracking();
    this.loadExtendedPreferences();
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

  // Enhanced user preferences management
  private loadExtendedPreferences(): void {
    // Load preferences on initialization if user is logged in
    const cachedUser = this.tokenService.getUser();
    if (cachedUser) {
      this.loadPreferences().subscribe();
    }
  }

  loadPreferences(): Observable<ExtendedUserPreferences> {
    return this.http.get<any>(`${this.apiUrl}/preferences/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const prefs = this.mergeWithDefaults(response.data || response);
        this.preferencesSubject.next(prefs);
        return prefs;
      }),
      catchError((error) => {
        console.error('Load preferences error:', error);
        // Return default preferences on error
        const defaultPrefs = { ...this.DEFAULT_PREFERENCES };
        this.preferencesSubject.next(defaultPrefs);
        return throwError(() => this.handleError(error));
      })
    );
  }

  updateExtendedPreferences(preferences: Partial<ExtendedUserPreferences>): Observable<ExtendedUserPreferences> {
    const updatedPrefs = {
      ...this.getCurrentExtendedPreferences(),
      ...preferences,
      lastUpdated: new Date()
    };

    return this.http.put<any>(`${this.apiUrl}/preferences/`, updatedPrefs, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const prefs = this.mergeWithDefaults(response.data || response);
        this.preferencesSubject.next(prefs);
        this.applyPreferences(prefs);
        this.trackActivity(ActivityType.PREFERENCES_UPDATE, 'User preferences updated');
        return prefs;
      }),
      catchError((error) => {
        console.error('Update preferences error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // Update specific preference sections
  updateNotificationSettings(notifications: Partial<NotificationSettings>): Observable<ExtendedUserPreferences> {
    const currentPrefs = this.getCurrentExtendedPreferences();
    return this.updateExtendedPreferences({
      notifications: { ...currentPrefs.notifications, ...notifications }
    });
  }

  updatePrivacySettings(privacy: Partial<PrivacySettings>): Observable<ExtendedUserPreferences> {
    const currentPrefs = this.getCurrentExtendedPreferences();
    return this.updateExtendedPreferences({
      privacy: { ...currentPrefs.privacy, ...privacy }
    });
  }

  updateAppearanceSettings(appearance: Partial<AppearanceSettings>): Observable<ExtendedUserPreferences> {
    const currentPrefs = this.getCurrentExtendedPreferences();
    return this.updateExtendedPreferences({
      appearance: { ...currentPrefs.appearance, ...appearance }
    });
  }

  updateSecuritySettings(security: Partial<SecuritySettings>): Observable<ExtendedUserPreferences> {
    const currentPrefs = this.getCurrentExtendedPreferences();
    return this.updateExtendedPreferences({
      security: { ...currentPrefs.security, ...security }
    });
  }

  // Theme management
  setTheme(theme: 'light' | 'dark' | 'auto'): Observable<ExtendedUserPreferences> {
    return this.updateAppearanceSettings({ theme }).pipe(
      tap(() => this.applyTheme(theme))
    );
  }

  // Language management
  setLanguage(language: string): Observable<ExtendedUserPreferences> {
    return this.updateAppearanceSettings({ language }).pipe(
      tap(() => this.applyLanguage(language))
    );
  }

  // Get current preferences
  getCurrentExtendedPreferences(): ExtendedUserPreferences {
    return this.preferencesSubject.value || this.DEFAULT_PREFERENCES;
  }

  // Get specific preference sections
  getNotificationSettings(): NotificationSettings {
    return this.getCurrentExtendedPreferences().notifications;
  }

  getPrivacySettings(): PrivacySettings {
    return this.getCurrentExtendedPreferences().privacy;
  }

  getAppearanceSettings(): AppearanceSettings {
    return this.getCurrentExtendedPreferences().appearance;
  }

  getSecuritySettings(): SecuritySettings {
    return this.getCurrentExtendedPreferences().security;
  }

  // Reset preferences to defaults
  resetPreferencesToDefaults(): Observable<ExtendedUserPreferences> {
    return this.updateExtendedPreferences(this.DEFAULT_PREFERENCES);
  }

  // Export preferences
  exportPreferences(): string {
    const prefs = this.getCurrentExtendedPreferences();
    return JSON.stringify(prefs, null, 2);
  }

  // Import preferences
  importPreferences(preferencesJson: string): Observable<ExtendedUserPreferences> {
    try {
      const importedPrefs = JSON.parse(preferencesJson);
      const validatedPrefs = this.validatePreferences(importedPrefs);
      return this.updateExtendedPreferences(validatedPrefs);
    } catch (error) {
      return throwError(() => new Error('Invalid preferences format'));
    }
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

  // Enhanced activity tracking methods
  trackActivity(type: ActivityType, description: string, metadata?: any): Observable<void> {
    if (!this.isTrackingEnabled) {
      return of(void 0);
    }

    const activity = {
      type,
      description,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    return this.http.post<any>(`${this.apiUrl}/activities/`, activity, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.MAX_RETRIES),
      map(() => void 0),
      tap(() => this.refreshActivities()),
      catchError((error) => {
        console.error('Track activity error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // Get user activities
  getActivities(limit: number = 50, offset: number = 0): Observable<UserActivity[]> {
    return this.http.get<any>(`${this.apiUrl}/activities/`, {
      headers: this.getAuthHeaders(),
      params: { limit: limit.toString(), offset: offset.toString() }
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.MAX_RETRIES),
      map(response => {
        const activities = (response.data || response.results || []).map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
        
        if (offset === 0) {
          this.activitiesSubject.next(activities);
        }
        
        return activities;
      }),
      catchError((error) => {
        console.error('Get activities error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // Get activity statistics
  getActivityStats(): Observable<ActivityStats> {
    return this.http.get<any>(`${this.apiUrl}/activities/stats/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.MAX_RETRIES),
      map(response => ({
        ...response.data || response,
        lastLogin: new Date(response.lastLogin || response.last_login)
      })),
      catchError((error) => {
        console.error('Get activity stats error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // Security-related activities
  getSecurityActivities(): Observable<UserActivity[]> {
    return this.getActivities().pipe(
      map(activities => activities.filter(activity => 
        [
          ActivityType.LOGIN,
          ActivityType.LOGOUT,
          ActivityType.PASSWORD_CHANGE,
          ActivityType.TWO_FACTOR_ENABLED,
          ActivityType.TWO_FACTOR_DISABLED,
          ActivityType.SECURITY_ALERT
        ].includes(activity.type)
      ))
    );
  }

  // Device and session management
  getActiveDevices(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/devices/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.MAX_RETRIES),
      map(response => response.data || response.results || []),
      catchError((error) => {
        console.error('Get active devices error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  revokeDevice(deviceId: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/devices/${deviceId}/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.MAX_RETRIES),
      map(() => void 0),
      tap(() => this.trackActivity(
        ActivityType.SECURITY_ALERT, 
        'Device access revoked',
        { deviceId }
      )),
      catchError((error) => {
        console.error('Revoke device error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // Activity filtering and search
  filterActivities(
    type?: ActivityType, 
    startDate?: Date, 
    endDate?: Date
  ): Observable<UserActivity[]> {
    const params: any = {};
    
    if (type) params.type = type;
    if (startDate) params.start_date = startDate.toISOString();
    if (endDate) params.end_date = endDate.toISOString();

    return this.http.get<any>(`${this.apiUrl}/activities/filter/`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.MAX_RETRIES),
      map(response => (response.data || response.results || []).map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }))),
      catchError((error) => {
        console.error('Filter activities error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // Export activities
  exportActivities(format: 'json' | 'csv' = 'json'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/activities/export/`, {
      headers: this.getAuthHeaders(),
      params: { format },
      responseType: 'blob'
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.MAX_RETRIES),
      catchError((error) => {
        console.error('Export activities error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // Privacy and data management
  deleteActivityHistory(): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/activities/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.MAX_RETRIES),
      map(() => void 0),
      tap(() => {
        this.activitiesSubject.next([]);
        this.trackActivity(
          ActivityType.SECURITY_ALERT, 
          'Activity history deleted'
        );
      }),
      catchError((error) => {
        console.error('Delete activity history error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // Activity tracking controls
  enableActivityTracking(): void {
    this.isTrackingEnabled = true;
    this.trackActivity(ActivityType.PREFERENCES_UPDATE, 'Activity tracking enabled');
  }

  disableActivityTracking(): void {
    this.trackActivity(ActivityType.PREFERENCES_UPDATE, 'Activity tracking disabled');
    this.isTrackingEnabled = false;
  }

  // Enhanced avatar upload functionality
  validateAvatarFile(file: File, options?: AvatarUploadOptions): AvatarValidationResult {
    const opts = { ...this.DEFAULT_AVATAR_OPTIONS, ...options };
    const errors: string[] = [];

    // Check file size
    if (file.size > opts.maxSizeBytes!) {
      errors.push(`File size must be less than ${this.formatFileSize(opts.maxSizeBytes!)}`);
    }

    // Check file type
    if (!opts.allowedTypes!.includes(file.type)) {
      errors.push(`File type must be one of: ${opts.allowedTypes!.join(', ')}`);
    }

    // Check if file is actually an image
    if (!file.type.startsWith('image/')) {
      errors.push('File must be an image');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  createAvatarPreview(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();

      reader.onload = (e) => {
        observer.next(e.target?.result as string);
        observer.complete();
      };

      reader.onerror = (error) => {
        observer.error(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  processAvatarImage(file: File, options?: AvatarUploadOptions): Observable<File> {
    const opts = { ...this.DEFAULT_AVATAR_OPTIONS, ...options };

    return new Observable(observer => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const { width, height } = this.calculateImageDimensions(
          img.width,
          img.height,
          opts.maxWidth!,
          opts.maxHeight!
        );

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              observer.next(processedFile);
              observer.complete();
            } else {
              observer.error(new Error('Failed to process image'));
            }
          },
          file.type,
          opts.quality
        );
      };

      img.onerror = () => {
        observer.error(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  getAvatarImageDimensions(file: File): Observable<{ width: number; height: number }> {
    return new Observable(observer => {
      const img = new Image();

      img.onload = () => {
        observer.next({ width: img.width, height: img.height });
        observer.complete();
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        observer.error(new Error('Failed to load image'));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  generateAvatarThumbnail(file: File, size: number = 150): Observable<string> {
    return new Observable(observer => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;

        // Calculate crop dimensions for square thumbnail
        const minDimension = Math.min(img.width, img.height);
        const sx = (img.width - minDimension) / 2;
        const sy = (img.height - minDimension) / 2;

        ctx?.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size);

        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        observer.next(thumbnailDataUrl);
        observer.complete();
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        observer.error(new Error('Failed to generate thumbnail'));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Enhanced upload avatar method with processing
  uploadAvatarWithProcessing(file: File, options?: AvatarUploadOptions): Observable<string> {
    // First validate the file
    const validation = this.validateAvatarFile(file, options);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.errors.join(', ')));
    }

    // Process the image if needed
    return this.processAvatarImage(file, options).pipe(
      switchMap(processedFile => {
        const formData = new FormData();
        formData.append('avatar', processedFile);

        return this.http.post<any>(`${this.apiUrl}/upload-avatar/`, formData, {
          headers: this.getAuthHeaders()
        }).pipe(
          timeout(this.REQUEST_TIMEOUT),
          retry(this.MAX_RETRIES),
          map(response => {
            const avatarUrl = response.avatar_url || response.url;
            this.trackActivity(ActivityType.AVATAR_UPLOAD, 'Avatar uploaded successfully');
            return avatarUrl;
          })
        );
      }),
      catchError((error) => {
        console.error('Upload avatar error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  isAvatarUploadSupported(): boolean {
    return !!(
      window.FileReader &&
      window.File &&
      window.FileList &&
      window.Blob &&
      document.createElement('canvas').getContext
    );
  }

  // Backwards compatibility and activity tracking methods
  isActivityTrackingActive(): boolean {
    return this.isTrackingEnabled;
  }

  // User statistics (backwards compatibility)
  getUserStats(): Observable<any> {
    return this.getActivityStats();
  }

  // Utility methods for activity tracking
  getActivityTypeLabel(type: ActivityType): string {
    const labels: Record<ActivityType, string> = {
      [ActivityType.LOGIN]: 'Connexion',
      [ActivityType.LOGOUT]: 'Déconnexion',
      [ActivityType.PROFILE_UPDATE]: 'Mise à jour du profil',
      [ActivityType.PASSWORD_CHANGE]: 'Changement de mot de passe',
      [ActivityType.AVATAR_UPLOAD]: 'Upload d\'avatar',
      [ActivityType.PREFERENCES_UPDATE]: 'Mise à jour des préférences',
      [ActivityType.ACCOUNT_DELETION]: 'Suppression de compte',
      [ActivityType.TWO_FACTOR_ENABLED]: 'Authentification 2FA activée',
      [ActivityType.TWO_FACTOR_DISABLED]: 'Authentification 2FA désactivée',
      [ActivityType.SECURITY_ALERT]: 'Alerte de sécurité'
    };
    
    return labels[type] || type;
  }

  getActivityIcon(type: ActivityType): string {
    const icons: Record<ActivityType, string> = {
      [ActivityType.LOGIN]: 'bi-box-arrow-in-right',
      [ActivityType.LOGOUT]: 'bi-box-arrow-right',
      [ActivityType.PROFILE_UPDATE]: 'bi-person-gear',
      [ActivityType.PASSWORD_CHANGE]: 'bi-shield-lock',
      [ActivityType.AVATAR_UPLOAD]: 'bi-camera',
      [ActivityType.PREFERENCES_UPDATE]: 'bi-gear',
      [ActivityType.ACCOUNT_DELETION]: 'bi-trash',
      [ActivityType.TWO_FACTOR_ENABLED]: 'bi-shield-check',
      [ActivityType.TWO_FACTOR_DISABLED]: 'bi-shield-x',
      [ActivityType.SECURITY_ALERT]: 'bi-exclamation-triangle'
    };
    
    return icons[type] || 'bi-activity';
  }

  // Private helper methods for preferences
  private mergeWithDefaults(preferences: any): ExtendedUserPreferences {
    return {
      ...this.DEFAULT_PREFERENCES,
      ...preferences,
      notifications: { ...this.DEFAULT_PREFERENCES.notifications, ...preferences.notifications },
      privacy: { ...this.DEFAULT_PREFERENCES.privacy, ...preferences.privacy },
      appearance: { ...this.DEFAULT_PREFERENCES.appearance, ...preferences.appearance },
      security: { ...this.DEFAULT_PREFERENCES.security, ...preferences.security }
    };
  }

  private validatePreferences(preferences: any): Partial<ExtendedUserPreferences> {
    // Basic validation - in a real app, you'd want more comprehensive validation
    const validated: any = {};

    if (preferences.theme && ['light', 'dark', 'auto'].includes(preferences.theme)) {
      validated.theme = preferences.theme;
    }

    if (preferences.language && typeof preferences.language === 'string') {
      validated.language = preferences.language;
    }

    if (preferences.notifications && typeof preferences.notifications === 'object') {
      validated.notifications = preferences.notifications;
    }

    if (preferences.privacy && typeof preferences.privacy === 'object') {
      validated.privacy = preferences.privacy;
    }

    if (preferences.appearance && typeof preferences.appearance === 'object') {
      validated.appearance = preferences.appearance;
    }

    if (preferences.security && typeof preferences.security === 'object') {
      validated.security = preferences.security;
    }

    return validated;
  }

  private applyPreferences(preferences: ExtendedUserPreferences): void {
    this.applyTheme(preferences.appearance.theme);
    this.applyLanguage(preferences.appearance.language);
    this.applyFontSize(preferences.appearance.fontSize);
    this.applyColorScheme(preferences.appearance.colorScheme);
  }

  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);

    // Handle auto theme
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  private applyLanguage(language: string): void {
    document.documentElement.setAttribute('lang', language);
  }

  private applyFontSize(fontSize: string): void {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }

  private applyColorScheme(colorScheme: string): void {
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
  }

  // Private helper methods for activity tracking
  private startActivityTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isTrackingEnabled) {
        this.sendHeartbeat();
      }
    });

    // Periodic heartbeat to track active sessions
    interval(this.heartbeatInterval).pipe(
      switchMap(() => this.sendHeartbeat())
    ).subscribe();

    // Track user interactions
    this.trackUserInteractions();
  }

  private sendHeartbeat(): Observable<void> {
    if (!this.isTrackingEnabled) {
      return of(void 0);
    }

    return this.http.post<any>(`${this.apiUrl}/heartbeat/`, {
      timestamp: new Date().toISOString(),
      url: window.location.pathname
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      map(() => void 0),
      catchError(() => of(void 0))
    );
  }

  private trackUserInteractions(): void {
    // Track significant user actions
    const significantEvents = ['click', 'keydown', 'scroll'];
    
    significantEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {
        // Throttle events to avoid spam
        this.throttledInteractionTrack();
      }, { passive: true });
    });
  }

  private throttledInteractionTrack(): void {
    const now = Date.now();
    if (now - this.lastInteractionTrack > 60000) { // 1 minute throttle
      this.lastInteractionTrack = now;
      this.sendHeartbeat().subscribe();
    }
  }

  private refreshActivities(): void {
    this.getActivities().subscribe();
  }

  // Private helper methods for avatar upload
  private calculateImageDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // If image is larger than max dimensions, scale it down
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;

      if (width > height) {
        width = maxWidth;
        height = width / aspectRatio;
      } else {
        height = maxHeight;
        width = height * aspectRatio;
      }
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}