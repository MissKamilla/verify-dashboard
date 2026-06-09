import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQueryClient } from "@tanstack/react-query";

import {
  galleryQueryKeys,
  useGalleriesQuery,
} from "@/features/gallery/galleryQueries";

import { useGalleriesPage } from "./useGalleriesPage";

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(),
}));

vi.mock("@/features/gallery/galleryQueries", () => ({
  galleryQueryKeys: {
    list: (params: unknown) => ["gallery", "list", params],
  },
  useGalleriesQuery: vi.fn(),
}));

const useQueryClientMock = vi.mocked(useQueryClient);
const useGalleriesQueryMock = vi.mocked(useGalleriesQuery);

const invalidateQueriesMock = vi.fn();

const gallery = {
  id: 7,
  title: "Vacation photos",
  description: "Summer trip",
  userId: 3,
  createdAt: "2026-06-01T10:00:00.000Z",
  photosCount: 2,
  previewImages: [],
};

const mountedHookCleanups: Array<() => void> = [];

const renderUseGalleriesPage = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as ReturnType<typeof useGalleriesPage>,
  };

  const HookComponent = () => {
    result.current = useGalleriesPage();

    return null;
  };

  act(() => {
    root.render(createElement(HookComponent));
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

  mountedHookCleanups.push(unmount);

  return { result };
};

describe("useGalleriesPage", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.useFakeTimers();
    vi.clearAllMocks();

    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    } as unknown as ReturnType<typeof useQueryClient>);

    useGalleriesQueryMock.mockReturnValue({
      data: {
        items: [gallery],
        total: 21,
        page: 1,
        limit: 10,
      },
      error: null,
      isPending: false,
      isError: false,
      isFetching: false,
    } as unknown as ReturnType<typeof useGalleriesQuery>);
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.useRealTimers();
  });

  it("returns galleries and default pagination state", () => {
    const { result } = renderUseGalleriesPage();

    expect(useGalleriesQueryMock).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "DESC",
    });

    expect(result.current.galleries).toEqual([gallery]);
    expect(result.current.totalGalleries).toBe(21);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageLimit).toBe(10);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("changes current page", () => {
    const { result } = renderUseGalleriesPage();

    act(() => {
      result.current.handlePageChange(2);
    });

    expect(result.current.currentPage).toBe(2);

    expect(useGalleriesQueryMock).toHaveBeenLastCalledWith({
      page: 2,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "DESC",
    });
  });

  it("adds trimmed search after debounce and resets page", () => {
    const { result } = renderUseGalleriesPage();

    act(() => {
      vi.advanceTimersByTime(500);
      result.current.handlePageChange(3);
    });

    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.handleSearchChange("  cats  ");
    });

    expect(result.current.searchValue).toBe("  cats  ");
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.currentPage).toBe(1);

    expect(useGalleriesQueryMock).toHaveBeenLastCalledWith({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "DESC",
      search: "cats",
    });
  });

  it("changes sorting and resets page", () => {
    const { result } = renderUseGalleriesPage();

    act(() => {
      result.current.handlePageChange(3);
      result.current.handleSortByChange("title");
      result.current.handleSortOrderChange("ASC");
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.sortBy).toBe("title");
    expect(result.current.sortOrder).toBe("ASC");
    expect(result.current.hasActiveFilters).toBe(true);

    expect(useGalleriesQueryMock).toHaveBeenLastCalledWith({
      page: 1,
      limit: 10,
      sortBy: "title",
      sortOrder: "ASC",
    });
  });

  it("clears filters and returns to first page", () => {
    const { result } = renderUseGalleriesPage();

    act(() => {
      result.current.handlePageChange(3);
      result.current.handleSearchChange("cats");
      result.current.handleSortByChange("title");
      result.current.handleSortOrderChange("ASC");
    });

    act(() => {
      result.current.handleClearFilters();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.searchValue).toBe("");
    expect(result.current.sortBy).toBe("createdAt");
    expect(result.current.sortOrder).toBe("DESC");
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("invalidates current list query on retry", () => {
    const { result } = renderUseGalleriesPage();

    act(() => {
      result.current.handlePageChange(2);
    });

    act(() => {
      result.current.handleRetry();
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.list({
        page: 2,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "DESC",
      }),
    });
  });
});
