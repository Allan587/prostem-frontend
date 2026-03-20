import { FormControl } from "@angular/forms";

export interface IFormSignIn {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}