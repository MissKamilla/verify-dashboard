import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";

import { getGalleryPageState } from "@/features/gallery/getGalleryPageState";
import {
  galleryQueryKeys,
  useGalleryQuery,
} from "@/features/gallery/galleryQueries";
import type { Gallery } from "@/features/gallery/types";

import { useGalleryRouteGallery } from "./useGalleryRouteGallery";

vi.mock("react-router", () => ({
  useParams: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(),
}));

vi.mock("@/features/gallery/galleryQueries", () => ({
  galleryQueryKeys: {
    detail: (id: number) => ["gallery", "detail", id],
  },
  useGalleryQuery: vi.fn(),
}));

vi.mock("@/features/gallery/getGalleryPageState", () => ({
  getGalleryPageState: vi.fn(),
}));

const useParamsMock = vi.mocked(useParams);
const useQueryClientMock = vi.mocked(useQueryClient);
const useGalleryQueryMock = vi.mocked(useGalleryQuery);
const getGalleryPageStateMock = vi.mocked(getGalleryPageState);

const invalidateQueriesMock = vi.fn();

const mountedHookCleanups: Array<() => void> = [];

const gallery: Gallery = {
  id: 7,
  title: "Vacation photos",
  description: "Summer trip",
  userId: 3,
  createdAt: "2026-06-01T10:00:00.000Z",
};

const renderUseGalleryRouteGallery = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as ReturnType<typeof useGalleryRouteGallery>,
  };

  const HookComponent = () => {
    result.current = useGalleryRouteGallery();

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

  return {
    result,
  };
};

describe("useGalleryRouteGallery", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    invalidateQueriesMock.mockReset();

    useParamsMock.mockReturnValue({
      galleryId: "7",
    });

    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    } as unknown as ReturnType<typeof useQueryClient>);

    useGalleryQueryMock.mockReturnValue({
      data: gallery,
      error: null,
      isPending: false,
      isError: false,
      isFetching: false,
    } as unknown as ReturnType<typeof useGalleryQuery>);

    getGalleryPageStateMock.mockReturnValue(null);
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.clearAllMocks();
  });

  it("loads gallery using valid route id", () => {
    const { result } = renderUseGalleryRouteGallery();

    expect(result.current.numericGalleryId).toBe(7);
    expect(result.current.isValidGalleryId).toBe(true);
    expect(result.current.gallery).toEqual(gallery);
    expect(result.current.galleryPageState).toBeNull();

    expect(useGalleryQueryMock).toHaveBeenCalledWith(7, true);
  });

  it("disables gallery query for invalid route id", () => {
    useParamsMock.mockReturnValue({
      galleryId: "invalid-id",
    });

    const { result } = renderUseGalleryRouteGallery();

    expect(result.current.numericGalleryId).toBeNaN();
    expect(result.current.isValidGalleryId).toBe(false);

    expect(useGalleryQueryMock).toHaveBeenCalledWith(Number.NaN, false);

    expect(getGalleryPageStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isValidGalleryId: false,
      }),
    );
  });

  it("passes query state to page-state helper", () => {
    const error = new Error("Failed to load gallery");

    useGalleryQueryMock.mockReturnValue({
      data: undefined,
      error,
      isPending: false,
      isError: true,
      isFetching: true,
    } as unknown as ReturnType<typeof useGalleryQuery>);

    getGalleryPageStateMock.mockReturnValue("gallery-page-state");

    const { result } = renderUseGalleryRouteGallery();

    expect(result.current.galleryPageState).toBe("gallery-page-state");

    expect(getGalleryPageStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isValidGalleryId: true,
        isPending: false,
        isError: true,
        error,
        isFetching: true,
      }),
    );
  });

  it("invalidates current gallery query on retry", () => {
    renderUseGalleryRouteGallery();

    const [{ onRetry }] = getGalleryPageStateMock.mock.calls[0] as [
      {
        onRetry: () => void;
      },
    ];

    onRetry();

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.detail(gallery.id),
    });
  });
});
