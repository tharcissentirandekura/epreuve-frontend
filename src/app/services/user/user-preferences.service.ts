import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { 
  ExtendedUserPreferences,
  NotificationSettings,
  PrivacySettings,
  AppearanceSettings,
  SecuritySettings
} from '../../models/user.model';

// Re-export interfaces for backwards compatibility
export { 
  ExtendedUserPreferences,
  NotificationSettings,
  PrivacySettings,
  AppearanceSettings,
  SecuritySettings
} from '../../models/user.model';

/**
 * @deprecated Use UserService instead. This service is maintained for backwards compatibility.
 * All functionality has been consolidated into the main UserService.
 */
@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  // Delegate all functionality to the consolidated UserService
  constructor(private userService: UserService) {}

  // State management - delegate to main service
  get preferences$() {
    return this.userService.preferences$;
  }

  // Load user preferences
  loadPreferences(): Observable<ExtendedUserPreferences> {
    return this.userService.loadPreferences();
  }

  // Update all preferences
  updatePreferences(preferences: Partial<ExtendedUserPreferences>): Observable<ExtendedUserPreferences> {
    return this.userService.updateExtendedPreferences(preferences);
  }

  // Update specific preference sections
  updateNotificationSettings(notifications: Partial<NotificationSettings>): Observable<ExtendedUserPreferences> {
    return this.userService.updateNotificationSettings(notifications);
  }

  updatePrivacySettings(privacy: Partial<PrivacySettings>): Observable<ExtendedUserPreferences> {
    return this.userService.updatePrivacySettings(privacy);
  }

  updateAppearanceSettings(appearance: Partial<AppearanceSettings>): Observable<ExtendedUserPreferences> {
    return this.userService.updateAppearanceSettings(appearance);
  }

  updateSecuritySettings(security: Partial<SecuritySettings>): Observable<ExtendedUserPreferences> {
    return this.userService.updateSecuritySettings(security);
  }

  // Theme management
  setTheme(theme: 'light' | 'dark' | 'auto'): Observable<ExtendedUserPreferences> {
    return this.userService.setTheme(theme);
  }

  // Language management
  setLanguage(language: string): Observable<ExtendedUserPreferences> {
    return this.userService.setLanguage(language);
  }

  // Get current preferences
  getCurrentPreferences(): ExtendedUserPreferences {
    return this.userService.getCurrentExtendedPreferences();
  }

  // Get specific preference sections
  getNotificationSettings(): NotificationSettings {
    return this.userService.getNotificationSettings();
  }

  getPrivacySettings(): PrivacySettings {
    return this.userService.getPrivacySettings();
  }

  getAppearanceSettings(): AppearanceSettings {
    return this.userService.getAppearanceSettings();
  }

  getSecuritySettings(): SecuritySettings {
    return this.userService.getSecuritySettings();
  }

  // Reset preferences to defaults
  resetToDefaults(): Observable<ExtendedUserPreferences> {
    return this.userService.resetPreferencesToDefaults();
  }

  // Export preferences
  exportPreferences(): string {
    return this.userService.exportPreferences();
  }

  // Import preferences
  importPreferences(preferencesJson: string): Observable<ExtendedUserPreferences> {
    return this.userService.importPreferences(preferencesJson);
  }
}