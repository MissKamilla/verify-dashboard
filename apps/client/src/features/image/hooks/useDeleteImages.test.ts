import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDeleteImagesMutation } from "@/features/image/imageQueries";
import type { GalleryImage } from "@/features/image/types";

import { useDeleteImages } from "./useDeleteImages";

vi.mock("@/features/image/imageQueries", () => ({
  useDeleteImagesMutation: vi.fn(),
}));

const mutateMock = vi.fn();
const useDeleteImagesMutationMock = vi.mocked(useDeleteImagesMutation);

const mountedHookCleanups: Array<() => void> = [];

const firstImage: GalleryImage = {
  id: 11,
  path: "/uploads/first.jpg",
  galleryId: 7,
  originalFilename: "first.jpg",
  metafields: {
    name: "First image",
    comment: "First comment",
  },
  createdAt: "2026-06-01T10:00:00.000Z",
};

const secondImage: GalleryImage = {
  id: 12,
  path: "/uploads/second.jpg",
  galleryId: 7,
  originalFilename: "second.jpg",
  metafields: {
    name: "Second image",
    comment: "",
  },
  createdAt: "2026-06-01T11:00:00.000Z",
};

const renderUseDeleteImages = (
  onDeleteSuccess?: (imageIds: number[]) => void,
) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as ReturnType<typeof useDeleteImages>,
  };

  const HookComponent = () => {
    result.current = useDeleteImages({
      galleryId: 7,
      onDeleteSuccess,
    });

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

  return {
    result,
  };
};

describe("useDeleteImages", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    mutateMock.mockReset();

    useDeleteImagesMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteImagesMutation>);
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.clearAllMocks();
  });

  it("opens delete modal for one image", () => {
    const { result } = renderUseDeleteImages();

    act(() => {
      result.current.openDeleteImageModal(firstImage);
    });

    expect(result.current.imageIdsToDelete).toEqual([firstImage.id]);
    expect(result.current.isDeleteImagesModalOpen).toBe(true);
  });

  it("opens delete modal for several images", () => {
    const { result } = renderUseDeleteImages();

    act(() => {
      result.current.openDeleteAllImagesModal([firstImage.id, secondImage.id]);
    });

    expect(result.current.imageIdsToDelete).toEqual([
      firstImage.id,
      secondImage.id,
    ]);

    expect(result.current.isDeleteImagesModalOpen).toBe(true);
  });

  it("does not open modal for empty image ids array", () => {
    const { result } = renderUseDeleteImages();

    act(() => {
      result.current.openDeleteAllImagesModal([]);
    });

    expect(result.current.imageIdsToDelete).toEqual([]);
    expect(result.current.isDeleteImagesModalOpen).toBe(false);
  });

  it("closes modal when deletion is not pending", () => {
    const { result } = renderUseDeleteImages();

    act(() => {
      result.current.openDeleteImageModal(firstImage);
    });

    act(() => {
      result.current.closeDeleteImagesModal();
    });

    expect(result.current.imageIdsToDelete).toEqual([]);
    expect(result.current.isDeleteImagesModalOpen).toBe(false);
    expect(result.current.deleteError).toBe("");
  });

  it("does not close modal while deletion is pending", () => {
    useDeleteImagesMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: true,
    } as unknown as ReturnType<typeof useDeleteImagesMutation>);

    const { result } = renderUseDeleteImages();

    act(() => {
      result.current.openDeleteImageModal(firstImage);
    });

    act(() => {
      result.current.closeDeleteImagesModal();
    });

    expect(result.current.imageIdsToDelete).toEqual([firstImage.id]);
    expect(result.current.isDeleting).toBe(true);
  });

  it("does not call mutation when no images are selected", () => {
    const { result } = renderUseDeleteImages();

    act(() => {
      result.current.confirmDeleteImages();
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("deletes selected images and calls success callback", () => {
    const onDeleteSuccess = vi.fn();
    const { result } = renderUseDeleteImages(onDeleteSuccess);

    act(() => {
      result.current.openDeleteAllImagesModal([firstImage.id, secondImage.id]);
    });

    act(() => {
      result.current.confirmDeleteImages();
    });

    expect(mutateMock).toHaveBeenCalledOnce();

    const [payload, mutationOptions] = mutateMock.mock.calls[0] as [
      {
        imageIds: number[];
      },
      {
        onSuccess: () => void;
      },
    ];

    expect(payload).toEqual({
      imageIds: [firstImage.id, secondImage.id],
    });

    act(() => {
      mutationOptions.onSuccess();
    });

    expect(result.current.imageIdsToDelete).toEqual([]);
    expect(result.current.isDeleteImagesModalOpen).toBe(false);

    expect(onDeleteSuccess).toHaveBeenCalledWith([
      firstImage.id,
      secondImage.id,
    ]);
  });

  it("shows fallback error when deletion fails", () => {
    const { result } = renderUseDeleteImages();

    act(() => {
      result.current.openDeleteImageModal(firstImage);
    });

    act(() => {
      result.current.confirmDeleteImages();
    });

    const [, mutationOptions] = mutateMock.mock.calls[0] as [
      {
        imageIds: number[];
      },
      {
        onError: (error: unknown) => void;
      },
    ];

    act(() => {
      mutationOptions.onError(new Error("Network error"));
    });

    expect(result.current.deleteError).toBe("Something went wrong");
    expect(result.current.imageIdsToDelete).toEqual([firstImage.id]);
  });
});
