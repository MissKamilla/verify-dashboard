import { describe, expect, it } from "vitest";

import {
  validateAccountSettingsForm,
  validateChangePasswordForm,
} from "./validateProfileForms";

describe("validateAccountSettingsForm", () => {
  it("returns no errors for valid account settings", () => {
    expect(
      validateAccountSettingsForm({
        firstname: "Anna",
        lastname: "Smith",
      }),
    ).toEqual({});
  });

  it("returns errors for invalid account settings", () => {
    expect(
      validateAccountSettingsForm({
        firstname: "A",
        lastname: "Smith2",
      }),
    ).toEqual({
      firstname: "First name must be 2-50 characters",
      lastname: "Last name cannot contain numbers",
    });
  });
});

describe("validateChangePasswordForm", () => {
  it("returns no errors for valid password values", () => {
    expect(
      validateChangePasswordForm({
        oldPassword: "OldPassword1",
        newPassword: "NewPassword1",
        confirmNewPassword: "NewPassword1",
      }),
    ).toEqual({});
  });

  it("returns errors for invalid password values", () => {
    expect(
      validateChangePasswordForm({
        oldPassword: "",
        newPassword: "short",
        confirmNewPassword: "different",
      }),
    ).toEqual({
      oldPassword: "Password is required",
      newPassword: "Password must be at least 8 characters",
      confirmNewPassword: "Passwords must match",
    });
  });
});
