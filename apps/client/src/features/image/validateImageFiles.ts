import {
  ALLOWED_IMAGE_FORMATS_LABEL,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_IN_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  MAX_IMAGES_PER_GALLERY,
} from "./constants";

export const validateImageFiles = (
  files: File[],
  availableImagesCount = MAX_IMAGES_PER_GALLERY,
): string => {
  if (!files.length) {
    return "Please select at least one photo.";
  }

  if (files.length > MAX_IMAGES_PER_GALLERY) {
    return `Can't upload more than ${MAX_IMAGES_PER_GALLERY} photos.`;
  }

  if (availableImagesCount <= 0) {
    return `This gallery already contains the maximum of ${MAX_IMAGES_PER_GALLERY} photos.`;
  }

  if (files.length > availableImagesCount) {
    const photoLabel = availableImagesCount === 1 ? "photo" : "photos";

    return `You can upload only ${availableImagesCount} more ${photoLabel} to this gallery.`;
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
    return `The size of each photo must not exceed ${MAX_IMAGE_SIZE_LABEL}.`;
  }

  return "";
};
