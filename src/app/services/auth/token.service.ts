import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user.model';
import { Token } from '../../models/auth.model';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { decode } from 'punycode';

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

  
  getToken(): Token | null {
      if (!isPlatformBrowser(this.platformId)) {
        return null;
      }
      const token = localStorage.getItem(this.tokenKey);
      return token ? JSON.parse(token) : null;
  }

  refreshToken() : Observable<{token:Token}>{
    const currentToken = this.getToken();
    console.log(currentToken)
    if (!currentToken || !currentToken.refresh){
      return throwError(() => new Error("No refresh token available"));
    }

    return this.http.post<{token:Token}>(`${this.apiUrl}/token/refresh`, {
        refresh:currentToken.refresh
      }).pipe(
        tap(response => {
          if(this.isBrowser){
            localStorage.setItem(this.tokenKey, JSON.stringify(response.token))
          }
        })
      )
    
    
  }

  removeTokens(): void {
    if (!this.isBrowser) return;

    Object.values(this.KEYS).forEach(key =>
      localStorage.removeItem(key)
    );
  }

  // Token validation
  isTokenValid(token?: string): boolean {
    const exstingToken = this.getToken();
    const tokenToCheck = token || exstingToken?.refresh;
    if (!tokenToCheck) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(tokenToCheck);
      return decoded.exp > Math.floor(Date.now() / 1000);
    } catch {
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