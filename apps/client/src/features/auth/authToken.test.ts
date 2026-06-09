import { beforeEach, describe, expect, it } from "vitest";

import {
  getAuthToken,
  hasAuthToken,
  removeAuthToken,
  setAuthToken,
} from "./authToken";

describe("authToken", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when token is not stored", () => {
    expect(getAuthToken()).toBeNull();
  });

  it("stores and returns auth token", () => {
    setAuthToken("test-token");

    expect(getAuthToken()).toBe("test-token");
  });

  it("removes stored auth token", () => {
    setAuthToken("test-token");

    removeAuthToken();

    expect(getAuthToken()).toBeNull();
  });

  it("returns true when auth token exists", () => {
    setAuthToken("test-token");

    expect(hasAuthToken()).toBe(true);
  });

  it("returns false when auth token does not exist", () => {
    expect(hasAuthToken()).toBe(false);
  });
});
