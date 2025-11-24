import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const hasMinLength = value.length >= 8;
    const hasNumber = /\d/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);
    if (hasMinLength && hasNumber && hasLetter) {
      return null;
    }
    return {
      password: {
        message: 'Password must be at least 8 characters with letters and numbers'
      }
    };
  };
}
