import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import {
    RegisterData,
    ValidationMessages
} from '../../models/user.model';
import { AuthValidators } from '../../validators/auth.validators';

@Component({
    selector: 'app-register',
    standalone: true,
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FooterComponent,
    ],
})
export class RegisterComponent implements OnInit, OnDestroy {
    registerForm!: FormGroup;
    isSubmitting = false;
    showPassword = false;
    showConfirmPassword = false;

    errorMessage = '';
    popupMessage: string | null = null;
    popupSuccess = false;
    returnUrl = '/home';

    // Validation messages
    validationMessages = ValidationMessages;

    // Component lifecycle
    private destroy$ = new Subject<void>();

    // Register page info
    pageInfo = {
        title: 'S\'inscrire',
        subtitle: 'Rejoignez-nous',
        description: 'Créez votre compte pour accéder à toutes les fonctionnalités de notre plateforme.'
    };

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

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
        this.registerForm = this.fb.group({
            firstName: ['', [
                Validators.required,
                AuthValidators.nameValidator
            ]],
            lastName: ['', [
                Validators.required,
                AuthValidators.nameValidator
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

    // Form control getters
    get firstName() {
        return this.registerForm.get('firstName');
    }

    get lastName() {
        return this.registerForm.get('lastName');
    }

    get username() {
        return this.registerForm.get('username');
    }

    get email() {
        return this.registerForm.get('email');
    }

    get password() {
        return this.registerForm.get('password');
    }

    get confirmPassword() {
        return this.registerForm.get('confirmPassword');
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit() {
        if (this.registerForm.invalid || this.isSubmitting) {
            this.registerForm.markAllAsTouched();
            return;
        }

        const registerData: RegisterData = {
            firstName: this.registerForm.value.firstName,
            lastName: this.registerForm.value.lastName,
            username: this.registerForm.value.username,
            email: this.registerForm.value.email,
            password: this.registerForm.value.password,
            confirmPassword: this.registerForm.value.confirmPassword
        };

        this.isSubmitting = true;
        this.errorMessage = '';
        this.popupMessage = null;

        this.authService.register(registerData).subscribe({
            next: (response) => {
                console.log('Registration successful', response);
                this.popupSuccess = true;
                this.popupMessage = 'Inscription réussie! Redirection vers la connexion...';

                // Navigate to login after successful registration
                setTimeout(() => {
                    this.router.navigate(['/login'], {
                        queryParams: { message: 'registration-success' }
                    });
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

    // Navigate to login page
    goToLogin() {
        this.router.navigate(['/login']);
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
        const field = this.registerForm.get(fieldName);
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
    get hasPasswordMismatch(): boolean {
        return this.registerForm.hasError('passwordMismatch') &&
            (this.confirmPassword?.touched ?? false);
    }

    // Get password strength for registration
    getPasswordStrength(): { score: number; feedback: string[]; isStrong: boolean } {
        if (!this.password?.value) {
            return { score: 0, feedback: [], isStrong: false };
        }
        return AuthValidators.getPasswordStrength(this.password.value);
    }


}