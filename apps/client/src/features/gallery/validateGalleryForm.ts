import type { GalleryFormErrors, GalleryFormValues } from "./types";

const MIN_TITLE_LENGTH = 2;
const MAX_TITLE_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 255;

export const validateGalleryForm = (
  values: GalleryFormValues,
): GalleryFormErrors => {
  const errors: GalleryFormErrors = {};

  const title = values.title.trim();
  const description = values.description.trim();

  if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
    errors.title = "Title must be 2-50 characters";
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = "Description must be up to 255 characters";
  }

  return errors;
};
