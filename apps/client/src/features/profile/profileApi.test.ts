import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpClient } from "@/shared/api/httpClient";

import { getProfile, updateProfile } from "./profileApi";

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("profileApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets profile and returns response data", async () => {
    const profile = {
      id: 1,
      firstname: "Anna",
      lastname: "Smith",
      email: "anna@test.com",
    };

    vi.mocked(httpClient.get).mockResolvedValue({
      data: profile,
    });

    const result = await getProfile();

    expect(httpClient.get).toHaveBeenCalledWith("/users/profile");

    expect(result).toEqual(profile);
  });

  it("updates profile and returns response data", async () => {
    const payload = {
      firstname: "Kate",
      lastname: "Brown",
      email: "kate@test.com",
    };

    const updatedProfile = {
      id: 1,
      ...payload,
    };

    vi.mocked(httpClient.patch).mockResolvedValue({
      data: updatedProfile,
    });

    const result = await updateProfile(payload);

    expect(httpClient.patch).toHaveBeenCalledWith("/users/profile", payload);

    expect(result).toEqual(updatedProfile);
  });
});
