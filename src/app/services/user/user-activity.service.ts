import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { UserActivity, ActivityType, ActivityStats } from '../../models/user.model';

// Re-export interfaces for backwards compatibility
export { UserActivity, ActivityType, ActivityStats } from '../../models/user.model';

/**
 * @deprecated Use UserService instead. This service is maintained for backwards compatibility.
 * All functionality has been consolidated into the main UserService.
 */
@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  // Delegate all functionality to the consolidated UserService
  constructor(private userService: UserService) {}
  
  // State management - delegate to main service
  get activities$() {
    return this.userService.activities$;
  }

  // Activity tracking methods
  trackActivity(type: ActivityType, description: string, metadata?: any): Observable<void> {
    return this.userService.trackActivity(type, description, metadata);
  }

  // Get user activities
  getActivities(limit: number = 50, offset: number = 0): Observable<UserActivity[]> {
    return this.userService.getActivities(limit, offset);
  }

  // Get activity statistics
  getActivityStats(): Observable<ActivityStats> {
    return this.userService.getActivityStats();
  }

  // Security-related activities
  getSecurityActivities(): Observable<UserActivity[]> {
    return this.userService.getSecurityActivities();
  }

  // Device and session management
  getActiveDevices(): Observable<any[]> {
    return this.userService.getActiveDevices();
  }

  revokeDevice(deviceId: string): Observable<void> {
    return this.userService.revokeDevice(deviceId);
  }

  // Activity filtering and search
  filterActivities(
    type?: ActivityType, 
    startDate?: Date, 
    endDate?: Date
  ): Observable<UserActivity[]> {
    return this.userService.filterActivities(type, startDate, endDate);
  }

  // Export activities
  exportActivities(format: 'json' | 'csv' = 'json'): Observable<Blob> {
    return this.userService.exportActivities(format);
  }

  // Privacy and data management
  deleteActivityHistory(): Observable<void> {
    return this.userService.deleteActivityHistory();
  }

  // Activity tracking controls
  enableTracking(): void {
    this.userService.enableActivityTracking();
  }

  disableTracking(): void {
    this.userService.disableActivityTracking();
  }

  isTrackingActive(): boolean {
    return this.userService.isActivityTrackingActive();
  }

  // Utility methods
  getActivityTypeLabel(type: ActivityType): string {
    return this.userService.getActivityTypeLabel(type);
  }

  getActivityIcon(type: ActivityType): string {
    return this.userService.getActivityIcon(type);
  }
}