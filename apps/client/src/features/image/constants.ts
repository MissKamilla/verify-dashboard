export const MAX_IMAGES_PER_GALLERY = 50;

export const MAX_IMAGE_SIZE_IN_MB = 5;
export const MAX_IMAGE_SIZE_LABEL = `${MAX_IMAGE_SIZE_IN_MB}MB`;
export const MAX_IMAGE_SIZE_IN_BYTES = MAX_IMAGE_SIZE_IN_MB * 1024 * 1024;

export const MAX_IMAGE_NAME_LENGTH = 100;
export const MAX_IMAGE_COMMENT_LENGTH = 500;

export const IMAGE_PREVIEW_BOTTOM_FADE_OFFSET = 79;

export const UPLOAD_IMAGES_CHUNK_SIZE = 5;
export const UPLOAD_IMAGES_CONCURRENCY = 3;

export const ALLOWED_IMAGE_MIME_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
];

export const ALLOWED_IMAGE_FORMATS_LABEL = "JPEG, PNG";
