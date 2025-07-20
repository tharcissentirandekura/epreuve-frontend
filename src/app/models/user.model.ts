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

// User preferences
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
