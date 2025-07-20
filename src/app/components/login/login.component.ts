import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { 
  LoginCredentials, 
  RegisterData, 
  User, 
  ValidationMessages 
} from '../../models/user.model';
import { AuthValidators } from '../../validators/auth.validators';

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
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  rememberMe = false;
  isLoginPage = true;
  isRegisterPage = false;

  errorMessage = '';
  popupMessage: string | null = null;
  popupSuccess = false;
  returnUrl = '/home';

  // Validation messages
  validationMessages = ValidationMessages;

  // Component lifecycle
  private destroy$ = new Subject<void>();

  // Login/register info
  loginpageInfo = {
    title: 'Se connecter',
    subtitle: 'Bienvenue',
    description: 'Connectez-vous pour accéder à votre compte et profiter de nos services.',
    registerLink: 'S\'inscrire',
    socialText: 'Continuer avec Facebook',
    dividerText: 'Ou utiliser votre nom d\'utilisateur'
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/home'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    
    // Check if user is already authenticated
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigate([this.returnUrl]);
        }
      });

    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm() {
    if (this.isLoginPage) {
      this.loginForm = this.fb.group({
        username: ['', [
          Validators.required,
          Validators.minLength(3)
        ]],
        password: ['', [
          Validators.required,
          Validators.minLength(6)
        ]],
        rememberMe: [false]
      });
    } else if (this.isRegisterPage) {
      this.loginForm = this.fb.group({
        firstName: ['', [
          Validators.required,
          AuthValidators.name
        ]],
        lastName: ['', [
          Validators.required,
          AuthValidators.name
        ]],
        username: ['', [
          Validators.required,
          AuthValidators.username
        ], [
          AuthValidators.usernameAvailable(this.userService)
        ]],
        email: ['', [
          Validators.required,
          AuthValidators.email
        ], [
          AuthValidators.emailAvailable(this.userService)
        ]],
        password: ['', [
          Validators.required,
          AuthValidators.strongPassword,
          AuthValidators.notCommonPassword
        ]],
        confirmPassword: ['', [
          Validators.required
        ]]
      }, {
        validators: [AuthValidators.passwordMatch]
      });
    }
  }

  // Form control getters
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get firstName() {
    return this.loginForm.get('firstName');
  }

  get lastName() {
    return this.loginForm.get('lastName');
  }

  get email() {
    return this.loginForm.get('email');
  }

  get confirmPassword() {
    return this.loginForm.get('confirmPassword');
  }

  get rememberMeControl() {
    return this.loginForm.get('rememberMe');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  login() {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials: LoginCredentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe || false
    };

    this.isSubmitting = true;
    this.errorMessage = '';
    this.popupMessage = null;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.popupSuccess = true;
        this.popupMessage = 'Connexion réussie! Redirection en cours...';
        
        // Navigate to return URL after short delay
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1500);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.handleAuthError(error);
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  register() {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const registerData: RegisterData = {
      firstName: this.loginForm.value.firstName,
      lastName: this.loginForm.value.lastName,
      username: this.loginForm.value.username,
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      confirmPassword: this.loginForm.value.confirmPassword
    };

    this.isSubmitting = true;
    this.errorMessage = '';
    this.popupMessage = null;

    this.authService.register(registerData).subscribe({
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
        console.error('Registration error:', error);
        this.handleAuthError(error);
      },
      complete: () => {
        this.isSubmitting = false;
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

  // Error handling method
  private handleAuthError(error: any): void {
    this.popupSuccess = false;
    
    if (error.status === 400) {
      // Validation errors
      if (error.error && error.error.errors) {
        const firstError = Object.values(error.error.errors)[0];
        this.errorMessage = Array.isArray(firstError) ? firstError[0] : firstError as string;
      } else {
        this.errorMessage = 'Données invalides. Veuillez vérifier vos informations.';
      }
    } else if (error.status === 401) {
      this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
    } else if (error.status === 409) {
      this.errorMessage = 'Ce nom d\'utilisateur ou email existe déjà.';
    } else if (error.status === 429) {
      this.errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
    } else if (error.status === 0) {
      this.errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
    } else {
      this.errorMessage = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
    }
    
    this.popupMessage = this.errorMessage;
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      this.popupMessage = null;
      this.errorMessage = '';
    }, 5000);
  }

  // Get validation error message for a specific field
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;
    
    if (errors['required']) {
      return this.validationMessages.required;
    }
    if (errors['email']) {
      return this.validationMessages.email;
    }
    if (errors['username']) {
      return this.validationMessages.username;
    }
    if (errors['name']) {
      return this.validationMessages.name;
    }
    if (errors['strongPassword']) {
      return this.validationMessages.password;
    }
    if (errors['commonPassword']) {
      return 'Veuillez choisir un mot de passe plus sécurisé.';
    }
    if (errors['usernameUnavailable']) {
      return 'Ce nom d\'utilisateur n\'est pas disponible.';
    }
    if (errors['emailUnavailable']) {
      return 'Cette adresse email est déjà utilisée.';
    }
    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} caractères requis.`;
    }
    
    return 'Champ invalide.';
  }

  // Check if form has password mismatch error
  get hasPasswordMismatch(): any {
    return this.loginForm.hasError('passwordMismatch') && 
           this.confirmPassword?.touched;
  }

  // Get password strength for registration
  getPasswordStrength(): { score: number; feedback: string[]; isStrong: boolean } {
    if (!this.isRegisterPage || !this.password?.value) {
      return { score: 0, feedback: [], isStrong: false };
    }
    return AuthValidators.getPasswordStrength(this.password.value);
  }

  socialLogin(provider: string) {
    console.log(`${this.isLoginPage ? 'Login' : 'Register'} with ${provider}`);
    this.isSubmitting = true;
    
    this.authService.socialLogin(provider).subscribe({
      next: (response) => {
        console.log('Social login successful', response);
        this.popupSuccess = true;
        this.popupMessage = 'Connexion réussie! Redirection en cours...';
        
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1500);
      },
      error: (error) => {
        console.error('Social login error:', error);
        this.handleAuthError(error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
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