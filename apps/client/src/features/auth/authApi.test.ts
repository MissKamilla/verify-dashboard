import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpClient } from "@/shared/api/httpClient";

import { loginUser, registerUser } from "./authApi";

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

    const authResponse = {
      token: "register-token",
    };

    vi.mocked(httpClient.post).mockResolvedValue({
      data: authResponse,
    });

    const result = await registerUser(payload);

    expect(httpClient.post).toHaveBeenCalledWith("/auth/register", payload);

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
