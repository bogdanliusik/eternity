import { Component, computed, inject, signal } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { getPasswordErrorMessage, passwordValidator } from '../../validators/password.validator';
import { RegistrationFormGroup, RegistrationRequest } from './registration-form.types';
import { AuthStore } from '@/core/auth/auth.store';
import { RouterModule } from '@angular/router';

function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.parent?.get('password');
  const confirmPassword = control;
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-registration',
  imports: [FormsModule, ButtonModule, InputTextModule, AngularSvgIconModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registration.html'
})
export class Registration {
  readonly authStore = inject(AuthStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly registrationForm = this.createRegistrationForm();
  readonly formControls = {
    name: this.registrationForm.get('name') as FormControl<string>,
    userName: this.registrationForm.get('userName') as FormControl<string>,
    email: this.registrationForm.get('email') as FormControl<string>,
    password: this.registrationForm.get('password') as FormControl<string>,
    confirmPassword: this.registrationForm.get('confirmPassword') as FormControl<string>
  };
  readonly isSubmitted = signal<boolean>(false);

  readonly showNameError = computed(() => {
    const control = this.formControls.name;
    return this.isSubmitted() && control.invalid && control.touched;
  });

  readonly showUserNameError = computed(() => {
    const control = this.formControls.userName;
    return this.isSubmitted() && control.invalid && control.touched;
  });

  readonly showEmailError = computed(() => {
    const control = this.formControls.email;
    return this.isSubmitted() && control.invalid && control.touched;
  });

  readonly showPasswordError = computed(() => {
    const control = this.formControls.password;
    return this.isSubmitted() && control.invalid && control.touched;
  });

  readonly showConfirmPasswordError = computed(() => {
    const control = this.formControls.confirmPassword;
    return this.isSubmitted() && control.invalid && control.touched;
  });

  constructor() {
    this.authStore.clearErrors();
    this.formControls.password.valueChanges.subscribe(() => {
      this.formControls.confirmPassword.updateValueAndValidity();
    });
  }

  sendForm(): void {
    this.isSubmitted.set(true);
    this.authStore.clearErrors();
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }
    const formValue = this.registrationForm.getRawValue();
    const request: RegistrationRequest = {
      name: formValue.name,
      userName: formValue.userName,
      email: formValue.email,
      password: formValue.password
    };
    this.authStore.register(request);
  }

  getPasswordErrorMessage(): string {
    const passwordErrors = this.formControls.password.getError('password');
    if (passwordErrors) {
      return getPasswordErrorMessage(passwordErrors);
    }
    return '';
  }

  private createRegistrationForm(): RegistrationFormGroup {
    return this.formBuilder.group({
      name: new FormControl<string>('', {
        validators: [Validators.required, Validators.minLength(2)],
        nonNullable: true
      }),
      userName: new FormControl<string>('', {
        validators: [Validators.required, Validators.minLength(4)],
        nonNullable: true
      }),
      email: new FormControl<string>('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true
      }),
      password: new FormControl<string>('', {
        validators: [Validators.required, passwordValidator()],
        nonNullable: true
      }),
      confirmPassword: new FormControl<string>('', {
        validators: [Validators.required, confirmPasswordValidator],
        nonNullable: true
      })
    });
  }
}
