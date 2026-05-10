import {
  getRequiredPasswordError,
  getConfirmPasswordError,
  getStrongPasswordError,
  getNameError,
} from "@/shared/lib/validationRules";

import type {
  AccountSettingsFormErrors,
  AccountSettingsFormValues,
  ChangePasswordFormErrors,
  ChangePasswordFormValues,
} from "./types";

export const validateAccountSettingsForm = (
  values: AccountSettingsFormValues,
): AccountSettingsFormErrors => {
  const errors: AccountSettingsFormErrors = {};

  const firstnameError = getNameError(values.firstname, "First name");
  const lastnameError = getNameError(values.lastname, "Last name");

  if (firstnameError) {
    errors.firstname = firstnameError;
  }

  if (lastnameError) {
    errors.lastname = lastnameError;
  }

  return errors;
};

export const validateChangePasswordForm = (
  values: ChangePasswordFormValues,
): ChangePasswordFormErrors => {
  const errors: ChangePasswordFormErrors = {};

  const oldPasswordError = getRequiredPasswordError(values.oldPassword);
  const newPasswordError = getStrongPasswordError(values.newPassword);
  const confirmNewPasswordError = getConfirmPasswordError(
    values.newPassword,
    values.confirmNewPassword,
  );

  if (oldPasswordError) {
    errors.oldPassword = oldPasswordError;
  }

  if (newPasswordError) {
    errors.newPassword = newPasswordError;
  }

  if (confirmNewPasswordError) {
    errors.confirmNewPassword = confirmNewPasswordError;
  }

  return errors;
};
