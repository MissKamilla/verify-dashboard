import type { LoginFormErrors, LoginFormValues } from "./types";
import { getEmailError, getRequiredPasswordError } from "./validationRules";

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
