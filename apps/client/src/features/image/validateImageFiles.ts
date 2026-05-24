import {
  ALLOWED_IMAGE_FORMATS_LABEL,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_IN_BYTES,
  MAX_IMAGES_PER_GALLERY,
} from "./constants";

export const validateImageFiles = (files: File[]): string => {
  if (!files.length) {
    return "Please select at least one photo.";
  }

  if (files.length > MAX_IMAGES_PER_GALLERY) {
    return `You can upload a maximum of ${MAX_IMAGES_PER_GALLERY} photos.`;
  }

  const hasInvalidType = files.some(
    (file) => !ALLOWED_IMAGE_MIME_TYPES.includes(file.type),
  );

  if (hasInvalidType) {
    return `Only ${ALLOWED_IMAGE_FORMATS_LABEL} files are allowed.`;
  }

  const hasTooLargeFile = files.some(
    (file) => file.size > MAX_IMAGE_SIZE_IN_BYTES,
  );

  if (hasTooLargeFile) {
    return "Each photo must be no more than 5MB.";
  }

  return "";
};
