import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterData } from '../../models/user.model';
import { AuthValidators } from '../../validators/auth.validators';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
import { ToastService } from '../../services/toast/toast.service';
import { ToastComponent } from '../toast/toast.component';
@Component({
    selector: 'app-register',
    standalone: true,
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    imports: [CommonModule, ReactiveFormsModule, FooterComponent, NavbarComponent,ToastComponent],
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;
    isSubmitting = false;
    showPassword = false;
    showConfirmPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastService: ToastService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Redirect if already authenticated
        if (this.authService.isAuthenticated()) {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
            this.router.navigate([returnUrl]);
            return;
        }

        this.registerForm = this.fb.group({
            username: ['', [Validators.required, AuthValidators.username]],
            password: ['', [Validators.required, AuthValidators.strongPassword, AuthValidators.notCommonPassword]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validators: [AuthValidators.passwordMatch]
        });
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
            username: this.registerForm.value.username,
            password: this.registerForm.value.password,
            confirmPassword: this.registerForm.value.confirmPassword
        };

        this.isSubmitting = true;

        this.authService.register(registerData).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                this.router.navigate(['/login'], {
                    queryParams: { message: 'registration-success' }
                });
            },
            error: (error) => {
                this.isSubmitting = false;
                const errorMessage = this.getErrorMessage(error);
                this.toastService.error(errorMessage, 5000);
            }
        });
    }

    // Navigate to login page
    goToLogin() {
        this.router.navigate(['/login']);
    }

    private getErrorMessage(error: any): string {
        // Log the full error for debugging
        console.error('Registration error:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);

        if (error.status === 400) {
            // Try multiple possible error response structures
            if (error.error?.errors) {
                // Django-style errors: { errors: { field: ["message"] } }
                const firstError = Object.values(error.error.errors)[0];
                return Array.isArray(firstError) ? firstError[0] : firstError as string;
            } else if (error.error?.detail) {
                // Simple detail message
                return error.error.detail;
            } else if (error.error?.message) {
                // Message field
                return error.error.message;
            } else if (typeof error.error === 'string') {
                // Error is a string
                return error.error;
            } else if (Array.isArray(error.error)) {
                // Error is an array of messages
                return error.error[0] || 'Données invalides. Veuillez vérifier vos informations.';
            } else if (error.error && typeof error.error === 'object') {
                // Try to extract first error message from object
                const errorKeys = Object.keys(error.error);
                if (errorKeys.length > 0) {
                    const firstKey = errorKeys[0];
                    const firstValue = error.error[firstKey];
                    if (Array.isArray(firstValue)) {
                        return firstValue[0];
                    } else if (typeof firstValue === 'string') {
                        return firstValue;
                    }
                }
            }
            return 'Données invalides. Veuillez vérifier vos informations.';
        } else if (error.status === 409) {
            return 'Ce nom d\'utilisateur existe déjà.';
        } else if (error.status === 500) {
            return 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.status === 0) {
            return 'Problème de connexion. Vérifiez votre connexion internet.';
        } else {
            return 'Une erreur s\'est produite. Veuillez réessayer.';
        }
    }

    getFieldError(fieldName: string): string {
        const field = this.registerForm.get(fieldName);
        if (!field?.errors || !field.touched) return '';

        const errors = field.errors;
        if (errors['required']) return 'Ce champ est requis';
        if (errors['email']) return 'Email invalide';
        if (errors['username']) return 'Nom d\'utilisateur invalide';
        if (errors['name']) return 'Nom invalide';
        if (errors['strongPassword']) return 'Mot de passe trop faible';
        if (errors['commonPassword']) return 'Mot de passe trop commun';
        return 'Champ invalide';
    }

    get hasPasswordMismatch(): boolean {
        return this.registerForm.hasError('passwordMismatch') &&
            (this.registerForm.get('confirmPassword')?.touched ?? false);
    }

    getPasswordStrength(): { score: number; feedback: string[]; isStrong: boolean } {
        const passwordValue = this.registerForm.get('password')?.value;
        if (!passwordValue) {
            return { score: 0, feedback: [], isStrong: false };
        }
        return AuthValidators.getPasswordStrength(passwordValue);
    }
}