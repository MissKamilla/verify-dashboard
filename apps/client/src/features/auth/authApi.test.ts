import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpClient } from "@/shared/api/httpClient";

import {
  loginUser,
  registerUser,
  resendVerification,
  verifyEmail,
} from "./authApi";

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: {
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
