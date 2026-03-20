import { FormArray, FormControl } from "@angular/forms";

export interface IFormSignUp {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  name: FormControl<string | null>;
  lastName1: FormControl<string | null>;
  lastName2: FormControl<string | null>;
  phone: FormControl<string | null>;
  birthDate: FormControl<string | null>;
  institution: FormControl<string | null>;
  teachingLevel: FormControl<string | null>;
  specializations: FormArray<FormControl<string | null>>;
  orcidDoi: FormControl<string | null>
}