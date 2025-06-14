import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import e from 'express';

@Injectable({
  providedIn: 'root'
})


export class SearchService {
    private readonly API_URL = `${environment.apiBaseUrl}/tests`;
    

   constructor(private apiService: ApiService) {}


    searchResults = (endpoint:string) =>{
        return this.apiService.getTestByCategory(endpoint, '').pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Search error:', error);
                return throwError(() => new Error('Search failed, please try again later.'));
            }
        ));    
    }


}
