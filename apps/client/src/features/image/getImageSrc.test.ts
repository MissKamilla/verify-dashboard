import { describe, expect, it } from "vitest";

import { getImageSrc } from "./getImageSrc";

const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

describe("getImageSrc", () => {
  it("returns HTTP image URL without changes", () => {
    expect(getImageSrc("http://cdn.test.com/photo.jpg")).toBe(
      "http://cdn.test.com/photo.jpg",
    );
  });

  it("returns HTTPS image URL without changes", () => {
    expect(getImageSrc("https://cdn.test.com/photo.jpg")).toBe(
      "https://cdn.test.com/photo.jpg",
    );
  });

  it("adds API base URL to stored image path", () => {
    expect(getImageSrc("/uploads/images/photo.jpg")).toBe(
      `${apiBaseUrl}/uploads/images/photo.jpg`,
    );
  });

  it("adds missing slash between API URL and image path", () => {
    expect(getImageSrc("uploads/images/photo.jpg")).toBe(
      `${apiBaseUrl}/uploads/images/photo.jpg`,
    );
  });
});
