import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOutletContext } from "react-router";

import { useGalleriesPage } from "@/features/gallery/hooks/useGalleriesPage";

import { GalleriesPage } from "./GalleriesPage";

vi.mock("react-router", () => ({
  useOutletContext: vi.fn(),
}));

vi.mock("@/features/gallery/hooks/useGalleriesPage", () => ({
  useGalleriesPage: vi.fn(),
}));

vi.mock("@/features/gallery/components/GalleryActionLink", () => ({
  GalleryActionLink: ({ to, label }: { to: string; label: string }) => (
    <p>
      {label}: {to}
    </p>
  ),
}));

vi.mock("@/features/gallery/components/GalleriesFilters", () => ({
  GalleriesFilters: ({
    searchValue,
    onClearFilters,
  }: {
    searchValue: string;
    onClearFilters: () => void;
  }) => (
    <button type="button" onClick={onClearFilters}>
      Filters: {searchValue}
    </button>
  ),
}));

vi.mock("@/features/gallery/components/GalleriesContent", () => ({
  GalleriesContent: ({
    totalGalleries,
    onPageChange,
  }: {
    totalGalleries: number;
    onPageChange: (page: number) => void;
  }) => (
    <button type="button" onClick={() => onPageChange(2)}>
      Galleries count: {totalGalleries}
    </button>
  ),
}));

vi.mock("@/shared/ui/CopyrightFooter", () => ({
  CopyrightFooter: () => <p>Copyright footer</p>,
}));

vi.mock("@/shared/ui/Icon", () => ({
  Icon: () => <span>Icon</span>,
}));

const useOutletContextMock = vi.mocked(useOutletContext);
const useGalleriesPageMock = vi.mocked(useGalleriesPage);

const openMobileSidebarMock = vi.fn();
const handleClearFiltersMock = vi.fn();
const handlePageChangeMock = vi.fn();

const mountedPageCleanups: Array<() => void> = [];

const renderPage = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(createElement(GalleriesPage));
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

describe("GalleriesPage", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();

    useOutletContextMock.mockReturnValue({
      openMobileSidebar: openMobileSidebarMock,
    });

    useGalleriesPageMock.mockReturnValue({
      galleries: [],
      totalGalleries: 12,
      totalPages: 2,
      currentPage: 1,
      pageLimit: 10,
      searchValue: "cats",
      sortBy: "createdAt",
      sortOrder: "DESC",
      hasActiveFilters: true,
      error: null,
      isPending: false,
      isError: false,
      isFetching: false,
      handleRetry: vi.fn(),
      handlePageChange: handlePageChangeMock,
      handleSearchChange: vi.fn(),
      handleSortByChange: vi.fn(),
      handleSortOrderChange: vi.fn(),
      handleClearFilters: handleClearFiltersMock,
    });
  });

  afterEach(() => {
    mountedPageCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("renders gallery list controls and forwards actions", () => {
    const container = renderPage();

    expect(container.textContent).toContain("List of galleries");
    expect(container.textContent).toContain(
      "Create a new gallery: /galleries/create",
    );
    expect(container.textContent).toContain("Filters: cats");
    expect(container.textContent).toContain("Galleries count: 12");

    const openMenuButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open menu"]',
    );

    const buttons = container.querySelectorAll<HTMLButtonElement>("button");

    expect(openMenuButton).not.toBeNull();

    act(() => {
      openMenuButton?.click();
      buttons[1].click();
      buttons[2].click();
    });

    expect(openMobileSidebarMock).toHaveBeenCalledOnce();
    expect(handleClearFiltersMock).toHaveBeenCalledOnce();
    expect(handlePageChangeMock).toHaveBeenCalledWith(2);
  });
});
