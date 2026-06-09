import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGalleryImagesQuery } from "@/features/image/imageQueries";
import { validateImageMetafields } from "@/features/image/validateImageMetafields";

import { useImageUploadSelection } from "./useImageUploadSelection";
import { useImageUploadSelectionWithMessages } from "./useImageUploadSelectionWithMessages";
import { useUploadImages } from "./useUploadImages";
import { useUploadSelectedImagesToGallery } from "./useUploadSelectedImagesToGallery";

vi.mock("@/features/image/imageQueries", () => ({
  useGalleryImagesQuery: vi.fn(),
}));

vi.mock("@/features/image/validateImageMetafields", () => ({
  validateImageMetafields: vi.fn(),
}));

vi.mock("./useImageUploadSelection", () => ({
  useImageUploadSelection: vi.fn(),
}));

vi.mock("./useImageUploadSelectionWithMessages", () => ({
  useImageUploadSelectionWithMessages: vi.fn(),
}));

vi.mock("./useUploadSelectedImagesToGallery", () => ({
  useUploadSelectedImagesToGallery: vi.fn(),
}));

const useGalleryImagesQueryMock = vi.mocked(useGalleryImagesQuery);
const validateImageMetafieldsMock = vi.mocked(validateImageMetafields);
const useImageUploadSelectionMock = vi.mocked(useImageUploadSelection);

const useImageUploadSelectionWithMessagesMock = vi.mocked(
  useImageUploadSelectionWithMessages,
);

const useUploadSelectedImagesToGalleryMock = vi.mocked(
  useUploadSelectedImagesToGallery,
);

const validateSelectedFilesMock = vi.fn();
const clearSelectedImagesMock = vi.fn();
const selectFilesMock = vi.fn();
const updateMetafieldMock = vi.fn();
const clearFileErrorMock = vi.fn();
const closeWarningMock = vi.fn();
const uploadSelectedImagesToGalleryMock = vi.fn();

const selectedImages = [
  {
    id: "image-id",
    file: new File(["photo"], "photo.jpg", { type: "image/jpeg" }),
    previewUrl: "blob:photo.jpg",
    metafields: {
      name: "Photo",
      comment: "Comment",
    },
  },
];

const mountedHookCleanups: Array<() => void> = [];

const renderUseUploadImages = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as ReturnType<typeof useUploadImages>,
  };

  const HookComponent = () => {
    result.current = useUploadImages({ galleryId: 7 });

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

describe("useUploadImages", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();

    validateSelectedFilesMock.mockReturnValue("");
    validateImageMetafieldsMock.mockReturnValue("");
    uploadSelectedImagesToGalleryMock.mockResolvedValue(true);

    useGalleryImagesQueryMock.mockReturnValue({
      data: {
        items: [],
        total: 4,
        page: 1,
        limit: 1,
      },
      isPending: false,
      isFetching: false,
    } as unknown as ReturnType<typeof useGalleryImagesQuery>);

    const imageSelection = {
      selectedImages,
      fileError: "",
      selectFiles: selectFilesMock,
      updateMetafield: updateMetafieldMock,
      validateSelectedFiles: validateSelectedFilesMock,
      clearSelectedImages: clearSelectedImagesMock,
      clearFileError: clearFileErrorMock,
    };

    useImageUploadSelectionMock.mockReturnValue(imageSelection);

    useImageUploadSelectionWithMessagesMock.mockReturnValue({
      ...imageSelection,
      closeWarning: closeWarningMock,
    });

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

  it("calculates available images count and exposes enabled controls", () => {
    const { result } = renderUseUploadImages();

    expect(useGalleryImagesQueryMock).toHaveBeenCalledWith(7, {
      page: 1,
      limit: 1,
    });

    expect(useImageUploadSelectionMock).toHaveBeenCalledWith({
      availableImagesCount: 46,
    });

    expect(result.current.isFilesSelectDisabled).toBe(false);
    expect(result.current.isSubmitDisabled).toBe(false);
  });

  it("disables controls while gallery images are loading", () => {
    useGalleryImagesQueryMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isFetching: false,
    } as unknown as ReturnType<typeof useGalleryImagesQuery>);

    const { result } = renderUseUploadImages();

    expect(useImageUploadSelectionMock).toHaveBeenCalledWith({
      availableImagesCount: 50,
    });

    expect(result.current.isFilesSelectDisabled).toBe(true);
    expect(result.current.isSubmitDisabled).toBe(true);
  });

  it("shows warning and does not upload when selected files are invalid", async () => {
    validateSelectedFilesMock.mockReturnValue("Invalid files");

    const { result } = renderUseUploadImages();

    await act(async () => {
      await result.current.uploadSelectedImages();
    });

    expect(result.current.warningMessage).toBe("Invalid files");
    expect(validateImageMetafieldsMock).not.toHaveBeenCalled();
    expect(uploadSelectedImagesToGalleryMock).not.toHaveBeenCalled();
  });

  it("shows warning and does not upload when metafields are invalid", async () => {
    validateImageMetafieldsMock.mockReturnValue("Invalid metafields");

    const { result } = renderUseUploadImages();

    await act(async () => {
      await result.current.uploadSelectedImages();
    });

    expect(validateImageMetafieldsMock).toHaveBeenCalledWith([
      selectedImages[0].metafields,
    ]);

    expect(result.current.warningMessage).toBe("Invalid metafields");
    expect(uploadSelectedImagesToGalleryMock).not.toHaveBeenCalled();
  });

  it("uploads images, updates progress and shows success message", async () => {
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

    const { result } = renderUseUploadImages();

    await act(async () => {
      await result.current.uploadSelectedImages();
    });

    expect(uploadSelectedImagesToGalleryMock).toHaveBeenCalledWith({
      galleryId: 7,
      selectedImages,
      onUploadProgressChange: expect.any(Function),
    });

    expect(clearSelectedImagesMock).toHaveBeenCalledOnce();

    expect(result.current.uploadProgress).toEqual({
      loadedBytes: 5,
      totalBytes: 10,
      percent: 50,
    });

    expect(result.current.successMessage).toBe(
      "Photos have been uploaded to your gallery.",
    );

    act(() => {
      result.current.closeSuccess();
    });

    expect(result.current.successMessage).toBe("");
    expect(result.current.uploadProgress).toBeNull();
  });

  it("shows fallback API error and clears upload progress when upload fails", async () => {
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

    const { result } = renderUseUploadImages();

    await act(async () => {
      await result.current.uploadSelectedImages();
    });

    expect(result.current.uploadProgress).toBeNull();
    expect(result.current.apiError).toBe("Something went wrong");

    act(() => {
      result.current.closeError();
    });

    expect(result.current.apiError).toBe("");
  });
});
