import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastService } from '../services/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      // Token is expired or invalid, show toast and redirect
      this.toastService.error('Session expirée. Veuillez vous reconnecter.', 4000);
      this.router.navigate(['/login']);
      return false;
    }
  }
}