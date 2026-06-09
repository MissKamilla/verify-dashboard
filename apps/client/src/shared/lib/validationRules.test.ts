import { describe, expect, it } from "vitest";

import {
  getConfirmPasswordError,
  getEmailError,
  getNameError,
  getRequiredPasswordError,
  getStrongPasswordError,
} from "./validationRules";

describe("getNameError", () => {
  it("returns an empty string for a valid name", () => {
    expect(getNameError("John", "First name")).toBe("");
  });

  it("returns an error when name is too long", () => {
    expect(getNameError("J".repeat(51), "First name")).toBe(
      "First name must be 2-50 characters",
    );
  });

  it("returns an error when name contains a number", () => {
    expect(getNameError("John2", "First name")).toBe(
      "First name cannot contain numbers",
    );
  });

  it("ignores spaces around name", () => {
    expect(getNameError("  John  ", "First name")).toBe("");
  });
});

describe("getEmailError", () => {
  it("returns an empty string for a valid email", () => {
    expect(getEmailError("john@example.com")).toBe("");
  });

  it("returns an error for an invalid email", () => {
    expect(getEmailError("john@example")).toBe("Email must be valid");
  });

  it("ignores spaces around email", () => {
    expect(getEmailError("  john@example.com  ")).toBe("");
  });
});

describe("getRequiredPasswordError", () => {
  it("returns an empty string when password is provided", () => {
    expect(getRequiredPasswordError("Password123")).toBe("");
  });

  it("returns an error when password is empty", () => {
    expect(getRequiredPasswordError("")).toBe("Password is required");
  });
});

describe("getConfirmPasswordError", () => {
  it("returns an empty string when passwords match", () => {
    expect(getConfirmPasswordError("Password123", "Password123")).toBe("");
  });

  it("returns an error when passwords do not match", () => {
    expect(getConfirmPasswordError("Password123", "Password456")).toBe(
      "Passwords must match",
    );
  });
});

describe("getStrongPasswordError", () => {
  it("returns an error when password is too short", () => {
    expect(getStrongPasswordError("Pass1")).toBe(
      "Password must be at least 8 characters",
    );
  });

  it("returns an error when password does not contain a lowercase letter", () => {
    expect(getStrongPasswordError("PASSWORD1")).toBe(
      "Password must contain at least one lowercase letter",
    );
  });

  it("returns an error when password does not contain an uppercase letter", () => {
    expect(getStrongPasswordError("password1")).toBe(
      "Password must contain at least one uppercase letter",
    );
  });

  it("returns an error when password does not contain a number", () => {
    expect(getStrongPasswordError("Password")).toBe(
      "Password must contain at least one number",
    );
  });

  it("returns an empty string for a valid password", () => {
    expect(getStrongPasswordError("Password1")).toBe("");
  });
});
