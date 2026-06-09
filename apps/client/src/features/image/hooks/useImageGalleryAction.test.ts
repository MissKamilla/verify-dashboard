import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  useCopyImagesMutation,
  useMoveImagesMutation,
} from "@/features/image/imageQueries";
import type { GalleryImage } from "@/features/image/types";

import { useImageGalleryAction } from "./useImageGalleryAction";

vi.mock("@/features/image/imageQueries", () => ({
  useCopyImagesMutation: vi.fn(),
  useMoveImagesMutation: vi.fn(),
}));

const moveMutateMock = vi.fn();
const copyMutateMock = vi.fn();

const useMoveImagesMutationMock = vi.mocked(useMoveImagesMutation);
const useCopyImagesMutationMock = vi.mocked(useCopyImagesMutation);

const mountedHookCleanups: Array<() => void> = [];

const image: GalleryImage = {
  id: 11,
  path: "/uploads/photo.jpg",
  galleryId: 7,
  originalFilename: "photo.jpg",
  metafields: {
    name: "Photo",
    comment: "Comment",
  },
  createdAt: "2026-06-01T10:00:00.000Z",
};

const renderUseImageGalleryAction = (
  onActionSuccess?: (action: "move" | "copy") => void,
) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as ReturnType<typeof useImageGalleryAction>,
  };

  const HookComponent = () => {
    result.current = useImageGalleryAction({
      galleryId: 7,
      onActionSuccess,
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

describe("useImageGalleryAction", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    moveMutateMock.mockReset();
    copyMutateMock.mockReset();

    useMoveImagesMutationMock.mockReturnValue({
      mutate: moveMutateMock,
      isPending: false,
    } as unknown as ReturnType<typeof useMoveImagesMutation>);

    useCopyImagesMutationMock.mockReturnValue({
      mutate: copyMutateMock,
      isPending: false,
    } as unknown as ReturnType<typeof useCopyImagesMutation>);
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.clearAllMocks();
  });

  it("opens move image modal", () => {
    const { result } = renderUseImageGalleryAction();

    act(() => {
      result.current.openMoveImageModal(image);
    });

    expect(result.current.activeImageGalleryAction).toBe("move");
    expect(result.current.isImageGalleryActionModalOpen).toBe(true);
    expect(result.current.selectedTargetGalleryId).toBe("");
    expect(result.current.imageGalleryActionError).toBe("");
  });

  it("opens copy image modal", () => {
    const { result } = renderUseImageGalleryAction();

    act(() => {
      result.current.openCopyImageModal(image);
    });

    expect(result.current.activeImageGalleryAction).toBe("copy");
    expect(result.current.isImageGalleryActionModalOpen).toBe(true);
  });

  it("closes modal when mutation is not pending", () => {
    const { result } = renderUseImageGalleryAction();

    act(() => {
      result.current.openMoveImageModal(image);
      result.current.setSelectedTargetGalleryId("15");
    });

    act(() => {
      result.current.closeImageGalleryActionModal();
    });

    expect(result.current.activeImageGalleryAction).toBeNull();
    expect(result.current.isImageGalleryActionModalOpen).toBe(false);
    expect(result.current.selectedTargetGalleryId).toBe("");
    expect(result.current.imageGalleryActionError).toBe("");
  });

  it("does not close modal while mutation is pending", () => {
    useMoveImagesMutationMock.mockReturnValue({
      mutate: moveMutateMock,
      isPending: true,
    } as unknown as ReturnType<typeof useMoveImagesMutation>);

    const { result } = renderUseImageGalleryAction();

    act(() => {
      result.current.openMoveImageModal(image);
    });

    act(() => {
      result.current.closeImageGalleryActionModal();
    });

    expect(result.current.activeImageGalleryAction).toBe("move");
    expect(result.current.isImageGalleryActionModalOpen).toBe(true);
    expect(result.current.isImageGalleryActionSubmitting).toBe(true);
  });

  it("does not call mutation when action or target gallery is not selected", () => {
    const { result } = renderUseImageGalleryAction();

    act(() => {
      result.current.confirmImageGalleryAction();
    });

    act(() => {
      result.current.openMoveImageModal(image);
      result.current.confirmImageGalleryAction();
    });

    expect(moveMutateMock).not.toHaveBeenCalled();
    expect(copyMutateMock).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid target gallery id", () => {
    const { result } = renderUseImageGalleryAction();

    act(() => {
      result.current.openMoveImageModal(image);
      result.current.setSelectedTargetGalleryId("invalid-id");
    });

    act(() => {
      result.current.confirmImageGalleryAction();
    });

    expect(result.current.imageGalleryActionError).toBe(
      "Please select a valid gallery.",
    );

    expect(moveMutateMock).not.toHaveBeenCalled();
  });

  it("moves image and calls success callback", () => {
    const onActionSuccess = vi.fn();
    const { result } = renderUseImageGalleryAction(onActionSuccess);

    act(() => {
      result.current.openMoveImageModal(image);
      result.current.setSelectedTargetGalleryId("15");
    });

    act(() => {
      result.current.confirmImageGalleryAction();
    });

    expect(moveMutateMock).toHaveBeenCalledOnce();
    expect(copyMutateMock).not.toHaveBeenCalled();

    const [payload, mutationOptions] = moveMutateMock.mock.calls[0] as [
      {
        imageIds: number[];
        targetGalleryId: number;
      },
      {
        onSuccess: () => void;
      },
    ];

    expect(payload).toEqual({
      imageIds: [image.id],
      targetGalleryId: 15,
    });

    act(() => {
      mutationOptions.onSuccess();
    });

    expect(result.current.activeImageGalleryAction).toBeNull();
    expect(result.current.selectedTargetGalleryId).toBe("");
    expect(onActionSuccess).toHaveBeenCalledWith("move");
  });

  it("copies image", () => {
    const { result } = renderUseImageGalleryAction();

    act(() => {
      result.current.openCopyImageModal(image);
      result.current.setSelectedTargetGalleryId("18");
    });

    act(() => {
      result.current.confirmImageGalleryAction();
    });

    expect(copyMutateMock).toHaveBeenCalledOnce();
    expect(moveMutateMock).not.toHaveBeenCalled();

    const [payload] = copyMutateMock.mock.calls[0] as [
      {
        imageIds: number[];
        targetGalleryId: number;
      },
    ];

    expect(payload).toEqual({
      imageIds: [image.id],
      targetGalleryId: 18,
    });
  });

  it("shows fallback error when mutation fails", () => {
    const { result } = renderUseImageGalleryAction();

    act(() => {
      result.current.openCopyImageModal(image);
      result.current.setSelectedTargetGalleryId("18");
    });

    act(() => {
      result.current.confirmImageGalleryAction();
    });

    const [, mutationOptions] = copyMutateMock.mock.calls[0] as [
      {
        imageIds: number[];
        targetGalleryId: number;
      },
      {
        onError: (error: unknown) => void;
      },
    ];

    act(() => {
      mutationOptions.onError(new Error("Network error"));
    });

    expect(result.current.imageGalleryActionError).toBe("Something went wrong");
  });
});
