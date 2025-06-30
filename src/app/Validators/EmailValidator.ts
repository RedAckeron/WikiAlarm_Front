import { AbstractControl, ValidationErrors } from "@angular/forms";

export function Kp_EmailValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  
  if (!emailRegex.test(control.value)) {
    return { invalidEmail: true, message: "Format d'email incorrect" };
  }

  if (control.value.length <= 5) {
    return { tooShort: true, message: "L'email est trop court" };
  }

  return null;
}

