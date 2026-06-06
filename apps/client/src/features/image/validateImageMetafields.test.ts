import { describe, expect, it } from "vitest";

import { MAX_IMAGE_COMMENT_LENGTH, MAX_IMAGE_NAME_LENGTH } from "./constants";
import { validateImageMetafields } from "./validateImageMetafields";

describe("validateImageMetafields", () => {
  it("returns an empty string for valid metafields", () => {
    expect(
      validateImageMetafields([
        {
          name: "Lake",
          comment: "Summer photo",
        },
      ]),
    ).toBe("");
  });

  it("allows empty metafields", () => {
    expect(validateImageMetafields([{}])).toBe("");
  });

  it("returns an error when photo name is too long", () => {
    expect(
      validateImageMetafields([
        {
          name: "A".repeat(MAX_IMAGE_NAME_LENGTH + 1),
        },
      ]),
    ).toBe(
      `Photo name must be no more than ${MAX_IMAGE_NAME_LENGTH} characters.`,
    );
  });

  it("ignores spaces around photo name", () => {
    expect(
      validateImageMetafields([
        {
          name: `  ${"A".repeat(MAX_IMAGE_NAME_LENGTH)}  `,
        },
      ]),
    ).toBe("");
  });

  it("returns an error when photo comment is too long", () => {
    expect(
      validateImageMetafields([
        {
          comment: "A".repeat(MAX_IMAGE_COMMENT_LENGTH + 1),
        },
      ]),
    ).toBe(
      `Photo comment must be no more than ${MAX_IMAGE_COMMENT_LENGTH} characters.`,
    );
  });

  it("returns an error when at least one image has invalid metafields", () => {
    expect(
      validateImageMetafields([
        {
          name: "Lake",
        },
        {
          name: "A".repeat(MAX_IMAGE_NAME_LENGTH + 1),
        },
      ]),
    ).toBe(
      `Photo name must be no more than ${MAX_IMAGE_NAME_LENGTH} characters.`,
    );
  });
});
