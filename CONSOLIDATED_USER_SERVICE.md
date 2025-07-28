# Consolidated UserService Documentation

## Overview

The UserService has been consolidated to include all user-related functionality that was previously spread across multiple services:

- **UserService** - Core user profile management
- **UserPreferencesService** - User preferences and settings management  
- **UserActivityService** - User activity tracking and analytics
- **AvatarUploadService** - Avatar upload and image processing

## Key Features

### ✅ **Centralized State Management**
- Single source of truth for user data via `currentUser$`
- Unified preferences state via `preferences$`
- Activity tracking state via `activities$`

### ✅ **Comprehensive Profile Management**
- `getProfile()` - Get user profile with caching
- `updateProfile()` - Update user information
- `changePassword()` - Change user password
- `deleteAccount()` - Delete user account
- `uploadAvatar()` - Upload user avatar
- `uploadAvatarWithProcessing()` - Enhanced avatar upload with validation and processing

### ✅ **Advanced Preferences Management**
- `loadPreferences()` - Load extended user preferences
- `updateExtendedPreferences()` - Update comprehensive preferences
- `updateNotificationSettings()` - Update notification preferences
- `updatePrivacySettings()` - Update privacy settings
- `updateAppearanceSettings()` - Update appearance settings
- `updateSecuritySettings()` - Update security settings
- `setTheme()` - Change application theme
- `setLanguage()` - Change application language
- `exportPreferences()` / `importPreferences()` - Backup/restore preferences

### ✅ **Activity Tracking & Analytics**
- `trackActivity()` - Track user activities with different types
- `getActivities()` - Get paginated activity history
- `getActivityStats()` - Get activity statistics and analytics
- `getSecurityActivities()` - Get security-related activities
- `filterActivities()` - Filter activities by type/date
- `exportActivities()` - Export activity history
- `deleteActivityHistory()` - Delete all activity data

### ✅ **Enhanced Avatar Upload**
- `validateAvatarFile()` - Validate image files before upload
- `createAvatarPreview()` - Generate image previews
- `processAvatarImage()` - Resize and compress images
- `generateAvatarThumbnail()` - Create thumbnails
- `getAvatarImageDimensions()` - Get image dimensions

### ✅ **Device & Security Management**
- `getActiveDevices()` - Get list of active devices
- `revokeDevice()` - Revoke device access
- Activity tracking with automatic heartbeat
- Security event monitoring

## Backwards Compatibility

All existing services have been converted to lightweight wrapper services that delegate to the consolidated UserService:

- `UserPreferencesService` ✅ - Fully compatible
- `UserActivityService` ✅ - Fully compatible  
- `AvatarUploadService` ✅ - Fully compatible

Components using the old services continue to work without changes.

## Benefits

### 🚀 **Performance Improvements**
- Eliminated redundant HTTP calls
- Centralized caching mechanism
- Single state management system

### 🛡️ **Consistency & Reliability**
- Unified error handling patterns
- Consistent request timeout and retry logic
- Single HTTP header management

### 🧹 **Code Maintainability**
- Reduced code duplication
- Centralized user-related logic
- Simplified dependency management

### 🔧 **Enhanced Functionality**
- Advanced image processing capabilities
- Comprehensive activity analytics
- Rich preference management
- Automatic activity tracking

## Usage Examples

### Basic Profile Management
```typescript
// Get user profile
this.userService.getProfile().subscribe(user => {
  console.log('Current user:', user);
});

// Update profile
this.userService.updateProfile({
  firstName: 'John',
  lastName: 'Doe'
}).subscribe(updatedUser => {
  console.log('Profile updated:', updatedUser);
});
```

### Activity Tracking
```typescript
// Track user activity
this.userService.trackActivity(
  ActivityType.PROFILE_UPDATE, 
  'User updated profile'
).subscribe();

// Get activity statistics
this.userService.getActivityStats().subscribe(stats => {
  console.log('Activity stats:', stats);
});
```

### Preferences Management
```typescript
// Update theme
this.userService.setTheme('dark').subscribe(prefs => {
  console.log('Theme updated:', prefs);
});

// Update notification settings
this.userService.updateNotificationSettings({
  email: true,
  push: false
}).subscribe();
```

### Enhanced Avatar Upload
```typescript
// Validate and upload avatar with processing
const file = event.target.files[0];
const validation = this.userService.validateAvatarFile(file);

if (validation.isValid) {
  this.userService.uploadAvatarWithProcessing(file).subscribe(avatarUrl => {
    console.log('Avatar uploaded:', avatarUrl);
  });
}
```

## Migration Guide

No migration is required! All existing code continues to work as the old services are now compatibility wrappers.

For new development, prefer using the consolidated `UserService` directly for better performance and access to all features.

## State Observables

Monitor user state changes:

```typescript
// Monitor user changes
this.userService.currentUser$.subscribe(user => {
  console.log('User changed:', user);
});

// Monitor preference changes
this.userService.preferences$.subscribe(prefs => {
  console.log('Preferences changed:', prefs);
});

// Monitor activity changes
this.userService.activities$.subscribe(activities => {
  console.log('Activities updated:', activities);
});
```