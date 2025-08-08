import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  private loadingCallbacks: Array<(loading: boolean) => void> = [];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading indicator for certain requests
    if (this.shouldSkipLoading(req)) {
      return next.handle(req);
    }

    // Start loading
    this.activeRequests++;
    this.updateLoadingState(true);

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        // Optional: Handle specific response events
        if (event instanceof HttpResponse) {
          // Response received
        }
      }),
      finalize(() => {
        // Stop loading
        this.activeRequests--;
        if (this.activeRequests === 0) {
          console.log('All requests completed', this.activeRequests);
          this.updateLoadingState(false);
        }
      })
    );
  }

  private shouldSkipLoading(req: HttpRequest<any>): boolean {
    // Skip loading for certain URLs or request types
    const skipUrls = [
      '/token/refresh/'
    ];
    
    return skipUrls.some(url => req.url.includes(url)) ||
           req.headers.has('X-Skip-Loading');
  }

  private updateLoadingState(loading: boolean): void {
    this.loadingCallbacks.forEach(callback => callback(loading));
  }

  // Method for components to subscribe to loading state
  onLoadingChange(callback: (loading: boolean) => void): () => void {
    this.loadingCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.loadingCallbacks.indexOf(callback);
      if (index > -1) {
        this.loadingCallbacks.splice(index, 1);
      }
    };
  }

  // Get current loading state
  isLoading(): boolean {
    return this.activeRequests > 0;
  }
}