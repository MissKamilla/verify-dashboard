import type {
  ChangePasswordFormErrors,
  ChangePasswordFormValues,
} from "./types";
import {
  getRequiredPasswordError,
  getConfirmPasswordError,
  getStrongPasswordError,
} from "@/shared/lib/validationRules";

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
