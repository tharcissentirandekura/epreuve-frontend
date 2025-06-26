import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { AuthService } from '../../services/auth/auth.service';
import { Credentials, User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FooterComponent,
  ],
})
export class LoginComponent {
  loginForm!: FormGroup;
  isSubmitting = false;
  showPassword = false;
  rememberMe = false;
  isLoginPage = true;
  isRegisterPage = false;

  errorMessage = '';
  popupMessage: string | null = null;
  popupSuccess = false;

  // Login/register info
  loginpageInfo = {
    title: 'Se connecter',
    subtitle: 'Bienvenue',
    description: 'Connectez-vous pour accéder à votre compte et profiter de nos services.',
    registerLink: 'S\'inscrire',
    socialText: 'Continuer avec Facebook',
    dividerText: 'Ou utiliser votre nom d\'utilisateur'
  };

  // User registration info
  user: User = { username: '', password: '', first_name: '', last_name: '' };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
  }

  initializeForm() {
    if (this.isLoginPage) {
      this.loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    } else if (this.isRegisterPage) {
      this.loginForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        first_name: ['', [Validators.required, Validators.minLength(2)]],
        last_name: ['', [Validators.required, Validators.minLength(2)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    }
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get firstName() {
    return this.loginForm.get('first_name');
  }

  get lastName() {
    return this.loginForm.get('last_name');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials: Credentials = this.loginForm.value;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.popupMessage = null;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.authService.setIsLoggedInState(true);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.errorMessage = 'Échec de la connexion';
        this.popupSuccess = false;
        this.popupMessage = 'Échec de la connexion. Veuillez réessayer.';
        console.error('Login error:', error);
      },
      complete: () => {
        this.isSubmitting = false;
        setTimeout(() => (this.popupMessage = null), 3000);
      },
    });
  }

  register() {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const user: User = this.loginForm.value;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.popupMessage = null;

    this.authService.register(user).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.popupSuccess = true;
        this.popupMessage = 'Inscription réussie! Vous pouvez maintenant vous connecter.';
        
        // Switch back to login after successful registration
        setTimeout(() => {
          this.switchToLogin();
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Échec de l\'inscription';
        this.popupSuccess = false;
        this.popupMessage = 'Échec de l\'inscription. Veuillez réessayer.';
        console.error('Registration error:', error);
      },
      complete: () => {
        this.isSubmitting = false;
        setTimeout(() => (this.popupMessage = null), 3000);
      }
    });
  }

  switchToRegister() {
    this.isLoginPage = false;
    this.isRegisterPage = true;
    
    // Update page info
    this.loginpageInfo = {
      title: 'S\'inscrire',
      subtitle: 'Rejoignez-nous',
      description: 'Créez votre compte pour accéder à toutes les fonctionnalités de notre plateforme.',
      registerLink: 'Se connecter',
      socialText: 'S\'inscrire avec Facebook',
      dividerText: 'Ou créer un compte avec vos informations'
    };
    
    // Reinitialize form for registration
    this.initializeForm();
    this.resetMessages();
  }

  switchToLogin() {
    this.isLoginPage = true;
    this.isRegisterPage = false;
    
    // Reset page info
    this.loginpageInfo = {
      title: 'Se connecter',
      subtitle: 'Bienvenue',
      description: 'Connectez-vous pour accéder à votre compte et profiter de nos services.',
      registerLink: 'S\'inscrire',
      socialText: 'Continuer avec Facebook',
      dividerText: 'Ou utiliser votre nom d\'utilisateur'
    };
    
    // Reinitialize form for login
    this.initializeForm();
    this.resetMessages();
  }

  resetMessages() {
    this.errorMessage = '';
    this.popupMessage = null;
    this.popupSuccess = false;
  }

  socialLogin(provider: string) {
    console.log(`${this.isLoginPage ? 'Login' : 'Register'} with ${provider}`);
    // Implement social login/register logic
  }

  // Method to handle form submission based on current mode
  onSubmit() {
    if (this.isLoginPage) {
      this.login();
    } else if (this.isRegisterPage) {
      this.register();
    }
  }
}