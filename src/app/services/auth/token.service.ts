import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user.model';
import { Token } from '../../models/auth.model';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

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
    ACCESS_TOKEN: 'access',
    REFRESH_TOKEN: 'refresh',
    USER: 'current_user'
  } as const;
  private tokenKey = "auth_token";
  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object) { }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  /**
   * This method set a localstorage token key
   * @param response the token object
   * @returns nothing
   */
  setToken(response: Token): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Debug: Log the actual response structure
    console.log('setToken called with response:', response);
    
    // Validate that token exists before storing
    if (!response || !response.access || !response.refresh) {
      console.warn('Invalid token provided to setToken', {
        hasResponse: !!response,
        hasAccess: !!response?.access,
        hasRefresh: !!response?.refresh,
        fullResponse: response
      });
      return;
    }
    // Store the entire token object (both access and refresh)
    const token = JSON.stringify(response);
    localStorage.setItem(this.tokenKey, token);
    console.log('Token stored successfully');
  }
  getToken(): Token | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const stored = localStorage.getItem(this.tokenKey);
    // Check for null, empty string, or the string "undefined"
    if (!stored || stored === 'undefined' || stored === 'null') {
      return null;
    }
    
    try {
      const parsed = JSON.parse(stored);
      // Handle both formats: { token: Token } and Token
      if (parsed.token && parsed.token.access) {
        // Old format: { token: { access, refresh } }
        return parsed.token;
      } else if (parsed.access) {
        // Correct format: { access, refresh }
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error parsing token:', error);
      // Clean up invalid token from storage
      localStorage.removeItem(this.tokenKey);
      return null;
    }
  }

  refreshToken(): Observable<Token> {
    const currentToken = this.getToken();
    console.log(currentToken)
    if (!currentToken || !currentToken.refresh){
      return throwError(() => new Error("No refresh token available"));
    }

    return this.http.post<Token>(`${this.apiUrl}/token/refresh`, {
        refresh: currentToken.refresh
      }).pipe(
        tap(response => {
          if(this.isBrowser){
            // Store the token object directly (API returns Token, not {token:Token})
            localStorage.setItem(this.tokenKey, JSON.stringify(response))
          }
        })
      )
    
    
  }

  removeTokens(): void {
    if (!this.isBrowser) return;

    // Remove the main auth token
    localStorage.removeItem(this.tokenKey);
    
    // Remove other token-related keys
    Object.values(this.KEYS).forEach(key =>
      localStorage.removeItem(key)
    );
  }

  // Token validation
  isTokenValid(token?: string): boolean {
    const existingToken = this.getToken();
    const tokenToCheck = token || existingToken?.access; // Check access token by default
    if (!tokenToCheck) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(tokenToCheck);
      const isValid = decoded.exp > Math.floor(Date.now() / 1000);
      
      if (!isValid) {
        console.warn('Access token is expired');
      }
      
      return isValid;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
  isRefreshTokenValid(refreshToken?: string): boolean {
    const token = refreshToken || this.getToken()?.refresh;
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const isValid = Date.now() < expiry;
      
      if (!isValid) {
        console.warn('Refresh token is expired');
      }
      
      return isValid;
    } catch (error) {
      console.error('Error checking refresh token validity:', error);
      return false;
    }
  }

  // User data management
  setUser(user: User): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.KEYS.USER, JSON.stringify(user));
  }

}