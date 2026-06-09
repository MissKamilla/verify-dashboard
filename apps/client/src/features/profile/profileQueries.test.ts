import { describe, expect, it, vi } from "vitest";

const { useQueryMock, getProfileMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getProfileMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("./profileApi", () => ({
  getProfile: getProfileMock,
}));

import { profileQueryKey, useProfileQuery } from "./profileQueries";

describe("profileQueries", () => {
  it("configures profile query", async () => {
    const profile = {
      id: 1,
      firstname: "Anna",
      lastname: "Smith",
      email: "anna@test.com",
      createdAt: "2026-06-08T10:00:00.000Z",
    };

    getProfileMock.mockResolvedValue(profile);

    useProfileQuery();

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly string[];
      queryFn: () => Promise<typeof profile>;
      retry: boolean;
    };

    expect(options.queryKey).toEqual(profileQueryKey);

    expect(options.retry).toBe(false);

    await expect(options.queryFn()).resolves.toEqual(profile);

    expect(getProfileMock).toHaveBeenCalledOnce();
  });
});
