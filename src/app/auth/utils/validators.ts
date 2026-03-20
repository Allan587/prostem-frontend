import { FormGroup } from "@angular/forms";

function stringIncludesNumbers(str: string) {
  return /\d/.test(str);
}

export const isRequired = (field: 'email' | 'password' | 'name' | 'lastName1' | 'lastName2' |
  'phone' | 'birthDate' | 'institution' | 'teachingLevel' | 'specializations', form: FormGroup) => {
  const control = form.get(field);

  return control && control.touched && control.hasError('required');
};

export const isInvalidEmail = (form: FormGroup) => {
  const control = form.get('email');

  return control && control.touched && control.hasError('email');
};

export const isInvalidPassword = (form: FormGroup) => {
  const control = form.get('password');
  return control && control.touched && control.hasError('password');
};

export const isPasswordTooShort = (form: FormGroup) => {
  const control = form.get('password');
  return control && control.touched && control.value.length < 6;
};

export const isInvalidNameOrLastName = (form: FormGroup, controlName: string) => {
  const control = form.get(controlName);
  return control && control.touched && stringIncludesNumbers(control.value);
};