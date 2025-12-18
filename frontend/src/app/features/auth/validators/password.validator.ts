import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface PasswordValidationErrors {
  minLength?: boolean;
  requireDigit?: boolean;
  requireLowercase?: boolean;
  requireUppercase?: boolean;
  requireNonAlphanumeric?: boolean;
}

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const errors: PasswordValidationErrors = {};

    if (value.length < 8) {
      errors.minLength = true;
    }
    if (!/\d/.test(value)) {
      errors.requireDigit = true;
    }
    if (!/[a-z]/.test(value)) {
      errors.requireLowercase = true;
    }
    if (!/[A-Z]/.test(value)) {
      errors.requireUppercase = true;
    }
    if (!/[^a-zA-Z0-9]/.test(value)) {
      errors.requireNonAlphanumeric = true;
    }

    if (Object.keys(errors).length > 0) {
      return { password: errors };
    }

    return null;
  };
}

export function getPasswordErrorMessage(errors: PasswordValidationErrors): string {
  const messages: string[] = [];

  if (errors.minLength) {
    messages.push('at least 8 characters');
  }
  if (errors.requireDigit) {
    messages.push('a digit');
  }
  if (errors.requireLowercase) {
    messages.push('a lowercase letter');
  }
  if (errors.requireUppercase) {
    messages.push('an uppercase letter');
  }
  if (errors.requireNonAlphanumeric) {
    messages.push('a special character');
  }

  return `Password must contain ${messages.join(', ')}`;
}
