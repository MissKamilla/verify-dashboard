import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { GalleryAccessListItem } from "@/features/gallery/types";
import { useGalleryAccessesQuery } from "@/features/gallery/galleryQueries";

import { GalleryAccessList } from "./GalleryAccessList";

vi.mock("@/features/gallery/galleryQueries", () => ({
  useGalleryAccessesQuery: vi.fn(),
}));

vi.mock("./GalleryAccessRow", () => ({
  GalleryAccessRow: ({ access }: { access: GalleryAccessListItem }) => (
    <p>{access.user.email}</p>
  ),
}));

const useGalleryAccessesQueryMock = vi.mocked(useGalleryAccessesQuery);
const refetchMock = vi.fn();
const mountedCleanups: Array<() => void> = [];

const access: GalleryAccessListItem = {
  id: 1,
  galleryId: 7,
  userId: 3,
  role: "viewer",
  createdAt: "2026-08-04T10:00:00.000Z",
  user: {
    id: 3,
    firstname: "Jane",
    lastname: "Doe",
    email: "jane@example.com",
    createdAt: "2026-08-04T10:00:00.000Z",
  },
};

const defaultQueryResult = {
  data: [access],
  isPending: false,
  isError: false,
  isFetching: false,
  refetch: refetchMock,
} as unknown as ReturnType<typeof useGalleryAccessesQuery>;

const renderGalleryAccessList = (
  queryResult: Partial<ReturnType<typeof useGalleryAccessesQuery>> = {},
) => {
  useGalleryAccessesQueryMock.mockReturnValue({
    ...defaultQueryResult,
    ...queryResult,
  } as ReturnType<typeof useGalleryAccessesQuery>);

  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(<GalleryAccessList galleryId={7} />);
  });

  const unmount = () => {
    act(() => {
      root.unmount();
    });

    container.remove();
  };

  mountedCleanups.push(unmount);

  return container;
};

describe("GalleryAccessList", () => {
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
  });

  it("scrolls only the people rows container on desktop", () => {
    const container = renderGalleryAccessList();

    const section = container.querySelector("section");
    const rowsContainer = container.querySelector(
      ".scrollbar-gallery-visible-desktop",
    );

    expect(section?.className).toContain("md:flex-1");
    expect(rowsContainer?.textContent).toContain("jane@example.com");
    expect(rowsContainer?.className.split(" ")).toContain("md:overflow-y-auto");
    expect(rowsContainer?.className.split(" ")).not.toContain(
      "overflow-y-auto",
    );
  });

  it("shows loading state while users are loading", () => {
    const container = renderGalleryAccessList({
      data: undefined,
      isPending: true,
    } as Partial<ReturnType<typeof useGalleryAccessesQuery>>);

    expect(container.querySelector("[role='status']")).not.toBeNull();
    expect(container.textContent).toContain("Loading users...");
    expect(container.textContent).not.toContain("jane@example.com");
  });

  it("shows retryable error state", () => {
    const container = renderGalleryAccessList({
      data: undefined,
      isPending: false,
      isError: true,
      isFetching: false,
      refetch: refetchMock,
    } as Partial<ReturnType<typeof useGalleryAccessesQuery>>);

    expect(container.querySelector("[role='alert']")).not.toBeNull();
    expect(container.textContent).toContain("Couldn’t load users");

    const retryButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Try again",
    );

    act(() => {
      retryButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(refetchMock).toHaveBeenCalledOnce();
  });

  it("disables retry button while refetching", () => {
    const container = renderGalleryAccessList({
      data: undefined,
      isPending: false,
      isError: true,
      isFetching: true,
    } as Partial<ReturnType<typeof useGalleryAccessesQuery>>);

    const retryButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Retrying...",
    ) as HTMLButtonElement | undefined;

    expect(retryButton?.disabled).toBe(true);
  });

  it("shows empty state when no users have access", () => {
    const container = renderGalleryAccessList({
      data: [],
    } as Partial<ReturnType<typeof useGalleryAccessesQuery>>);

    expect(container.textContent).toContain("No shared access");
    expect(container.textContent).toContain(
      "This gallery has not been shared with other users yet.",
    );
    expect(container.textContent).not.toContain("jane@example.com");
  });

  it("renders people with access and count", () => {
    const container = renderGalleryAccessList();

    expect(container.textContent).toContain("People with access");
    expect(container.textContent).toContain("1");
    expect(container.textContent).toContain("jane@example.com");
  });
});
