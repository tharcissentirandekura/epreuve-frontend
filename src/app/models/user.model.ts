// Authentication interfaces
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  expiresIn?: number;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// User model
export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  preferences?: UserPreferences;
}

// User preferences - Basic interface for backwards compatibility
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
  };
}

// Extended user preferences interfaces
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

// User activity interfaces
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

// Avatar upload interfaces
export interface AvatarValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AvatarUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

// User roles
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

// Legacy interfaces for backward compatibility
export interface Credentials {
  username: string;
  password: string;
}

// Validation patterns
export const ValidationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  name: /^[a-zA-Z\s]{2,50}$/
};

// Form validation messages
export const ValidationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  username: 'Username must be 3-20 characters, letters, numbers and underscores only',
  name: 'Name must be 2-50 characters, letters and spaces only',
  passwordMismatch: 'Passwords do not match'
};
