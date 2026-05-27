import {
  MAX_IMAGE_COMMENT_LENGTH,
  MAX_IMAGE_NAME_LENGTH,
} from "./constants";
import type { ImageMetafields } from "./types";

export const validateImageMetafields = (
  metafields: ImageMetafields[],
): string => {
  const hasTooLongName = metafields.some(
    ({ name }) => (name?.trim().length ?? 0) > MAX_IMAGE_NAME_LENGTH,
  );

  if (hasTooLongName) {
    return `Photo name must be no more than ${MAX_IMAGE_NAME_LENGTH} characters.`;
  }

  const hasTooLongComment = metafields.some(
    ({ comment }) => (comment?.trim().length ?? 0) > MAX_IMAGE_COMMENT_LENGTH,
  );

  if (hasTooLongComment) {
    return `Photo comment must be no more than ${MAX_IMAGE_COMMENT_LENGTH} characters.`;
  }

  return "";
};
