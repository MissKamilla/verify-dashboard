import { describe, expect, it } from "vitest";

import {
  validateForgotPasswordForm,
  validateLoginForm,
  validateRegisterForm,
  validateResetPasswordForm,
} from "./validateAuthForms";

describe("validateRegisterForm", () => {
  it("returns no errors for valid registration values", () => {
    expect(
      validateRegisterForm({
        firstname: "Anna",
        lastname: "Smith",
        email: "anna@test.com",
        password: "Password1",
        confirmPassword: "Password1",
      }),
    ).toEqual({});
  });

  it("returns errors for invalid registration values", () => {
    expect(
      validateRegisterForm({
        firstname: "A",
        lastname: "Smith2",
        email: "invalid-email",
        password: "short",
        confirmPassword: "different",
      }),
    ).toEqual({
      firstname: "First name must be 2-50 characters",
      lastname: "Last name cannot contain numbers",
      email: "Email must be valid",
      password: "Password must be at least 8 characters",
      confirmPassword: "Passwords must match",
    });
  });
});

describe("validateLoginForm", () => {
  it("returns no errors for valid login values", () => {
    expect(
      validateLoginForm({
        email: "anna@test.com",
        password: "Password1",
      }),
    ).toEqual({});
  });

  it("returns errors when email is invalid and password is missing", () => {
    expect(
      validateLoginForm({
        email: "invalid-email",
        password: "",
      }),
    ).toEqual({
      email: "Email must be valid",
      password: "Password is required",
    });
  });
});

describe("validateForgotPasswordForm", () => {
  it("returns no errors for valid email", () => {
    expect(
      validateForgotPasswordForm({
        email: "anna@test.com",
      }),
    ).toEqual({});
  });

  it("returns email error for invalid email", () => {
    expect(
      validateForgotPasswordForm({
        email: "invalid-email",
      }),
    ).toEqual({
      email: "Email must be valid",
    });
  });
});

describe("validateResetPasswordForm", () => {
  it("returns no errors for valid reset password values", () => {
    expect(
      validateResetPasswordForm({
        password: "Password1",
        confirmPassword: "Password1",
      }),
    ).toEqual({});
  });

  it("returns errors for weak and mismatched passwords", () => {
    expect(
      validateResetPasswordForm({
        password: "short",
        confirmPassword: "different",
      }),
    ).toEqual({
      password: "Password must be at least 8 characters",
      confirmPassword: "Passwords must match",
    });
  });
});
