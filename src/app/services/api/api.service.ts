import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * This file is to fetch data from the api
 * The handlers are built to be reusable for section, course, or test to avoid repetition
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
/**
 * 
 * @param endpoint : the route to go to on the api
 * example : /sections; /courses,....
 * @returns  the response or error
 */
  getDataHandler(endpoint: string,page?:number,search?:string): Observable<any> {
    // Build URL with conditional page parameter to avoid sending undefined page in the link
    // also build URL with query parameters
    const params :string[] = [];

    if (page!== undefined && page != null){
      params.push(`page=${page}`);
    }
    if (search){
      params.push(`search=${encodeURIComponent(search)}`);
    }
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    const url = `${this.apiUrl}/${endpoint}${queryString}`;
    return this.http.get<any>(url)
    .pipe(
      catchError((error) => {
        console.error('Error fetching data:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Search tests by category
   * @param route the endpoint to go to
   * @param query the search word we want to retrieve
   * @returns the response of what searched after filtering
   * @deprecated Use getDataHandler with search parameter instead
   */
  getTestByCategory(route: string, query: string): Observable<any> {
    const url = `${this.apiUrl}/${route}?search=${encodeURIComponent(query)}`;
    return this.http.get<any>(url)
      .pipe(
        catchError((error) => {
          console.error('Error fetching search data:', error);
          return throwError(() => error);
        })
      );
  }
  /**
   * Post data to the API
   * @param data the data we want to add to our database
   * @param endpoint the endpoint at which we want to add
   * @returns response message telling us that the response was successful or failed
   */
  postDataHandler(data: any, endpoint: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${endpoint}`, data)
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
   */
  getAdminDataHandler(endpoint: string): Observable<any> {
    const adminApiUrl = this.apiUrl.split('/api')[0];
    return this.http.get<any>(`${adminApiUrl}/${endpoint}`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching data in admin panel:', error);
          return throwError(() => error);
        })
      );
  }

}
