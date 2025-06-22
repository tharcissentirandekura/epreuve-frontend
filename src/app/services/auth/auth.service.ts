
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

interface Decoded {exp: number;}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl; // Replace with your API URL
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  setIsLoggedInState(isLoggedIn: boolean) {
    this.isLoggedInSubject.next(isLoggedIn);
  }

  constructor(
    private http: HttpClient,
    private router:Router,
  ) {}

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login/`, credentials)
      .pipe(
        tap(token => {
          this.setToken(token.refresh, token.access);
          this.setIsLoggedInState(true);          
        }),
        catchError((error)=>{
          console.error(`Error:`, error);
          return throwError(() => error);
        })


      );

  }

  register(user:any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/`, user)
      .pipe(
        tap((response) => {
          console.log(response);
        })
      );
  }

  logout(): void {
    this.removeToken();
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/dashboard']);
  }

  setToken(refresh: string,access:string): void {
    console.log('Setting tokens in local storage');
    console.log('Access Token:', access);
    console.log('Refresh Token:', refresh);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

  }
  getToken(){
    return localStorage.getItem('access_token');

  }
  removeToken(): void {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.clear();
  }

  /**
   * managing tokens
   * 
   */

  isLoggedIn():boolean{
    const token = this.getToken();
    if (!token) return false;
    try {
      const {exp} = jwtDecode<Decoded>(token || '');
      return Date.now() < exp * 1000; // exp is in seconds, convert to milliseconds
    } catch (error) {
      return false
    }
  }

  checkSession(){
    if (this.isLoggedIn()){
      this.setIsLoggedInState(true);
    }else{
      this.logout();
    }

  }
  /**
   * 
   * @returns additional token info handlers
   */

  getTokenExpirationDate(){
    const token = localStorage.getItem('access_token');
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