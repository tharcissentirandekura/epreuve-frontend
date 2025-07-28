import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { TokenService } from '../services/auth/token.service';
import { UserService } from '../services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuthentication(state.url, route);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(childRoute, state);
  }

  private checkAuthentication(url:string, route?: ActivatedRouteSnapshot): Observable<boolean>{
    const isAuthenticated = this.authService.isAuthenticated();
    if (isAuthenticated && this.tokenService.hasValidSession()) {
      return of(this.checkRoleAccess(route));
    }
    else if (this.tokenService.shouldRefreshToken()){
      return this.authService.refreshToken().pipe(
        map(() => this.checkRoleAccess(route)),
        switchMap(result => of(result))
      );
    }
    else{
      console.log('User is not authenticated, redirecting to login');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: url } 
      });
      return of(false);
    }
  }


  private checkRoleAccess(route?: ActivatedRouteSnapshot): boolean {
    if (!route || !route.data || !route.data['roles']) {
      // No role requirements, allow access
      return true;
    }

    const requiredRoles: string[] = route.data['roles'];
    const currentUser = this.userService.getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser || !currentUser.role) {
      console.warn('User role not found, denying access');
      this.router.navigate(['/unauthorized']);
      return false;
    }

    const hasRequiredRole = requiredRoles.includes(currentUser.role);
    
    if (!hasRequiredRole) {
      console.warn(`User role '${currentUser.role}' not in required roles:`, requiredRoles);
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}