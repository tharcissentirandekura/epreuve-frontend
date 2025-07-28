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
  private readonly KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'current_user',
    REMEMBER_ME: 'remember_me'
  } as const;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private get rememberMe(): boolean {
    return this.isBrowser && localStorage.getItem(this.KEYS.REMEMBER_ME) === 'true';
  }

  private get storage(): Storage | null {
    if (!this.isBrowser) return null;
    return this.rememberMe ? localStorage : sessionStorage;
  }

  // Token operations
  setTokens(accessToken: string, refreshToken: string, rememberMe = false): void {
    if (!this.isBrowser) return;

    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem(this.KEYS.ACCESS_TOKEN, accessToken);
    storage.setItem(this.KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(this.KEYS.REMEMBER_ME, rememberMe.toString());

    // Clear opposite storage
    const oppositeStorage = rememberMe ? sessionStorage : localStorage;
    oppositeStorage.removeItem(this.KEYS.ACCESS_TOKEN);
    oppositeStorage.removeItem(this.KEYS.REFRESH_TOKEN);
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return sessionStorage.getItem(this.KEYS.ACCESS_TOKEN) || 
           localStorage.getItem(this.KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return sessionStorage.getItem(this.KEYS.REFRESH_TOKEN) || 
           localStorage.getItem(this.KEYS.REFRESH_TOKEN);
  }

  updateAccessToken(accessToken: string): void {
    this.storage?.setItem(this.KEYS.ACCESS_TOKEN, accessToken);
  }

  removeTokens(): void {
    if (!this.isBrowser) return;

    [sessionStorage, localStorage].forEach(storage => {
      Object.values(this.KEYS).forEach(key => storage.removeItem(key));
    });
  }

  // Token validation
  isTokenValid(token?: string): boolean {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(tokenToCheck);
      return decoded.exp > Math.floor(Date.now() / 1000);
    } catch {
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
      const decoded = jwtDecode<DecodedToken>(tokenToCheck);
      return decoded.exp ? new Date(decoded.exp * 1000) : null;
    } catch {
      return null;
    }
  }

  getTokenPayload(token?: string): DecodedToken | null {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return null;

    try {
      return jwtDecode<DecodedToken>(tokenToCheck);
    } catch {
      return null;
    }
  }

  // User data management
  setUser(user: User): void {
    if (!this.storage) return;
    this.storage.setItem(this.KEYS.USER, JSON.stringify(user));
  }

  getUser(): User | null {
    if (!this.isBrowser) return null;

    const userData = sessionStorage.getItem(this.KEYS.USER) || 
                    localStorage.getItem(this.KEYS.USER);
    
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  clearUser(): void {
    if (!this.isBrowser) return;
    [sessionStorage, localStorage].forEach(storage => 
      storage.removeItem(this.KEYS.USER)
    );
  }

  // Session management
  hasValidSession(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken || !refreshToken) return false;
    
    return this.isTokenValid(accessToken) || !!refreshToken;
  }

  shouldRefreshToken(): boolean {
    const accessToken:string = this.getAccessToken() || '';
    const refreshToken = this.getRefreshToken() || '';
    
    return !!refreshToken && this.isTokenExpired(accessToken);
  }

  cleanupExpiredTokens(): void {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (accessToken && this.isTokenExpired(accessToken) && !refreshToken) {
      this.removeTokens();
    }
  }
}