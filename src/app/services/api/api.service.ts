import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api.model';
/**
 * This file is to fetch data from the api
 * The handlers are built to be reusable for section, course, or test to avoid repetition
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private headers: any;
  private apiUrl:string = environment.apiBaseUrl;

  constructor(private http: HttpClient) {
  }
/**
 * 
 * @param endpoint : the route to go to on the api
 * example : /sections; /courses,....
 * @returns  the response or error
 */
  getDataHandler(endpoint: string,page:number): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}/${endpoint}?page=${page}`)
    .pipe(
      catchError((error) => {
        console.error('Error fetching data:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * This returns the test by category( category of course, sections,...)
   * @param route the endpoint to go to
   * @param query the search word we want to retrieve
   * @returns the response of what searched after filtering
   */
  getTestByCategory(route: string,query: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${route}?search=${query}`, { headers: this.headers })
    .pipe(
      catchError((error) => {
        console.error('Error fetching data:', error);
        return throwError(() => error);
      })
    );
  }
/**
 * 
 * @param data the data we want to add to our database
 * @param endpoint the endpoint at which we want to add
 * @returns response message telling us that the response was successful or failed
 */
  postDataHandler(data: any,endpoint: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${endpoint}`, data, { headers: this.headers })
    .pipe(
      catchError((error) => {
        console.error('Error posting data:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Handler for getting admin component panel
   * @param endpoint the endpoint to go to
   * @returns the response of the data
   * 
   */

  getAdminDataHandler(endpoint: string): Observable<any> {
    let apiUrl = this.apiUrl.split('/api')[0];
    // console.log('API URL:', apiUrl);
    return this.http.get<any>(`${apiUrl}/${endpoint}`, { headers: this.headers })
    .pipe(
      catchError((error) => {
        console.error('Error fetching data in admin panel:', error);
        return throwError(() => error);
      })
    );
  }

}
