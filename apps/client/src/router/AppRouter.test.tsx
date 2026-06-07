import { createElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Outlet } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { hasAuthToken } from "@/features/auth/authToken";

import { AppRouter } from "./AppRouter";

vi.mock("@/features/auth/authToken", () => ({
  hasAuthToken: vi.fn(),
}));

vi.mock("@/components/AuthenticatedLayout", () => ({
  AuthenticatedLayout: () =>
    createElement(
      "div",
      null,
      createElement("div", null, "Authenticated layout"),
      createElement(Outlet),
    ),
}));

vi.mock("@/pages/CreateGalleryPage", () => ({
  CreateGalleryPage: () => createElement("div", null, "Create gallery page"),
}));

vi.mock("@/pages/EditGalleryPage", () => ({
  EditGalleryPage: () => createElement("div", null, "Edit gallery page"),
}));

vi.mock("@/pages/GalleriesPage", () => ({
  GalleriesPage: () => createElement("div", null, "Galleries page"),
}));

vi.mock("@/pages/GalleryDetailsPage", () => ({
  GalleryDetailsPage: () => createElement("div", null, "Gallery details page"),
}));

vi.mock("@/pages/LoginPage", () => ({
  LoginPage: () => createElement("div", null, "Login page"),
}));

vi.mock("@/pages/NotFoundPage", () => ({
  NotFoundPage: () => createElement("div", null, "Not found page"),
}));

vi.mock("@/pages/ProfilePage", () => ({
  ProfilePage: () => createElement("div", null, "Profile page"),
}));

vi.mock("@/pages/RegisterPage", () => ({
  RegisterPage: () => createElement("div", null, "Register page"),
}));

vi.mock("@/pages/UploadPhotosPage", () => ({
  UploadPhotosPage: () => createElement("div", null, "Upload photos page"),
}));

const hasAuthTokenMock = vi.mocked(hasAuthToken);
const mountedCleanups: Array<() => void> = [];

const renderAppRouter = (initialPath: string, isAuthenticated: boolean) => {
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
        createElement(AppRouter),
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

describe("AppRouter", () => {
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

  it("redirects root route to login for guest", () => {
    const { container } = renderAppRouter("/", false);

    expect(container.textContent).toContain("Login page");
  });

  it("renders register page for guest", () => {
    const { container } = renderAppRouter("/register", false);

    expect(container.textContent).toContain("Register page");
  });

  it("redirects authenticated user from login to galleries", () => {
    const { container } = renderAppRouter("/login", true);

    expect(container.textContent).toContain("Galleries page");
  });

  it.each([
    ["/galleries", "Galleries page"],
    ["/galleries/list", "Galleries page"],
    ["/galleries/create", "Create gallery page"],
    ["/galleries/10/edit", "Edit gallery page"],
    ["/galleries/10/upload-photos", "Upload photos page"],
    ["/galleries/10", "Gallery details page"],
    ["/profile", "Profile page"],
  ])("renders protected route %s", (path, expectedText) => {
    const { container } = renderAppRouter(path, true);

    expect(container.textContent).toContain("Authenticated layout");
    expect(container.textContent).toContain(expectedText);
  });

  it("redirects guest from protected route to login", () => {
    const { container } = renderAppRouter("/galleries", false);

    expect(container.textContent).toContain("Login page");
  });

  it("renders not found page for unknown route", () => {
    const { container } = renderAppRouter("/unknown", false);

    expect(container.textContent).toContain("Not found page");
  });
});
