import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpClient } from "@/shared/api/httpClient";

import {
  getInvitation,
  loginUser,
  registerByInvite,
  registerUser,
  resendVerification,
  verifyEmail,
} from "./authApi";

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers user and returns response data", async () => {
    const payload = {
      firstname: "Anna",
      lastname: "Smith",
      email: "anna@test.com",
      password: "Password123",
    };

    const registerResponse = {
      message: "Verification code sent",
    };

    vi.mocked(httpClient.post).mockResolvedValue({
      data: registerResponse,
    });

    const result = await registerUser(payload);

    expect(httpClient.post).toHaveBeenCalledWith("/auth/register", payload);

    expect(result).toEqual(registerResponse);
  });

  it("verifies email and returns response data", async () => {
    const payload = {
      email: "anna@test.com",
      code: "123456",
    };

    const authResponse = {
      token: "verify-token",
    };

    vi.mocked(httpClient.post).mockResolvedValue({
      data: authResponse,
    });

    const result = await verifyEmail(payload);

    expect(httpClient.post).toHaveBeenCalledWith("/auth/verify-email", payload);

    expect(result).toEqual(authResponse);
  });

  it("resends verification and returns response data", async () => {
    const payload = {
      email: "anna@test.com",
    };

    const registerResponse = {
      message: "Verification code sent",
    };

    vi.mocked(httpClient.post).mockResolvedValue({
      data: registerResponse,
    });

    const result = await resendVerification(payload);

    expect(httpClient.post).toHaveBeenCalledWith(
      "/auth/resend-verification",
      payload,
    );

    expect(result).toEqual(registerResponse);
  });

  it("gets invitation details and returns response data", async () => {
    const invitationResponse = {
      email: "invitee@test.com",
      galleryTitle: "Shared gallery",
      role: "viewer",
    };

    vi.mocked(httpClient.get).mockResolvedValue({
      data: invitationResponse,
    });

    const result = await getInvitation("invite-token");

    expect(httpClient.get).toHaveBeenCalledWith(
      "/auth/invitations/invite-token",
    );

    expect(result).toEqual(invitationResponse);
  });

  it("registers by invitation and returns response data", async () => {
    const payload = {
      firstname: "Bob",
      lastname: "Brown",
      password: "Password123",
      token: "invite-token",
    };

    const authResponse = {
      token: "invite-auth-token",
    };

    vi.mocked(httpClient.post).mockResolvedValue({
      data: authResponse,
    });

    const result = await registerByInvite(payload);

    expect(httpClient.post).toHaveBeenCalledWith(
      "/auth/register-by-invite",
      payload,
    );

    expect(result).toEqual(authResponse);
  });

  it("logs in user and returns response data", async () => {
    const payload = {
      email: "anna@test.com",
      password: "Password123",
    };

    const authResponse = {
      token: "login-token",
    };

    vi.mocked(httpClient.post).mockResolvedValue({
      data: authResponse,
    });

    const result = await loginUser(payload);

    expect(httpClient.post).toHaveBeenCalledWith("/auth/login", payload);

    expect(result).toEqual(authResponse);
  });
});
