import { describe, expect, it } from "vitest";

import { validateGalleryForm } from "./validateGalleryForm";

describe("validateGalleryForm", () => {
  it("returns no errors for valid gallery values", () => {
    expect(
      validateGalleryForm({
        title: "Nature",
        description: "Summer photos",
      }),
    ).toEqual({});
  });

  it("returns an error when title is too short", () => {
    expect(
      validateGalleryForm({
        title: "A",
        description: "",
      }),
    ).toEqual({
      title: "Title must be 2-50 characters",
    });
  });

  it("returns an error when title is too long", () => {
    expect(
      validateGalleryForm({
        title: "A".repeat(51),
        description: "",
      }),
    ).toEqual({
      title: "Title must be 2-50 characters",
    });
  });

  it("ignores spaces around title", () => {
    expect(
      validateGalleryForm({
        title: "  Nature  ",
        description: "",
      }),
    ).toEqual({});
  });

  it("returns an error when description is too long", () => {
    expect(
      validateGalleryForm({
        title: "Nature",
        description: "A".repeat(256),
      }),
    ).toEqual({
      description: "Description must be up to 255 characters",
    });
  });

  it("returns both errors when title and description are invalid", () => {
    expect(
      validateGalleryForm({
        title: "",
        description: "A".repeat(256),
      }),
    ).toEqual({
      title: "Title must be 2-50 characters",
      description: "Description must be up to 255 characters",
    });
  });
});
