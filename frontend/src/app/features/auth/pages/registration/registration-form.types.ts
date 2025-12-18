import type { FormControl, FormGroup } from '@angular/forms';

export type RegistrationFormGroup = FormGroup<{
  name: FormControl<string>;
  userName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

export interface RegistrationRequest {
  name: string;
  userName: string;
  email: string;
  password: string;
}
