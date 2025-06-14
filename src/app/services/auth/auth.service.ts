
import { Injectable,PLATFORM_ID,Inject} from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable,BehaviorSubject} from 'rxjs';
import { tap} from 'rxjs/operators';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl; // Replace with your API URL
  // private token = this.getToken();
  // private isLoggedIn = false;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  // private headers = new HttpHeaders().set("Authorization", `Bearer ${this.token}`);

  setIsLoggedInState(isLoggedIn: boolean) {
    this.isLoggedInSubject.next(isLoggedIn);
  }

  constructor(
    private http: HttpClient,
    private router:Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login/`, credentials)
      .pipe(
        tap((response) => {
          console.log(response);
          this.setToken(response.refresh, response.access);
          console.log('User logged in successfully');
          
        })
      );

    //simulate login
    // const token = 'fake-jwt-token';
    // localStorage.setItem('token', token);
    // this.isLoggedInSubject.next(true);
    // return token; // set it to any
  }

  register(user:any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/`, user)
      .pipe(
        tap((response) => {
          console.log(response);
          console.log('User registered successfully');
        })
      );

    //simulate register
    // return Promise.resolve("Registration successfully");
  }

  logout(): void {
    // this.removeToken();
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    // this.router.navigate(['/login']);
  }

  setToken(refresh: string,access:string): void {
    if(isPlatformBrowser(this.platformId)){
      // console.log('Setting token in local storage');
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }

  }
  getToken(){
    return localStorage.getItem('token');

  }
  removeToken(): void {
    if(isPlatformBrowser(this.platformId)){
      // console.log('Romoving token in local storage');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.clear();
    }
    // window.location.reload();
  }

  getTokenExpirationDate(){
    const token = this.getToken();
    // console.log('Token:', token);
    if (!token) {
      return null;
    }
    try {
      const decodedToken:any = jwtDecode(token);
      if(decodedToken.exp){
        return new Date(decodedToken.exp * 1000); // convert to milliseconds
      }else{
        return null;
      }
    } catch (error) {
      console.error("Error decoding token", error);
      return null; 
    }
  }

  isTokenExpired():boolean{
    const expirationDate = this.getTokenExpirationDate();
    if(!expirationDate){
      
      return true; // treat missing or invalid token as expired
    }
    console.log('Token Expiration date:', expirationDate);
    return expirationDate.getTime() < new Date().getTime();

  }

  getRefreshToken(): string | null {
    // console.log('Getting refresh token from local storage');
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  refreshToken(): Observable<any> {
    // console.log('Refreshing access token');
    // console.log('Refresh token:', this.getRefreshToken());
    return this.http.post<any>(`${this.apiUrl}/token/refresh/`, { refresh: this.getRefreshToken() })
      .pipe(
        tap((response) => {
          console.log(response);
          localStorage.setItem('access_token', response.access);
        })
      );
  }

  getUser(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/users/`, { headers})
      .pipe(
        tap((response) => {
          return response.data;
        })
      );
  }
}