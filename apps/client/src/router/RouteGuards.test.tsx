import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";

import { hasAuthToken } from "@/features/auth/authToken";

import { ProtectedRoute, PublicOnlyRoute } from "./RouteGuards";

vi.mock("@/features/auth/authToken", () => ({
  hasAuthToken: vi.fn(),
}));

const hasAuthTokenMock = vi.mocked(hasAuthToken);
const mountedCleanups: Array<() => void> = [];

const renderRoutes = ({
  initialPath,
  isAuthenticated,
}: {
  initialPath: string;
  isAuthenticated: boolean;
}) => {
  hasAuthTokenMock.mockReturnValue(isAuthenticated);

  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(
        MemoryRouter,
        {
          initialEntries: [initialPath],
        },
        createElement(
          Routes,
          null,
          createElement(
            Route,
            {
              element: createElement(PublicOnlyRoute),
            },
            createElement(Route, {
              path: "/login",
              element: createElement("div", null, "Login page"),
            }),
          ),
          createElement(
            Route,
            {
              element: createElement(ProtectedRoute),
            },
            createElement(Route, {
              path: "/galleries",
              element: createElement("div", null, "Galleries page"),
            }),
          ),
        ),
      ),
    );
  });

  let isUnmounted = false;

  const unmount = () => {
    if (isUnmounted) {
      return;
    }

    isUnmounted = true;

    act(() => {
      root.unmount();
    });

    container.remove();
  };

  mountedCleanups.push(unmount);

  return {
    container,
  };
};

describe("RouteGuards", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    mountedCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.clearAllMocks();
  });

  it("renders public route when user is not authenticated", () => {
    const { container } = renderRoutes({
      initialPath: "/login",
      isAuthenticated: false,
    });

    expect(container.textContent).toContain("Login page");
  });

  it("redirects authenticated user away from public route", () => {
    const { container } = renderRoutes({
      initialPath: "/login",
      isAuthenticated: true,
    });

    expect(container.textContent).toContain("Galleries page");
  });

  it("renders protected route when user is authenticated", () => {
    const { container } = renderRoutes({
      initialPath: "/galleries",
      isAuthenticated: true,
    });

    expect(container.textContent).toContain("Galleries page");
  });

  it("redirects unauthenticated user away from protected route", () => {
    const { container } = renderRoutes({
      initialPath: "/galleries",
      isAuthenticated: false,
    });

    expect(container.textContent).toContain("Login page");
  });
});
