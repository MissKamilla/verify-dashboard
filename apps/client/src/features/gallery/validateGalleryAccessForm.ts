import { getEmailError } from "@/shared/lib/validationRules";

import type {
  GalleryAccessFormErrors,
  GalleryAccessFormValues,
} from "@/features/gallery/types";

export const validateGalleryAccessForm = (
  values: GalleryAccessFormValues,
): GalleryAccessFormErrors => {
  const errors: GalleryAccessFormErrors = {};

  const emailError = getEmailError(values.email);

  if (emailError) {
    errors.email = emailError;
  }

  if (!values.role) {
    errors.role = "Role is required";
  }

  return errors;
};
