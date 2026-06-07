import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUploadSelectedImagesToGallery } from "@/features/image/hooks/useUploadSelectedImagesToGallery";
import { validateImageMetafields } from "@/features/image/validateImageMetafields";

import { useCreateGalleryMutation } from "../galleryQueries";
import { useCreateGalleryWithImages } from "./useCreateGalleryWithImages";

vi.mock("@/features/image/hooks/useUploadSelectedImagesToGallery", () => ({
  useUploadSelectedImagesToGallery: vi.fn(),
}));

vi.mock("@/features/image/validateImageMetafields", () => ({
  validateImageMetafields: vi.fn(),
}));

vi.mock("../galleryQueries", () => ({
  useCreateGalleryMutation: vi.fn(),
}));

const useUploadSelectedImagesToGalleryMock = vi.mocked(
  useUploadSelectedImagesToGallery,
);

const validateImageMetafieldsMock = vi.mocked(validateImageMetafields);
const useCreateGalleryMutationMock = vi.mocked(useCreateGalleryMutation);

const mutateAsyncMock = vi.fn();
const uploadSelectedImagesToGalleryMock = vi.fn();
const validateSelectedFilesMock = vi.fn();
const clearSelectedImagesMock = vi.fn();
const resetFormMock = vi.fn();

const selectedImages = [
  {
    id: "image-id",
    file: new File(["photo"], "photo.jpg", { type: "image/jpeg" }),
    previewUrl: "blob:photo.jpg",
    metafields: {
      name: " Photo ",
      comment: " Comment ",
    },
  },
];

const values = {
  title: " New gallery ",
  description: " Description ",
};

const mountedHookCleanups: Array<() => void> = [];

const renderUseCreateGalleryWithImages = (images = selectedImages) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as ReturnType<
      typeof useCreateGalleryWithImages
    >,
  };

  const HookComponent = () => {
    result.current = useCreateGalleryWithImages({
      selectedImages: images,
      validateSelectedFiles: validateSelectedFilesMock,
      clearSelectedImages: clearSelectedImagesMock,
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

  return { result };
};

describe("useCreateGalleryWithImages", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();

    validateSelectedFilesMock.mockReturnValue("");
    validateImageMetafieldsMock.mockReturnValue("");
    mutateAsyncMock.mockResolvedValue({ id: 7 });
    uploadSelectedImagesToGalleryMock.mockResolvedValue(true);

    useCreateGalleryMutationMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateGalleryMutation>);

    useUploadSelectedImagesToGalleryMock.mockReturnValue({
      uploadSelectedImagesToGallery: uploadSelectedImagesToGalleryMock,
      isUploading: false,
    });
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("creates gallery without images and shows success message", async () => {
    const { result } = renderUseCreateGalleryWithImages([]);

    await act(async () => {
      await result.current.submitCreateGallery({
        values,
        resetForm: resetFormMock,
      });
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      title: "New gallery",
      description: "Description",
    });

    expect(validateSelectedFilesMock).not.toHaveBeenCalled();
    expect(uploadSelectedImagesToGalleryMock).not.toHaveBeenCalled();
    expect(resetFormMock).toHaveBeenCalledOnce();
    expect(clearSelectedImagesMock).toHaveBeenCalledOnce();

    expect(result.current.successMessage).toBe(
      "Success. A new gallery has been created in the gallery list.",
    );
  });

  it("does not create gallery when selected files are invalid", async () => {
    validateSelectedFilesMock.mockReturnValue("Invalid files");

    const { result } = renderUseCreateGalleryWithImages();

    await act(async () => {
      await result.current.submitCreateGallery({
        values,
        resetForm: resetFormMock,
      });
    });

    expect(result.current.warningMessage).toBe("Invalid files");
    expect(validateImageMetafieldsMock).not.toHaveBeenCalled();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("does not create gallery when image metafields are invalid", async () => {
    validateImageMetafieldsMock.mockReturnValue("Invalid metafields");

    const { result } = renderUseCreateGalleryWithImages();

    await act(async () => {
      await result.current.submitCreateGallery({
        values,
        resetForm: resetFormMock,
      });
    });

    expect(validateImageMetafieldsMock).toHaveBeenCalledWith([
      selectedImages[0].metafields,
    ]);

    expect(result.current.warningMessage).toBe("Invalid metafields");
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("creates gallery, uploads images and reports progress", async () => {
    uploadSelectedImagesToGalleryMock.mockImplementation(
      async ({ onUploadProgressChange }) => {
        onUploadProgressChange({
          loadedBytes: 5,
          totalBytes: 10,
          percent: 50,
        });

        return true;
      },
    );

    const { result } = renderUseCreateGalleryWithImages();

    await act(async () => {
      await result.current.submitCreateGallery({
        values,
        resetForm: resetFormMock,
      });
    });

    expect(uploadSelectedImagesToGalleryMock).toHaveBeenCalledWith({
      galleryId: 7,
      selectedImages,
      onUploadProgressChange: expect.any(Function),
    });

    expect(result.current.uploadProgress).toEqual({
      loadedBytes: 5,
      totalBytes: 10,
      percent: 50,
    });

    expect(resetFormMock).toHaveBeenCalledOnce();
    expect(clearSelectedImagesMock).toHaveBeenCalledOnce();

    expect(result.current.successMessage).toBe(
      "Success. A new gallery has been created in the gallery list.",
    );
  });

  it("shows warning when gallery is created but image upload fails", async () => {
    uploadSelectedImagesToGalleryMock.mockImplementation(
      async ({ onUploadProgressChange }) => {
        onUploadProgressChange({
          loadedBytes: 5,
          totalBytes: 10,
          percent: 50,
        });

        throw new Error("Network error");
      },
    );

    const { result } = renderUseCreateGalleryWithImages();

    await act(async () => {
      await result.current.submitCreateGallery({
        values,
        resetForm: resetFormMock,
      });
    });

    expect(result.current.uploadProgress).toBeNull();
    expect(resetFormMock).toHaveBeenCalledOnce();
    expect(clearSelectedImagesMock).toHaveBeenCalledOnce();

    expect(result.current.warningMessage).toBe(
      "Gallery was created, but photos were not uploaded. Something went wrong",
    );
  });

  it("shows API error when gallery creation fails", async () => {
    mutateAsyncMock.mockRejectedValue(new Error("Network error"));

    const { result } = renderUseCreateGalleryWithImages();

    await act(async () => {
      await result.current.submitCreateGallery({
        values,
        resetForm: resetFormMock,
      });
    });

    expect(result.current.apiError).toBe("Something went wrong");
    expect(uploadSelectedImagesToGalleryMock).not.toHaveBeenCalled();

    act(() => {
      result.current.closeError();
    });

    expect(result.current.apiError).toBe("");
  });

  it("clears selected images, progress and messages", async () => {
    uploadSelectedImagesToGalleryMock.mockImplementation(
      async ({ onUploadProgressChange }) => {
        onUploadProgressChange({
          loadedBytes: 5,
          totalBytes: 10,
          percent: 50,
        });

        return true;
      },
    );

    const { result } = renderUseCreateGalleryWithImages();

    await act(async () => {
      await result.current.submitCreateGallery({
        values,
        resetForm: resetFormMock,
      });
    });

    act(() => {
      result.current.deleteSelectedImages();
    });

    expect(clearSelectedImagesMock).toHaveBeenCalledTimes(2);
    expect(result.current.uploadProgress).toBeNull();
    expect(result.current.successMessage).toBe("");
  });

  it("exposes submitting state from gallery creation and upload", () => {
    useCreateGalleryMutationMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: true,
    } as unknown as ReturnType<typeof useCreateGalleryMutation>);

    const { result } = renderUseCreateGalleryWithImages();

    expect(result.current.isSubmitting).toBe(true);
  });
});
