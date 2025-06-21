import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { Credentials,User } from '../../models/user.model'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule,NavbarComponent,FooterComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  credentials: Credentials = { username: '', password: '' };
  user: User = { username: '', password: '', first_name: '', last_name: '' };
  popupMessage: string | null = null;
  popupSuccess = false;
  
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  activeTab: "login" | "register" = "login";

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetForms() {
    if (this.activeTab === 'login') {
      this.credentials = { 
        username: '', 
        password: '' 
      };
    } else {
      this.user = { 
        username: '', 
        password: '', 
        first_name: '',
        last_name: ''
      };
    }
  }

  setActiveTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.clearMessages();
    this.resetForms();
  }

  login() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: response => {
        console.log('Login successful', response);
        this.authService.setIsLoggedInState(true);
        this.router.navigate(['/home']);
      },
      error: error => {
        this.errorMessage = 'Login failed';
        this.popupSuccess = false;
        this.popupMessage = 'Login failed. Try again.';
        console.error('Login error:', error);
      },
      complete: () => {
        this.isSubmitting = false;
        setTimeout(() => this.popupMessage = null, 300);
      }
    })

  }

  register() {
    this.clearMessages();
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.register(this.user).subscribe({
      next: response => {
        this.successMessage = 'Registration successful. You can now log in.';
        console.log('Registration successful', response);
        this.setActiveTab('login');
      },
      error: error => {
        this.errorMessage = 'Registration failed';
        console.error('Registration error:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });

  }

  async logout() {
    this.authService.setIsLoggedInState(false);
    this.router.navigate(['/login']);
  }
}