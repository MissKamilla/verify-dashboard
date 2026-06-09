import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUploadGalleryImagesMutation } from "@/features/image/imageQueries";
import type { SelectedUploadImage } from "./useImageUploadSelection";

import { useUploadSelectedImagesToGallery } from "./useUploadSelectedImagesToGallery";

vi.mock("@/features/image/imageQueries", () => ({
  useUploadGalleryImagesMutation: vi.fn(),
}));

const useUploadGalleryImagesMutationMock = vi.mocked(
  useUploadGalleryImagesMutation,
);

const mutateAsyncMock = vi.fn();
const mountedHookCleanups: Array<() => void> = [];

const createSelectedImage = (
  index: number,
  metafields = {
    name: ` Photo ${index} `,
    comment: ` Comment ${index} `,
  },
): SelectedUploadImage => ({
  id: `image-${index}`,
  file: new File([`image-${index}`], `image-${index}.jpg`, {
    type: "image/jpeg",
  }),
  previewUrl: `blob:image-${index}.jpg`,
  metafields,
});

const renderUseUploadSelectedImagesToGallery = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as ReturnType<
      typeof useUploadSelectedImagesToGallery
    >,
  };

  const HookComponent = () => {
    result.current = useUploadSelectedImagesToGallery();

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

describe("useUploadSelectedImagesToGallery", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();

    mutateAsyncMock.mockResolvedValue([]);

    useUploadGalleryImagesMutationMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as unknown as ReturnType<typeof useUploadGalleryImagesMutation>);
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("does not upload when no images are selected", async () => {
    const onUploadProgressChange = vi.fn();
    const { result } = renderUseUploadSelectedImagesToGallery();

    let uploadResult = true;

    await act(async () => {
      uploadResult = await result.current.uploadSelectedImagesToGallery({
        galleryId: 7,
        selectedImages: [],
        onUploadProgressChange,
      });
    });

    expect(uploadResult).toBe(false);
    expect(mutateAsyncMock).not.toHaveBeenCalled();
    expect(onUploadProgressChange).not.toHaveBeenCalled();
  });

  it("uploads selected images in chunks with trimmed metafields", async () => {
    const selectedImages = Array.from({ length: 6 }, (_, index) =>
      createSelectedImage(index + 1),
    );

    const onUploadProgressChange = vi.fn();
    const { result } = renderUseUploadSelectedImagesToGallery();

    await act(async () => {
      await result.current.uploadSelectedImagesToGallery({
        galleryId: 7,
        selectedImages,
        onUploadProgressChange,
      });
    });

    expect(mutateAsyncMock).toHaveBeenCalledTimes(2);

    expect(mutateAsyncMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        galleryId: 7,
        files: selectedImages.slice(0, 5).map((image) => image.file),
        metafields: [
          { name: "Photo 1", comment: "Comment 1" },
          { name: "Photo 2", comment: "Comment 2" },
          { name: "Photo 3", comment: "Comment 3" },
          { name: "Photo 4", comment: "Comment 4" },
          { name: "Photo 5", comment: "Comment 5" },
        ],
      }),
    );

    expect(mutateAsyncMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        galleryId: 7,
        files: [selectedImages[5].file],
        metafields: [{ name: "Photo 6", comment: "Comment 6" }],
      }),
    );

    expect(onUploadProgressChange).toHaveBeenLastCalledWith({
      loadedBytes: expect.any(Number),
      totalBytes: expect.any(Number),
      percent: 100,
    });
  });

  it("aggregates progress from uploaded chunks", async () => {
    const selectedImages = [
      createSelectedImage(1),
      createSelectedImage(2),
      createSelectedImage(3),
    ];

    mutateAsyncMock.mockImplementation(async ({ onUploadProgress }) => {
      onUploadProgress({
        loadedBytes: 5,
        totalBytes: 10,
        percent: 50,
      });
    });

    const onUploadProgressChange = vi.fn();
    const { result } = renderUseUploadSelectedImagesToGallery();

    await act(async () => {
      await result.current.uploadSelectedImagesToGallery({
        galleryId: 7,
        selectedImages,
        onUploadProgressChange,
      });
    });

    expect(onUploadProgressChange).toHaveBeenCalledWith(
      expect.objectContaining({
        percent: 0,
      }),
    );

    expect(onUploadProgressChange).toHaveBeenCalledWith(
      expect.objectContaining({
        percent: 52,
      }),
    );

    expect(onUploadProgressChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        percent: 100,
      }),
    );
  });

  it("exposes uploading state while chunk upload is pending", async () => {
    let resolveUpload: () => void = () => undefined;

    mutateAsyncMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveUpload = resolve;
      }),
    );

    const { result } = renderUseUploadSelectedImagesToGallery();

    let uploadPromise: Promise<boolean>;

    await act(async () => {
      uploadPromise = result.current.uploadSelectedImagesToGallery({
        galleryId: 7,
        selectedImages: [createSelectedImage(1)],
        onUploadProgressChange: vi.fn(),
      });
    });

    expect(result.current.isUploading).toBe(true);

    await act(async () => {
      resolveUpload();
      await uploadPromise;
    });

    expect(result.current.isUploading).toBe(false);
  });
});
