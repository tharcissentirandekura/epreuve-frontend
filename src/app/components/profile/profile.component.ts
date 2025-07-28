import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { AvatarUploadService } from '../../services/user/avatar-upload.service';
import { User, PasswordChangeData } from '../../models/user.model';
import { AuthValidators } from '../../validators/auth.validators';
import { ErrorHandlingService } from '../../interceptors/error.interceptor';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: User | null = null;

  // Simplified state management
  loading = {
    profile: false,
    updating: false,
    password: false,
    avatar: false
  };

  ui = {
    showPasswordForm: false,
    showPasswords: { current: false, new: false, confirm: false }
  };

  messages = { success: '', error: '' };
  
  avatar = {
    file: null as File | null,
    preview: null as string | null
  };

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private avatarUploadService: AvatarUploadService,
    private errorHandlingService: ErrorHandlingService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, AuthValidators.nameValidator]],
      lastName: ['', [Validators.required, AuthValidators.nameValidator]],
      username: ['', [Validators.required, AuthValidators.username]],
      email: ['', [Validators.required, AuthValidators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, AuthValidators.strongPassword]],
      confirmPassword: ['', Validators.required]
    }, { validators: [AuthValidators.passwordMatch] });
  }

  private loadUserProfile(): void {
    this.loading.profile = true;
    this.clearMessages();

    this.userService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.profileForm.patchValue(user);
          this.loading.profile = false;
        },
        error: (error) => {
          this.handleError('Failed to load profile', error);
          this.loading.profile = false;
        }
      });
  }

  updateProfile(): void {
    if (this.profileForm.invalid || this.loading.updating) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading.updating = true;
    this.clearMessages();

    this.userService.updateProfile(this.profileForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.showSuccessMessage('Profil mis à jour avec succès!');
          this.loading.updating = false;
        },
        error: (error) => {
          this.handleError('Profile update failed', error);
          this.loading.updating = false;
        }
      });
  }

  togglePasswordForm(): void {
    this.ui.showPasswordForm = !this.ui.showPasswordForm;
    if (!this.ui.showPasswordForm) {
      this.passwordForm.reset();
      this.clearMessages();
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.loading.password) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.loading.password = true;
    this.clearMessages();

    const passwordData: PasswordChangeData = this.passwordForm.value;

    this.userService.changePassword(passwordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccessMessage('Mot de passe changé avec succès!');
          this.passwordForm.reset();
          this.ui.showPasswordForm = false;
          this.loading.password = false;
        },
        error: (error) => {
          this.handleError('Password change failed', error);
          this.loading.password = false;
        }
      });
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const validation = this.avatarUploadService.validateAvatarFile(file);
    if (!validation.isValid) {
      this.messages.error = validation.errors.join(', ');
      return;
    }

    this.avatar.file = file;
    this.avatarUploadService.createImagePreview(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preview) => {
          this.avatar.preview = preview;
          this.clearMessages();
        },
        error: () => this.messages.error = 'Impossible de créer un aperçu de l\'image.'
      });
  }

  uploadAvatar(): void {
    if (!this.avatar.file || this.loading.avatar) return;

    this.loading.avatar = true;
    this.clearMessages();

    this.userService.uploadAvatar(this.avatar.file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (avatarUrl) => {
          if (this.currentUser) this.currentUser.avatar = avatarUrl;
          this.showSuccessMessage('Photo de profil mise à jour avec succès!');
          this.resetAvatar();
          this.loading.avatar = false;
        },
        error: (error) => {
          this.handleError('Avatar upload failed', error);
          this.loading.avatar = false;
        }
      });
  }

  cancelAvatarUpload(): void {
    this.resetAvatar();
    this.clearMessages();
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    this.ui.showPasswords[field] = !this.ui.showPasswords[field];
  }

  getFieldError(formName: 'profile' | 'password', fieldName: string): string {
    const form = formName === 'profile' ? this.profileForm : this.passwordForm;
    const field = form.get(fieldName);
    
    if (!field?.errors || !field.touched) return '';

    // Simplified error mapping
    const errorMap: Record<string, string> = {
      required: 'Ce champ est requis',
      email: 'Email invalide',
      username: 'Nom d\'utilisateur invalide',
      name: 'Nom invalide',
      strongPassword: 'Mot de passe trop faible',
      commonPassword: 'Mot de passe trop commun'
    };

    const errorKey = Object.keys(field.errors)[0];
    return errorMap[errorKey] || 'Champ invalide';
  }

  get hasPasswordMismatch(): boolean {
    return this.passwordForm.hasError('passwordMismatch') && 
           !!this.passwordForm.get('confirmPassword')?.touched;
  }

  getPasswordStrength() {
    const password = this.passwordForm.get('newPassword')?.value;
    return password ? AuthValidators.getPasswordStrength(password) : 
           { score: 0, feedback: [], isStrong: false };
  }

  private handleError(context: string, error: any): void {
    console.error(context, error);
    this.messages.error = this.errorHandlingService.handleAuthError(error);
  }

  private showSuccessMessage(message: string): void {
    this.messages.success = message;
    setTimeout(() => this.messages.success = '', 3000);
  }

  private clearMessages(): void {
    this.messages = { success: '', error: '' };
  }

  private resetAvatar(): void {
    this.avatar = { file: null, preview: null };
  }

  // Simplified getters
  get f() { return this.profileForm.controls; }
  get pf() { return this.passwordForm.controls; }
}