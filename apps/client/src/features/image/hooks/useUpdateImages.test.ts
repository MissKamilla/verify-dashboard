import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateImageMetafieldsMutation } from "@/features/image/imageQueries";
import type { GalleryImage } from "@/features/image/types";
import { validateImageMetafields } from "@/features/image/validateImageMetafields";

import { useUpdateImages } from "./useUpdateImages";

vi.mock("@/features/image/imageQueries", () => ({
  useUpdateImageMetafieldsMutation: vi.fn(),
}));

vi.mock("@/features/image/validateImageMetafields", () => ({
  validateImageMetafields: vi.fn(),
}));

const mutateMock = vi.fn();

const useUpdateImageMetafieldsMutationMock = vi.mocked(
  useUpdateImageMetafieldsMutation,
);

const validateImageMetafieldsMock = vi.mocked(validateImageMetafields);

const mountedHookCleanups: Array<() => void> = [];

const image: GalleryImage = {
  id: 11,
  path: "/uploads/photo.jpg",
  galleryId: 7,
  originalFilename: "photo.jpg",
  metafields: {
    name: " Photo name ",
    comment: " Photo comment ",
  },
  createdAt: "2026-06-01T10:00:00.000Z",
};

const renderUseUpdateImages = (onUpdateSuccess?: () => void) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as ReturnType<typeof useUpdateImages>,
  };

  const HookComponent = () => {
    result.current = useUpdateImages({
      galleryId: 7,
      onUpdateSuccess,
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

describe("useUpdateImages", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    mutateMock.mockReset();

    validateImageMetafieldsMock.mockReset();
    validateImageMetafieldsMock.mockReturnValue("");

    useUpdateImageMetafieldsMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateImageMetafieldsMutation>);
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.clearAllMocks();
  });

  it("opens image edit modal", () => {
    const { result } = renderUseUpdateImages();

    act(() => {
      result.current.openEditImageModal(image);
    });

    expect(useUpdateImageMetafieldsMutationMock).toHaveBeenCalledWith(7);
    expect(result.current.imageToEdit).toEqual(image);
    expect(result.current.editImageError).toBe("");
  });

  it("does not save details when image is not selected", () => {
    const { result } = renderUseUpdateImages();

    act(() => {
      result.current.saveImageDetails({
        name: "Updated name",
        comment: "Updated comment",
      });
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("shows validation error without calling mutation", () => {
    const validationError = "Photo name is too long.";

    validateImageMetafieldsMock.mockReturnValue(validationError);

    const { result } = renderUseUpdateImages();

    act(() => {
      result.current.openEditImageModal(image);
    });

    act(() => {
      result.current.saveImageDetails({
        name: "Invalid name",
        comment: "Comment",
      });
    });

    expect(validateImageMetafieldsMock).toHaveBeenCalledWith([
      {
        name: "Invalid name",
        comment: "Comment",
      },
    ]);

    expect(result.current.editImageError).toBe(validationError);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("closes modal without mutation when trimmed metafields did not change", () => {
    const { result } = renderUseUpdateImages();

    act(() => {
      result.current.openEditImageModal(image);
    });

    act(() => {
      result.current.saveImageDetails({
        name: "Photo name",
        comment: "Photo comment",
      });
    });

    expect(result.current.imageToEdit).toBeNull();
    expect(result.current.editImageError).toBe("");
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("updates image metafields and calls success callback", () => {
    const onUpdateSuccess = vi.fn();

    const { result } = renderUseUpdateImages(onUpdateSuccess);

    act(() => {
      result.current.openEditImageModal(image);
    });

    const metafields = {
      name: "Updated name",
      comment: "Updated comment",
    };

    act(() => {
      result.current.saveImageDetails(metafields);
    });

    expect(mutateMock).toHaveBeenCalledOnce();

    const [payload, mutationOptions] = mutateMock.mock.calls[0] as [
      {
        imageId: number;
        metafields: typeof metafields;
      },
      {
        onSuccess: () => void;
      },
    ];

    expect(payload).toEqual({
      imageId: image.id,
      metafields,
    });

    act(() => {
      mutationOptions.onSuccess();
    });

    expect(result.current.imageToEdit).toBeNull();
    expect(onUpdateSuccess).toHaveBeenCalledOnce();
  });

  it("shows fallback error when update fails", () => {
    const { result } = renderUseUpdateImages();

    act(() => {
      result.current.openEditImageModal(image);
    });

    act(() => {
      result.current.saveImageDetails({
        name: "Updated name",
        comment: "Updated comment",
      });
    });

    const [, mutationOptions] = mutateMock.mock.calls[0] as [
      unknown,
      {
        onError: (error: unknown) => void;
      },
    ];

    act(() => {
      mutationOptions.onError(new Error("Network error"));
    });

    expect(result.current.editImageError).toBe("Something went wrong");
    expect(result.current.imageToEdit).toEqual(image);
  });

  it("does not close modal while update is pending", () => {
    useUpdateImageMetafieldsMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateImageMetafieldsMutation>);

    const { result } = renderUseUpdateImages();

    act(() => {
      result.current.openEditImageModal(image);
    });

    act(() => {
      result.current.closeEditImageModal();
    });

    expect(result.current.imageToEdit).toEqual(image);
    expect(result.current.isSaving).toBe(true);
  });
});
