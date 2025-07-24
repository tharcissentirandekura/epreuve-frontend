import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { AuthService } from '../../services/auth/auth.service';
import { 
  LoginCredentials, 
  ValidationMessages 
} from '../../models/user.model';

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

  errorMessage = '';
  popupMessage: string | null = null;
  popupSuccess = false;
  returnUrl = '/home';

  // Validation messages
  validationMessages = ValidationMessages;

  // Component lifecycle
  private destroy$ = new Subject<void>();

  // Login page info
  pageInfo = {
    title: 'Se connecter',
    subtitle: 'Bienvenue',
    description: 'Connectez-vous pour accéder à votre compte et profiter de nos services.'
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/home'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    
    // Check for registration success message
    const message = this.route.snapshot.queryParams['message'];
    if (message === 'registration-success') {
      this.popupSuccess = true;
      this.popupMessage = 'Inscription réussie! Vous pouvez maintenant vous connecter.';
      
      // Clear message after 5 seconds
      setTimeout(() => {
        this.popupMessage = null;
      }, 5000);
    }
    
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
  }

  // Form control getters
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
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

  // Navigate to register page
  goToRegister() {
    this.router.navigate(['/register']);
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
    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} caractères requis.`;
    }
    
    return 'Champ invalide.';
  }


}