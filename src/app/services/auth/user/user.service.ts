import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../../models/user.model';
import { TokenService } from '../token.service';
import { environment } from '../../../../environments/environment';

interface DecodedToken {
    user_id?: string;
    exp: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = environment.apiBaseUrl;

    constructor(
        private http: HttpClient,
        private tokenService: TokenService
    ) { }

    getCurrentUser(): Observable<User> {
        const token = this.tokenService.getToken();

        if (!token?.access) {
            return throwError(() => new Error('No access token available'));
        }

        try {
            const decoded = jwtDecode<DecodedToken>(token.access);
            const userId = decoded.user_id;

            if (!userId) {
                return throwError(() => new Error('No user ID found in token'));
            }
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${token.access}`
            });

            return this.http.get<User>(`${this.apiUrl}/users/${userId}/`, { headers });
        } catch (error) {
            return throwError(() => new Error('Invalid token'));
        }
    }

    /**
     * Update user infos
     * Will simplify to reuse code from getCurrent
     * 
     */
    updateUser(userData:User):Observable<User>{
        const token = this.tokenService.getToken();
        if(!token?.access){
            return throwError(() => new Error('No access token available'));
        }
        try {
            const decoded = jwtDecode<DecodedToken>(token.access);
            const userId = decoded.user_id;

            if (!userId){
                return throwError(() => new Error('No user ID found'));
            }

            const headers = new HttpHeaders({
                'Authorization':`Bearer ${token.access}`,
                'Content-Type': 'application/json'
            });

            return this.http.patch<User>(`${this.apiUrl}/users/${userId}/`, userData, {headers})
        } catch (error) {
            return throwError(() => new Error('Invalid token'))
            
        }
    }


}