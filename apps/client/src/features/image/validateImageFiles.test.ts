import { describe, expect, it } from "vitest";

import { MAX_IMAGE_SIZE_IN_BYTES, MAX_IMAGES_PER_GALLERY } from "./constants";
import { validateImageFiles } from "./validateImageFiles";

const createImageFile = ({
  size = 100,
  type = "image/jpeg",
}: {
  size?: number;
  type?: string;
} = {}) => {
  return new File([new Uint8Array(size)], "photo.jpg", {
    type,
  });
};

describe("validateImageFiles", () => {
  it("returns an error when no files are selected", () => {
    expect(validateImageFiles([])).toBe("Please select at least one photo.");
  });

  it("returns an error when more than 50 files are selected", () => {
    const files = Array.from({ length: MAX_IMAGES_PER_GALLERY + 1 }, () =>
      createImageFile(),
    );

    expect(validateImageFiles(files)).toBe(
      `Can't upload more than ${MAX_IMAGES_PER_GALLERY} photos.`,
    );
  });

  it("returns an error when gallery already contains maximum number of photos", () => {
    expect(validateImageFiles([createImageFile()], 0)).toBe(
      `This gallery already contains the maximum of ${MAX_IMAGES_PER_GALLERY} photos.`,
    );
  });

  it("returns singular photo label when only one more photo can be uploaded", () => {
    const files = [createImageFile(), createImageFile()];

    expect(validateImageFiles(files, 1)).toBe(
      "You can upload only 1 more photo to this gallery.",
    );
  });

  it("returns plural photos label when selected files exceed available slots", () => {
    const files = [createImageFile(), createImageFile(), createImageFile()];

    expect(validateImageFiles(files, 2)).toBe(
      "You can upload only 2 more photos to this gallery.",
    );
  });

  it("returns an error for unsupported file format", () => {
    const file = createImageFile({
      type: "image/gif",
    });

    expect(validateImageFiles([file])).toBe(
      "Only JPEG, PNG files are allowed.",
    );
  });

  it("returns an error when file is too large", () => {
    const file = createImageFile({
      size: MAX_IMAGE_SIZE_IN_BYTES + 1,
    });

    expect(validateImageFiles([file])).toBe(
      "The size of each photo must not exceed 5MB.",
    );
  });

  it("returns an empty string for valid image files", () => {
    const files = [
      createImageFile({
        type: "image/jpeg",
      }),
      createImageFile({
        type: "image/png",
      }),
    ];

    expect(validateImageFiles(files)).toBe("");
  });
});
