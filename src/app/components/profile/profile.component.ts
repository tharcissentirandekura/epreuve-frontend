import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { AvatarUploadService, AvatarValidationResult } from '../../services/user/avatar-upload.service';
import { UserPreferencesService, ExtendedUserPreferences } from '../../services/user/user-preferences.service';
import { User, PasswordChangeData, ValidationMessages } from '../../models/user.model';
import { AuthValidators } from '../../validators/auth.validators';
import { ErrorHandlingService } from '../../interceptors/error.interceptor';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: User | null = null;
  
  // Loading states
  isLoadingProfile = false;
  isUpdatingProfile = false;
  isChangingPassword = false;
  isUploadingAvatar = false;
  
  // UI states
  showPasswordForm = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  // Messages
  successMessage = '';
  errorMessage = '';
  validationMessages = ValidationMessages;
  
  // Avatar
  selectedAvatarFile: File | null = null;
  avatarPreview: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private avatarUploadService: AvatarUploadService,
    private userPreferencesService: UserPreferencesService,
    private errorHandlingService: ErrorHandlingService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
    
    // Subscribe to authentication state changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.populateProfileForm(user);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Profile form
    this.profileForm = this.fb.group({
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
      ]],
      email: ['', [
        Validators.required,
        AuthValidators.email
      ]]
    });

    // Password change form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [
        Validators.required
      ]],
      newPassword: ['', [
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

  private loadUserProfile(): void {
    this.isLoadingProfile = true;
    this.clearMessages();

    this.userService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.populateProfileForm(user);
          this.isLoadingProfile = false;
        },
        error: (error) => {
          console.error('Failed to load profile:', error);
          this.errorMessage = this.errorHandlingService.handleAuthError(error);
          this.isLoadingProfile = false;
        }
      });
  }

  private populateProfileForm(user: User): void {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email
    });
  }

  // Profile update methods
  updateProfile(): void {
    if (this.profileForm.invalid || this.isUpdatingProfile) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile = true;
    this.clearMessages();

    const updateData = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      username: this.profileForm.value.username,
      email: this.profileForm.value.email
    };

    this.userService.updateProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          this.currentUser = updatedUser;
          this.successMessage = 'Profil mis à jour avec succès!';
          this.isUpdatingProfile = false;
          
          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Profile update failed:', error);
          this.errorMessage = this.errorHandlingService.handleAuthError(error);
          this.isUpdatingProfile = false;
        }
      });
  }

  // Password change methods
  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
      this.clearMessages();
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.isChangingPassword) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword = true;
    this.clearMessages();

    const passwordData: PasswordChangeData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.userService.changePassword(passwordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Mot de passe changé avec succès!';
          this.passwordForm.reset();
          this.showPasswordForm = false;
          this.isChangingPassword = false;
          
          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Password change failed:', error);
          this.errorMessage = this.errorHandlingService.handleAuthError(error);
          this.isChangingPassword = false;
        }
      });
  }

  // Enhanced avatar upload methods
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Use the avatar upload service for validation
      const validation = this.avatarUploadService.validateAvatarFile(file);
      
      if (!validation.isValid) {
        this.errorMessage = validation.errors.join(', ');
        return;
      }
      
      this.selectedAvatarFile = file;
      
      // Create preview using the service
      this.avatarUploadService.createImagePreview(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (preview) => {
            this.avatarPreview = preview;
            this.clearMessages();
          },
          error: (error) => {
            console.error('Failed to create preview:', error);
            this.errorMessage = 'Impossible de créer un aperçu de l\'image.';
          }
        });
    }
  }

  uploadAvatar(): void {
    if (!this.selectedAvatarFile || this.isUploadingAvatar) {
      return;
    }

    this.isUploadingAvatar = true;
    this.clearMessages();

    this.userService.uploadAvatar(this.selectedAvatarFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (avatarUrl) => {
          if (this.currentUser) {
            this.currentUser.avatar = avatarUrl;
          }
          this.successMessage = 'Photo de profil mise à jour avec succès!';
          this.selectedAvatarFile = null;
          this.avatarPreview = null;
          this.isUploadingAvatar = false;
          
          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Avatar upload failed:', error);
          this.errorMessage = this.errorHandlingService.handleAuthError(error);
          this.isUploadingAvatar = false;
        }
      });
  }

  cancelAvatarUpload(): void {
    this.selectedAvatarFile = null;
    this.avatarPreview = null;
    this.clearMessages();
  }

  // Password visibility toggles
  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Form validation helpers
  getFieldError(formName: 'profile' | 'password', fieldName: string): string {
    const form = formName === 'profile' ? this.profileForm : this.passwordForm;
    const field = form.get(fieldName);
    
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
    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} caractères requis.`;
    }
    
    return 'Champ invalide.';
  }

  get hasPasswordMismatch(): boolean {
    return this.passwordForm.hasError('passwordMismatch') && 
           (this.passwordForm.get('confirmPassword')?.touched || false);
  }

  getPasswordStrength(): { score: number; feedback: string[]; isStrong: boolean } {
    const password = this.passwordForm.get('newPassword')?.value;
    if (!password) {
      return { score: 0, feedback: [], isStrong: false };
    }
    return AuthValidators.getPasswordStrength(password);
  }

  // Utility methods
  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Form control getters
  get firstName() { return this.profileForm.get('firstName'); }
  get lastName() { return this.profileForm.get('lastName'); }
  get username() { return this.profileForm.get('username'); }
  get email() { return this.profileForm.get('email'); }
  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }
}