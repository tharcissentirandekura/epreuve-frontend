import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { UserService } from '../../services/auth/user/user.service';
import { User, ValidationPatterns, ValidationMessages } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  isEditing = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  validationMessages = ValidationMessages;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.pattern(ValidationPatterns.name)]],
      last_name: ['', [Validators.required, Validators.pattern(ValidationPatterns.name)]],
      username: ['', [Validators.required, Validators.pattern(ValidationPatterns.username)]],
      email: ['', [Validators.required, Validators.pattern(ValidationPatterns.email)]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          email: user.email
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile information';
        this.isLoading = false;
        console.error('Error loading user profile:', error);
      }
    });
  }

  toggleEdit(): void {
    if (this.isEditing) {
      // Cancel editing - reset form to original values
      this.profileForm.patchValue({
        first_name: this.user?.first_name,
        last_name: this.user?.last_name,
        username: this.user?.username,
        email: this.user?.email
      });
      this.errorMessage = '';
      this.successMessage = '';
    }
    this.isEditing = !this.isEditing;
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.profileForm.value;
      
      this.userService.updateUser(formData).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.isEditing = false;
          this.isSaving = false;
          this.successMessage = 'Profile updated successfully!';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.isSaving = false;
          this.errorMessage = 'Failed to update profile. Please try again.';
          console.error('Error updating profile:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return this.validationMessages.required;
      }
      if (control.errors['pattern']) {
        switch (fieldName) {
          case 'email':
            return this.validationMessages.email;
          case 'username':
            return this.validationMessages.username;
          case 'first_name':
          case 'last_name':
            return this.validationMessages.name;
          default:
            return 'Invalid format';
        }
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!(control?.invalid && control.touched);
  }
}

