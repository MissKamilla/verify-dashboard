import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router";

import { getInitials } from "@/features/profile/getInitials";
import {
  profileQueryKey,
  useProfileQuery,
} from "@/features/profile/profileQueries";
import type { UserProfile } from "@/features/profile/types";
import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";

import { ProfilePage } from "./ProfilePage";

vi.mock("react-router", () => ({
  useOutletContext: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(),
}));

vi.mock("@/features/profile/profileQueries", () => ({
  profileQueryKey: ["profile"],
  useProfileQuery: vi.fn(),
}));

vi.mock("@/features/profile/getInitials", () => ({
  getInitials: vi.fn(),
}));

vi.mock("@/shared/api/isUnauthorizedError", () => ({
  isUnauthorizedError: vi.fn(),
}));

vi.mock("@/features/profile/components/ProfileHeaderCard", () => ({
  ProfileHeaderCard: ({
    fullName,
    email,
    initials,
  }: {
    fullName: string;
    email: string;
    initials: string;
  }) => (
    <p>
      Header: {fullName}, {email}, {initials}
    </p>
  ),
}));

vi.mock("@/features/profile/components/AccountSettingsForm", () => ({
  AccountSettingsForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <button type="button" onClick={onSuccess}>
      Save account settings
    </button>
  ),
}));

vi.mock("@/features/profile/components/ChangePasswordForm", () => ({
  ChangePasswordForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <button type="button" onClick={onSuccess}>
      Save password
    </button>
  ),
}));

vi.mock("@/shared/ui/CopyrightFooter", () => ({
  CopyrightFooter: () => <p>Copyright footer</p>,
}));

vi.mock("@/shared/ui/Icon", () => ({
  Icon: () => <span>Icon</span>,
}));

vi.mock("@/shared/ui/PageLoader", () => ({
  PageLoader: ({ text }: { text: string }) => <p>{text}</p>,
}));

vi.mock("@/shared/ui/PageError", () => ({
  PageError: ({
    title,
    description,
    onAction,
    isActionPending,
  }: {
    title: string;
    description: string;
    onAction: () => void;
    isActionPending: boolean;
  }) => (
    <div>
      <p>{title}</p>
      <p>{description}</p>
      <p>Retry pending: {String(isActionPending)}</p>

      <button type="button" onClick={onAction}>
        Retry
      </button>
    </div>
  ),
}));

vi.mock("@/shared/ui/SuccessModal", () => ({
  SuccessModal: ({
    isOpen,
    title,
    description,
    onClose,
  }: {
    isOpen: boolean;
    title: string;
    description: string;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div>
        <p>{title}</p>
        <p>{description}</p>

        <button type="button" onClick={onClose}>
          Close success modal
        </button>
      </div>
    ) : null,
}));

const useOutletContextMock = vi.mocked(useOutletContext);
const useQueryClientMock = vi.mocked(useQueryClient);
const useProfileQueryMock = vi.mocked(useProfileQuery);
const getInitialsMock = vi.mocked(getInitials);
const isUnauthorizedErrorMock = vi.mocked(isUnauthorizedError);

const invalidateQueriesMock = vi.fn();
const openMobileSidebarMock = vi.fn();

const profile: UserProfile = {
  id: 3,
  firstname: "John",
  lastname: "Doe",
  email: "john@example.com",
  createdAt: "2026-06-01T10:00:00.000Z",
};

const mountedPageCleanups: Array<() => void> = [];

const renderPage = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(createElement(ProfilePage));
  });

  const unmount = () => {
    act(() => {
      root.unmount();
    });

    container.remove();
  };

  mountedPageCleanups.push(unmount);

  return container;
};

describe("ProfilePage", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();

    useOutletContextMock.mockReturnValue({
      openMobileSidebar: openMobileSidebarMock,
    });

    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    } as unknown as ReturnType<typeof useQueryClient>);

    useProfileQueryMock.mockReturnValue({
      data: profile,
      error: null,
      isError: false,
      isPending: false,
      isFetching: false,
    } as unknown as ReturnType<typeof useProfileQuery>);

    getInitialsMock.mockReturnValue("JD");
    isUnauthorizedErrorMock.mockReturnValue(false);
  });

  afterEach(() => {
    mountedPageCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("renders loader while profile is pending", () => {
    useProfileQueryMock.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isPending: true,
      isFetching: true,
    } as unknown as ReturnType<typeof useProfileQuery>);

    const container = renderPage();

    expect(container.textContent).toBe("Loading profile...");
  });

  it("renders loader for unauthorized error", () => {
    const error = new Error("Unauthorized");

    isUnauthorizedErrorMock.mockReturnValue(true);

    useProfileQueryMock.mockReturnValue({
      data: undefined,
      error,
      isError: true,
      isPending: false,
      isFetching: false,
    } as unknown as ReturnType<typeof useProfileQuery>);

    const container = renderPage();

    expect(isUnauthorizedErrorMock).toHaveBeenCalledWith(error);
    expect(container.textContent).toBe("Loading profile...");
  });

  it("renders error state and retries profile request", () => {
    const error = new Error("Server error");

    useProfileQueryMock.mockReturnValue({
      data: undefined,
      error,
      isError: true,
      isPending: false,
      isFetching: true,
    } as unknown as ReturnType<typeof useProfileQuery>);

    const container = renderPage();

    expect(container.textContent).toContain("Couldn’t load profile");
    expect(container.textContent).toContain("Please try again.");
    expect(container.textContent).toContain("Retry pending: true");

    const retryButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Retry",
    );

    act(() => {
      retryButton?.click();
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: profileQueryKey,
    });
  });

  it("renders error state when profile is missing", () => {
    useProfileQueryMock.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isPending: false,
      isFetching: false,
    } as unknown as ReturnType<typeof useProfileQuery>);

    const container = renderPage();

    expect(container.textContent).toContain("Couldn’t load profile");
  });

  it("renders profile details and opens mobile sidebar", () => {
    const container = renderPage();

    expect(getInitialsMock).toHaveBeenCalledWith("John", "Doe");
    expect(container.textContent).toContain("Profile settings");

    expect(container.textContent).toContain(
      "Header: John Doe, john@example.com, JD",
    );

    const openMenuButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open menu"]',
    );

    act(() => {
      openMenuButton?.click();
    });

    expect(openMobileSidebarMock).toHaveBeenCalledOnce();
  });

  it("opens and closes success modal after form success", () => {
    const container = renderPage();

    const saveAccountButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent === "Save account settings");

    act(() => {
      saveAccountButton?.click();
    });

    expect(container.textContent).toContain("Changes saved");

    expect(container.textContent).toContain(
      "Your changes were successfully saved.",
    );

    const closeModalButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent === "Close success modal");

    act(() => {
      closeModalButton?.click();
    });

    expect(container.textContent).not.toContain("Changes saved");
  });
});
