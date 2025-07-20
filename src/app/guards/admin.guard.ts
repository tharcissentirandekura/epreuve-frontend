import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          // Not authenticated, redirect to login
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }

        const currentUser = this.authService.getCurrentUser();
        
        if (!currentUser) {
          console.warn('No user data found, denying admin access');
          this.router.navigate(['/unauthorized']);
          return false;
        }

        // Check if user has admin or moderator role
        const hasAdminAccess = currentUser.role === UserRole.ADMIN || 
                              currentUser.role === UserRole.MODERATOR;
        
        if (!hasAdminAccess) {
          console.warn(`User role '${currentUser.role}' does not have admin access`);
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}