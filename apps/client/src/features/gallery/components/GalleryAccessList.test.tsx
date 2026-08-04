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

const renderGalleryAccessList = () => {
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

    useGalleryAccessesQueryMock.mockReturnValue({
      data: [access],
      isPending: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGalleryAccessesQuery>);
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
});
