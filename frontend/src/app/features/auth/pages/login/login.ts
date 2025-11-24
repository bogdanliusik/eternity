import { Component, computed, effect, inject, signal } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { passwordValidator } from '../../validators/password.validator';
import { LogInFormGroup } from './log-in-form.types';
import { AuthStore } from '@/core/auth/auth.store';
import { LoaderCircleIcon, LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    AngularSvgIconModule,
    ReactiveFormsModule,
    LucideAngularModule,
    RouterModule
  ],
  templateUrl: './login.html'
})
export class Login {
  public loadingCircleIcon = LoaderCircleIcon;
  readonly authStore = inject(AuthStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly logInForm = this.createLoginForm();
  readonly formControls = {
    username: this.logInForm.get('username') as FormControl<string>,
    password: this.logInForm.get('password') as FormControl<string>
  };
  readonly isSubmitted = signal<boolean>(false);
  readonly showUsernameError = computed(() => {
    const usernameControl = this.formControls.username;
    return this.isSubmitted() && usernameControl.invalid && usernameControl.touched;
  });
  readonly showPasswordError = computed(() => {
    const passwordControl = this.formControls.password;
    return this.isSubmitted() && passwordControl.invalid && passwordControl.touched;
  });

  constructor() {
    this.authStore.clearErrors();
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        console.log('Login successful, user:', this.authStore.user());
      }
    });
  }

  sendForm(): void {
    this.isSubmitted.update(() => true);
    this.authStore.clearErrors();
    if (this.logInForm.invalid) {
      this.logInForm.markAllAsTouched();
      return;
    }
    this.authStore.login(this.logInForm.getRawValue());
  }

  private createLoginForm(): LogInFormGroup {
    return this.formBuilder.group({
      username: new FormControl<string>('', {
        validators: [Validators.required, Validators.minLength(4)],
        nonNullable: true
      }),
      password: new FormControl<string>('', {
        validators: [Validators.required, Validators.minLength(8), passwordValidator()],
        nonNullable: true
      })
    });
  }
}
