import { beforeEach, describe, expect, it, vi } from "vitest";

const { axiosInstanceMock, requestUseMock } = vi.hoisted(() => {
  const requestUseMock = vi.fn();

  return {
    requestUseMock,
    axiosInstanceMock: {
      interceptors: {
        request: {
          use: requestUseMock,
        },
      },
    },
  };
});

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => axiosInstanceMock),
  },
}));

vi.mock("@/features/auth/authToken", () => ({
  getAuthToken: vi.fn(),
}));

import axios from "axios";

import { getAuthToken } from "@/features/auth/authToken";

import "./httpClient";

type RequestConfig = {
  headers: Record<string, string>;
};

type RequestInterceptor = (config: RequestConfig) => RequestConfig;

describe("httpClient", () => {
  const requestInterceptor = requestUseMock.mock
    .calls[0][0] as RequestInterceptor;

  beforeEach(() => {
    vi.mocked(getAuthToken).mockReset();
  });

  it("creates Axios client with API base URL", () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
    });
  });

  it("adds authorization header when token exists", () => {
    vi.mocked(getAuthToken).mockReturnValue("test-token");

    const config = {
      headers: {},
    };

    const result = requestInterceptor(config);

    expect(config.headers).toEqual({
      Authorization: "Bearer test-token",
    });

    expect(result).toBe(config);
  });

  it("does not add authorization header when token does not exist", () => {
    vi.mocked(getAuthToken).mockReturnValue(null);

    const config = {
      headers: {},
    };

    const result = requestInterceptor(config);

    expect(config.headers).toEqual({});

    expect(result).toBe(config);
  });
});
