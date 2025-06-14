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

  async login() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    try {

      const token = this.authService.login(this.credentials);
      if (token){
        console.log('Login successful', token, this.credentials);
        this.authService.setIsLoggedInState(true);
        this.router.navigate(['/']);
      }

    } catch (error) {
      this.errorMessage = 'Invalid username or password';
    } finally {
      this.isSubmitting = false;
    }
  }

  async register() {
    this.clearMessages();
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      await this.authService.register(this.user).toPromise();
      console.log('Registration successful', this.user);
      this.setActiveTab('login');
      this.successMessage = 'Registration successful';
    } catch (error) {
      this.errorMessage = 'Registration failed';
      console.error('Registration error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  async logout() {
    this.authService.setIsLoggedInState(false);
    this.router.navigate(['/login']);
  }
}