import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { Observable, tap, throwError } from "rxjs";
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment'
import { RegisterData, LoginCredentials } from "../../models/user.model";
import { Token } from '../../models/auth.model';
import { TokenService } from "./token.service";
import { UserService } from "./user/user.service";
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  private tokenKey = "auth_token";

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
    
  ) { }

  login(credentials: LoginCredentials): Observable<{ token: Token }> {
    return this.http.post<{ token: Token }>(`${this.apiUrl}/login/`, credentials)
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, JSON.stringify(response));
          }
        })
      );
  }

  register(user: RegisterData): Observable<RegisterData> {
    const backendData = {
      first_name: user.firstName,
      last_name: user.lastName,
      username: user.username,
      email: user.email,
      password: user.password,
      confirm_password: user.confirmPassword
    };

    return this.http.post<RegisterData>(`${this.apiUrl}/register/`, backendData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.tokenService.getToken();
    return !!token && !!token.access;
  }
}
