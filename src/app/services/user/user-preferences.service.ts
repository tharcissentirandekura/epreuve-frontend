import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/token.service';


export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  security: boolean;
  updates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  showLastSeen: boolean;
  allowSearchByEmail: boolean;
  allowSearchByPhone: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'default' | 'blue' | 'green' | 'purple';
  compactMode: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number; // in minutes
  requirePasswordForSensitiveActions: boolean;
}

export interface ExtendedUserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  security: SecuritySettings;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private apiUrl = environment.apiBaseUrl;

  // State management
  private preferencesSubject = new BehaviorSubject<ExtendedUserPreferences | null>(null);
  public preferences$ = this.preferencesSubject.asObservable();

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
    this.loadPreferences();
  }

  // Get authenticated headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Load user preferences
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
        return throwError(() => error);
      })
    );
  }

  // Update all preferences
  updatePreferences(preferences: Partial<ExtendedUserPreferences>): Observable<ExtendedUserPreferences> {
    const updatedPrefs = {
      ...this.getCurrentPreferences(),
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
        return prefs;
      }),
      catchError((error) => {
        console.error('Update preferences error:', error);
        return throwError(() => error);
      })
    );
  }

  // Update specific preference sections
  updateNotificationSettings(notifications: Partial<NotificationSettings>): Observable<ExtendedUserPreferences> {
    const currentPrefs = this.getCurrentPreferences();
    return this.updatePreferences({
      notifications: { ...currentPrefs.notifications, ...notifications }
    });
  }

  updatePrivacySettings(privacy: Partial<PrivacySettings>): Observable<ExtendedUserPreferences> {
    const currentPrefs = this.getCurrentPreferences();
    return this.updatePreferences({
      privacy: { ...currentPrefs.privacy, ...privacy }
    });
  }

  updateAppearanceSettings(appearance: Partial<AppearanceSettings>): Observable<ExtendedUserPreferences> {
    const currentPrefs = this.getCurrentPreferences();
    return this.updatePreferences({
      appearance: { ...currentPrefs.appearance, ...appearance }
    });
  }

  updateSecuritySettings(security: Partial<SecuritySettings>): Observable<ExtendedUserPreferences> {
    const currentPrefs = this.getCurrentPreferences();
    return this.updatePreferences({
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
  getCurrentPreferences(): ExtendedUserPreferences {
    return this.preferencesSubject.value || this.DEFAULT_PREFERENCES;
  }

  // Get specific preference sections
  getNotificationSettings(): NotificationSettings {
    return this.getCurrentPreferences().notifications;
  }

  getPrivacySettings(): PrivacySettings {
    return this.getCurrentPreferences().privacy;
  }

  getAppearanceSettings(): AppearanceSettings {
    return this.getCurrentPreferences().appearance;
  }

  getSecuritySettings(): SecuritySettings {
    return this.getCurrentPreferences().security;
  }

  // Reset preferences to defaults
  resetToDefaults(): Observable<ExtendedUserPreferences> {
    return this.updatePreferences(this.DEFAULT_PREFERENCES);
  }

  // Export preferences
  exportPreferences(): string {
    const prefs = this.getCurrentPreferences();
    return JSON.stringify(prefs, null, 2);
  }

  // Import preferences
  importPreferences(preferencesJson: string): Observable<ExtendedUserPreferences> {
    try {
      const importedPrefs = JSON.parse(preferencesJson);
      const validatedPrefs = this.validatePreferences(importedPrefs);
      return this.updatePreferences(validatedPrefs);
    } catch (error) {
      return throwError(() => new Error('Invalid preferences format'));
    }
  }

  // Private helper methods
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
}