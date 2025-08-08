import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterData } from '../../models/user.model';
import { AuthValidators } from '../../validators/auth.validators';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';

@Component({
    selector: 'app-register',
    standalone: true,
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    imports: [CommonModule, ReactiveFormsModule, FooterComponent,NavbarComponent],
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;
    isSubmitting = false;
    showPassword = false;
    showConfirmPassword = false;
    errorMessage = '';
    successMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
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
            firstName: ['', [Validators.required, AuthValidators.nameValidator]],
            lastName: ['', [Validators.required, AuthValidators.nameValidator]],
            username: ['', [Validators.required, AuthValidators.username]],
            email: ['', [Validators.required, AuthValidators.email]],
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
            firstName: this.registerForm.value.firstName,
            lastName: this.registerForm.value.lastName,
            username: this.registerForm.value.username,
            email: this.registerForm.value.email,
            password: this.registerForm.value.password,
            confirmPassword: this.registerForm.value.confirmPassword
        };

        this.isSubmitting = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.register(registerData).subscribe({
            next: (response) => {
                this.router.navigate(['/login'], {
                    queryParams: { message: 'registration-success' }
                });
            },
            error: (error) => {
                this.isSubmitting = false;
                this.handleError(error);
            }
        });
    }

    // Navigate to login page
    goToLogin() {
        this.router.navigate(['/login']);
    }

    private handleError(error: any): void {
        if (error.status === 400) {
            if (error.error?.errors) {
                const firstError = Object.values(error.error.errors)[0];
                this.errorMessage = Array.isArray(firstError) ? firstError[0] : firstError as string;
            } else if (error.error?.detail) {
                this.errorMessage = error.error.detail;
            } else {
                this.errorMessage = 'Données invalides. Veuillez vérifier vos informations.';
            }
        } else if (error.status === 409) {
            this.errorMessage = 'Ce nom d\'utilisateur ou email existe déjà.';
        } else if (error.status === 500) {
            this.errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.status === 0) {
            this.errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
        } else {
            this.errorMessage = 'Une erreur s\'est produite. Veuillez réessayer.';
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