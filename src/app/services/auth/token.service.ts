import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user.model';

interface DecodedToken {
  exp: number;
  iat: number;
  user_id?: string;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private readonly REMEMBER_ME_KEY = 'remember_me';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Token operations
  setTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.REMEMBER_ME_KEY, rememberMe.toString());

    // If remember me is false, also clear localStorage tokens
    if (!rememberMe) {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    // Check sessionStorage first, then localStorage
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY) || 
           localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY) || 
           localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  updateAccessToken(accessToken: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const rememberMe = this.getRememberMeStatus();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
  }

  removeTokens(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Clear from both storages
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    this.removeUser();
  }

  // Token validation
  isTokenValid(token?: string): boolean {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return false;

    try {
      const decodedToken = jwtDecode<DecodedToken>(tokenToCheck);
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  isTokenExpired(token?: string): boolean {
    return !this.isTokenValid(token);
  }

  getTokenExpirationDate(token?: string): Date | null {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return null;

    try {
      const decodedToken = jwtDecode<DecodedToken>(tokenToCheck);
      return decodedToken.exp ? new Date(decodedToken.exp * 1000) : null;
    } catch (error) {
      console.error('Token expiration date error:', error);
      return null;
    }
  }

  getTokenPayload(token?: string): DecodedToken | null {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return null;

    try {
      return jwtDecode<DecodedToken>(tokenToCheck);
    } catch (error) {
      console.error('Token payload decode error:', error);
      return null;
    }
  }

  // User data management
  setUser(user: User): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const rememberMe = this.getRememberMeStatus();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const userData = sessionStorage.getItem(this.USER_KEY) || 
                    localStorage.getItem(this.USER_KEY);
    
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('User data parse error:', error);
      return null;
    }
  }

  removeUser(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    sessionStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Remember me functionality
  private getRememberMeStatus(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY);
    return rememberMe === 'true';
  }

  // Security utilities
  hasValidSession(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken || !refreshToken) return false;
    
    // If access token is valid, session is good
    if (this.isTokenValid(accessToken)) return true;
    
    // If access token is expired but refresh token exists, session can be refreshed
    return !!refreshToken;
  }

  shouldRefreshToken(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken || !refreshToken) return false;
    
    // Check if access token is expired but refresh token exists
    return this.isTokenExpired(accessToken) && !!refreshToken;
  }

  // Clean up expired tokens
  cleanupExpiredTokens(): void {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (accessToken && this.isTokenExpired(accessToken)) {
      if (!refreshToken) {
        // No refresh token available, clear everything
        this.removeTokens();
      }
    }
  }
}