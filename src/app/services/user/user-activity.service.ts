import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/token.service';

export interface UserActivity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PROFILE_UPDATE = 'profile_update',
  PASSWORD_CHANGE = 'password_change',
  AVATAR_UPLOAD = 'avatar_upload',
  PREFERENCES_UPDATE = 'preferences_update',
  ACCOUNT_DELETION = 'account_deletion',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  SECURITY_ALERT = 'security_alert'
}

export interface ActivityStats {
  totalActivities: number;
  loginCount: number;
  lastLogin: Date;
  mostActiveDay: string;
  deviceCount: number;
  securityEvents: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  private apiUrl = environment.apiBaseUrl;
  
  // Activity tracking
  private activitiesSubject = new BehaviorSubject<UserActivity[]>([]);
  public activities$ = this.activitiesSubject.asObservable();
  
  // Auto-tracking settings
  private isTrackingEnabled = true;
  private heartbeatInterval = 5 * 60 * 1000; // 5 minutes

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.startActivityTracking();
  }

  // Get authenticated headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Activity tracking methods
  trackActivity(type: ActivityType, description: string, metadata?: any): Observable<void> {
    if (!this.isTrackingEnabled) {
      return new Observable(observer => observer.complete());
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
      map(() => void 0),
      tap(() => this.refreshActivities()),
      catchError((error) => {
        console.error('Track activity error:', error);
        throw error;
      })
    );
  }

  // Get user activities
  getActivities(limit: number = 50, offset: number = 0): Observable<UserActivity[]> {
    return this.http.get<any>(`${this.apiUrl}/activities/`, {
      headers: this.getAuthHeaders(),
      params: { limit: limit.toString(), offset: offset.toString() }
    }).pipe(
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
        throw error;
      })
    );
  }

  // Get activity statistics
  getActivityStats(): Observable<ActivityStats> {
    return this.http.get<any>(`${this.apiUrl}/activities/stats/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => ({
        ...response.data || response,
        lastLogin: new Date(response.lastLogin || response.last_login)
      })),
      catchError((error) => {
        console.error('Get activity stats error:', error);
        throw error;
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
      map(response => response.data || response.results || []),
      catchError((error) => {
        console.error('Get active devices error:', error);
        throw error;
      })
    );
  }

  revokeDevice(deviceId: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/devices/${deviceId}/`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => void 0),
      tap(() => this.trackActivity(
        ActivityType.SECURITY_ALERT, 
        'Device access revoked',
        { deviceId }
      )),
      catchError((error) => {
        console.error('Revoke device error:', error);
        throw error;
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
      map(response => (response.data || response.results || []).map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }))),
      catchError((error) => {
        console.error('Filter activities error:', error);
        throw error;
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
      catchError((error) => {
        console.error('Export activities error:', error);
        throw error;
      })
    );
  }

  // Privacy and data management
  deleteActivityHistory(): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/activities/`, {
      headers: this.getAuthHeaders()
    }).pipe(
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
        throw error;
      })
    );
  }

  // Activity tracking controls
  enableTracking(): void {
    this.isTrackingEnabled = true;
    this.trackActivity(ActivityType.PREFERENCES_UPDATE, 'Activity tracking enabled');
  }

  disableTracking(): void {
    this.trackActivity(ActivityType.PREFERENCES_UPDATE, 'Activity tracking disabled');
    this.isTrackingEnabled = false;
  }

  isTrackingActive(): boolean {
    return this.isTrackingEnabled;
  }

  // Automatic activity tracking
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
      return new Observable(observer => observer.complete());
    }

    return this.http.post<any>(`${this.apiUrl}/heartbeat/`, {
      timestamp: new Date().toISOString(),
      url: window.location.pathname
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => void 0),
      catchError(() => new Observable(observer => observer.complete()))
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

  private lastInteractionTrack = 0;
  private throttledInteractionTrack(): void {
    const now = Date.now();
    if (now - this.lastInteractionTrack > 60000) { // 1 minute throttle
      this.lastInteractionTrack = now;
      this.sendHeartbeat().subscribe();
    }
  }

  // Refresh activities list
  private refreshActivities(): void {
    this.getActivities().subscribe();
  }

  // Utility methods
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
}