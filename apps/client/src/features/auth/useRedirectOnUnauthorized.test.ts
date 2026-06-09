import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { removeAuthToken } from "@/features/auth/authToken";
import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";

import { useRedirectOnUnauthorized } from "./useRedirectOnUnauthorized";

const { navigateMock, clearQueryClientMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  clearQueryClientMock: vi.fn(),
}));

vi.mock("react-router", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    clear: clearQueryClientMock,
  }),
}));

vi.mock("@/features/auth/authToken", () => ({
  removeAuthToken: vi.fn(),
}));

vi.mock("@/shared/api/isUnauthorizedError", () => ({
  isUnauthorizedError: vi.fn(),
}));

const removeAuthTokenMock = vi.mocked(removeAuthToken);
const isUnauthorizedErrorMock = vi.mocked(isUnauthorizedError);

const mountedHookCleanups: Array<() => void> = [];

const renderUseRedirectOnUnauthorized = ({
  isError,
  error,
}: {
  isError: boolean;
  error: unknown;
}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const HookComponent = () => {
    useRedirectOnUnauthorized({
      isError,
      error,
    });

    return null;
  };

  act(() => {
    root.render(createElement(HookComponent));
  });

  const unmount = () => {
    act(() => {
      root.unmount();
    });

    container.remove();
  };

  mountedHookCleanups.push(unmount);
};

describe("useRedirectOnUnauthorized", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("does nothing when request did not fail", () => {
    renderUseRedirectOnUnauthorized({
      isError: false,
      error: null,
    });

    expect(isUnauthorizedErrorMock).not.toHaveBeenCalled();
    expect(removeAuthTokenMock).not.toHaveBeenCalled();
    expect(clearQueryClientMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("does nothing for non-unauthorized error", () => {
    const error = new Error("Server error");

    isUnauthorizedErrorMock.mockReturnValue(false);

    renderUseRedirectOnUnauthorized({
      isError: true,
      error,
    });

    expect(isUnauthorizedErrorMock).toHaveBeenCalledWith(error);
    expect(removeAuthTokenMock).not.toHaveBeenCalled();
    expect(clearQueryClientMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("removes token, clears query cache and redirects for unauthorized error", () => {
    const error = new Error("Unauthorized");

    isUnauthorizedErrorMock.mockReturnValue(true);

    renderUseRedirectOnUnauthorized({
      isError: true,
      error,
    });

    expect(isUnauthorizedErrorMock).toHaveBeenCalledWith(error);
    expect(removeAuthTokenMock).toHaveBeenCalledOnce();
    expect(clearQueryClientMock).toHaveBeenCalledOnce();

    expect(navigateMock).toHaveBeenCalledWith("/login", {
      replace: true,
    });
  });
});
