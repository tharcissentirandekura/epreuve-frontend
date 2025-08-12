import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { AuthService } from '../../services/auth/auth.service';
import { LoginCredentials, User } from '../../models/user.model';
import { ToastService } from '../../services/toast/toast.service';
import { ToastComponent } from '../toast/toast.component';
import { UserService } from '../../services/auth/user/user.service';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FooterComponent, ToastComponent,NavbarComponent],
})


export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting: boolean = false;
  showPassword: boolean = false;



  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private userService: UserService
  ) { 

    /**
     * Validate the login form for username and password
     * Initialize the form with default values
     */
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });



  }

  ngOnInit(): void {
    // check for registration success message
    //Using snapshot.queryParams (One-time, Static)
    //I only care about the query params at the time the component is loaded, and don't expect them to change
    if (this.route.snapshot.queryParams['message'] === 'registration-success') {
      // this.successMessage = 'Inscription réussie! Vous pouvez maintenant vous connecter.';
      this.toastService.success('Inscription réussie! Vous pouvez maintenant vous connecter.',6000);
    }

    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/profile';
      this.router.navigate([returnUrl]);
      return;
    }

  }

  //toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Submit the login form
   * @returns nothing
   */
  onSubmit() {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }
    /**
     * populate the user's credentials
     * @param credentials the  user's credentials
     * 
     */
    const credentials: LoginCredentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    }

    /**
     * Now is the time to update the instance variables 
     * like isSubmitting and errorMessage
     */

    this.isSubmitting = true;
    /**
     * Login the user
     * @param credentials the user's credentials
     * @returns an observable of the user's credentials
     * We use subscribe to handle the response from the server
     * next: the response from the server
     * error: the error from the server
     * complete: the server has finished processing the request
     */
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.toastService.success('Connexion réussie! Redirection en cours...', 6000);
        
        // Small delay to show the success toast before navigation
        setTimeout(() => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/profile';
          this.router.navigate([returnUrl]);
        }, 500);
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = this.getErrorMessage(error);
        this.toastService.error(errorMessage, 4000);
      },
      complete: () =>{
        console.log('Login process completed')
        this.userService.getCurrentUser().subscribe(
          user => {
            console.log('Current user:', user);
          }
        )
      }

    });
  }

  /**
   * Redirection handler for register
   */
  goToRegister() {
    this.router.navigate(['/register']);
  }

  /**
   * Get error message for toast notification
   * @param error the error returned when logging the user
   */
  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Nom d\'utilisateur ou mot de passe incorrect.';
    } else if (error.status === 429) {
      return 'Trop de tentatives. Veuillez réessayer plus tard.';
    } else if (error.status === 0) {
      return 'Problème de connexion. Vérifiez votre connexion internet.';
    } else {
      return 'Une erreur s\'est produite. Veuillez réessayer.';
    }
  }
  /**
   * There is a possibility to get errors when completing the form 
   * So, we need field error handler
   * @param fieldName 
   * @returns 
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field?.errors || !field.touched) return '';

    if (field.errors['required']) return 'Espace est requis';
    if (field.errors['minlength']) {
      return `Minimum ${field.errors['minlength'].requiredLength} caractères requis`;
    }
    return 'Espace invalide';
  }
}