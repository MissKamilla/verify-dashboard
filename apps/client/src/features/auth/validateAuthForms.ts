import {
  getEmailError,
  getRequiredPasswordError,
  getConfirmPasswordError,
  getNameError,
  getStrongPasswordError,
} from "@/shared/lib/validationRules";

import type {
  LoginFormErrors,
  LoginFormValues,
  RegisterFormErrors,
  RegisterFormValues,
} from "./types";

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

export const validateLoginForm = (values: LoginFormValues): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  const emailError = getEmailError(values.email);
  const passwordError = getRequiredPasswordError(values.password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
};
