import type { RegisterFormErrors, RegisterFormValues } from "./types";
import {
  getConfirmPasswordError,
  getEmailError,
  getNameError,
  getStrongPasswordError,
} from "./validationRules";

export const validateRegisterForm = (
  values: RegisterFormValues,
): RegisterFormErrors => {
  const errors: RegisterFormErrors = {};

  const firstnameError = getNameError(values.firstname, "First name");
  const lastnameError = getNameError(values.lastname, "Last name");
  const emailError = getEmailError(values.email);
  const passwordError = getStrongPasswordError(values.password);
  const confirmPasswordError = getConfirmPasswordError(
    values.password,
    values.confirmPassword,
  );

  if (firstnameError) {
    errors.firstname = firstnameError;
  }

  if (lastnameError) {
    errors.lastname = lastnameError;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError;
  }

  return errors;
};
