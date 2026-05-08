import type {
  AccountSettingsFormErrors,
  AccountSettingsFormValues,
} from "./types";

import { getNameError } from "@/shared/lib/validationRules";

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
