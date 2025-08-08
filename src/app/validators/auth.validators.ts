import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ValidationPatterns } from '../models/user.model';

export class AuthValidators {
  
  // Password match validator
  static passwordMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  // Strong password validator
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    const isValidLength = value.length >= 8;
    
    const errors: any = {};
    
    if (!hasUpperCase) errors.missingUpperCase = true;
    if (!hasLowerCase) errors.missingLowerCase = true;
    if (!hasNumeric) errors.missingNumeric = true;
    if (!hasSpecialChar) errors.missingSpecialChar = true;
    if (!isValidLength) errors.minLength = true;
    
    return Object.keys(errors).length > 0 ? { strongPassword: errors } : null;
  }

  // Email format validator
  static email(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    
    const isValid = ValidationPatterns.email.test(value);
    return isValid ? null : { email: true };
  }

  // Username format validator
  static username(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    
    const isValid = ValidationPatterns.username.test(value);
    return isValid ? null : { username: true };
  }

  // Name format validator
  static nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    
    const isValid = ValidationPatterns.name.test(value);
    return isValid ? null : { name: true };
  }



  // Password strength indicator
  static getPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    if (!password) {
      return { score: 0, feedback: [], isStrong: false };
    }

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one lowercase letter');
    }

    // Number check
    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one number');
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one special character');
    }

    // Bonus points for length
    if (password.length >= 12) {
      score += 1;
    }

    return {
      score: Math.min(score, 5),
      feedback,
      isStrong: score >= 4
    };
  }

  // Common password validator
  static notCommonPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', '123123'
    ];

    const isCommon = commonPasswords.some(common => 
      value.toLowerCase().includes(common.toLowerCase())
    );

    return isCommon ? { commonPassword: true } : null;
  }

  // Age validation (for registration)
  static minimumAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= minAge ? null : { minimumAge: { requiredAge: minAge, actualAge: age - 1 } };
      }

      return age >= minAge ? null : { minimumAge: { requiredAge: minAge, actualAge: age } };
    };
  }

  // Terms and conditions validator
  static termsAccepted(control: AbstractControl): ValidationErrors | null {
    return control.value === true ? null : { termsNotAccepted: true };
  }
}