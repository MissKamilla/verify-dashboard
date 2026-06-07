import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { validateImageFiles } from "@/features/image/validateImageFiles";

import {
  useImageUploadSelection,
  type UseImageUploadSelectionResult,
} from "./useImageUploadSelection";

vi.mock("@/features/image/validateImageFiles", () => ({
  validateImageFiles: vi.fn(),
}));

const validateImageFilesMock = vi.mocked(validateImageFiles);

const createObjectURLMock = vi.fn(
  (file: Blob) => `blob:${file instanceof File ? file.name : "preview"}`,
);
const revokeObjectURLMock = vi.fn();

const mountedHookCleanups: Array<() => void> = [];

const renderUseImageUploadSelection = (availableImagesCount = 50) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as UseImageUploadSelectionResult,
  };

  const HookComponent = () => {
    result.current = useImageUploadSelection({
      availableImagesCount,
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
    unmount,
  };
};

describe("useImageUploadSelection", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    validateImageFilesMock.mockReset();
    validateImageFilesMock.mockReturnValue("");

    createObjectURLMock.mockClear();
    revokeObjectURLMock.mockClear();

    vi.stubGlobal("URL", {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    });
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("creates selected images with preview urls and empty metafields", () => {
    const files = [
      new File(["first"], "first.jpg", { type: "image/jpeg" }),
      new File(["second"], "second.png", { type: "image/png" }),
    ];

    const { result } = renderUseImageUploadSelection(4);

    let validationError = "";

    act(() => {
      validationError = result.current.selectFiles(files);
    });

    expect(validationError).toBe("");
    expect(validateImageFilesMock).toHaveBeenCalledWith(files, 4);

    expect(result.current.selectedImages).toHaveLength(2);

    expect(result.current.selectedImages[0]).toEqual(
      expect.objectContaining({
        file: files[0],
        previewUrl: "blob:first.jpg",
        metafields: {
          name: "",
          comment: "",
        },
      }),
    );

    expect(result.current.selectedImages[1]).toEqual(
      expect.objectContaining({
        file: files[1],
        previewUrl: "blob:second.png",
        metafields: {
          name: "",
          comment: "",
        },
      }),
    );

    expect(createObjectURLMock).toHaveBeenCalledTimes(2);
  });

  it("clears previous selection when new files are invalid", () => {
    const validFile = new File(["photo"], "photo.jpg", {
      type: "image/jpeg",
    });

    const invalidFile = new File(["document"], "document.pdf", {
      type: "application/pdf",
    });

    const validationError = "Only JPEG, PNG files are allowed.";

    validateImageFilesMock
      .mockReturnValueOnce("")
      .mockReturnValueOnce(validationError);

    const { result } = renderUseImageUploadSelection();

    act(() => {
      result.current.selectFiles([validFile]);
    });

    act(() => {
      result.current.selectFiles([invalidFile]);
    });

    expect(result.current.fileError).toBe(validationError);
    expect(result.current.selectedImages).toEqual([]);
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:photo.jpg");
  });

  it("updates metafield only for the selected image", () => {
    const files = [
      new File(["first"], "first.jpg", { type: "image/jpeg" }),
      new File(["second"], "second.jpg", { type: "image/jpeg" }),
    ];

    const { result } = renderUseImageUploadSelection();

    act(() => {
      result.current.selectFiles(files);
    });

    const firstImageId = result.current.selectedImages[0].id;

    act(() => {
      result.current.updateMetafield(
        firstImageId,
        "comment",
        "Updated comment",
      );
    });

    expect(result.current.selectedImages[0].metafields.comment).toBe(
      "Updated comment",
    );

    expect(result.current.selectedImages[1].metafields.comment).toBe("");
  });

  it("validates currently selected files and clears file error", () => {
    const file = new File(["photo"], "photo.jpg", {
      type: "image/jpeg",
    });

    const validationError = "Validation failed.";

    const { result } = renderUseImageUploadSelection(3);

    act(() => {
      result.current.selectFiles([file]);
    });

    validateImageFilesMock.mockReturnValue(validationError);

    let returnedError = "";

    act(() => {
      returnedError = result.current.validateSelectedFiles();
    });

    expect(returnedError).toBe(validationError);
    expect(result.current.fileError).toBe(validationError);
    expect(validateImageFilesMock).toHaveBeenLastCalledWith([file], 3);

    act(() => {
      result.current.clearFileError();
    });

    expect(result.current.fileError).toBe("");
  });

  it("clears selected images and revokes their preview urls", () => {
    const file = new File(["photo"], "photo.jpg", {
      type: "image/jpeg",
    });

    const { result } = renderUseImageUploadSelection();

    act(() => {
      result.current.selectFiles([file]);
    });

    act(() => {
      result.current.clearSelectedImages();
    });

    expect(result.current.selectedImages).toEqual([]);
    expect(result.current.fileError).toBe("");
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:photo.jpg");
  });

  it("revokes preview urls on unmount", () => {
    const file = new File(["photo"], "photo.jpg", {
      type: "image/jpeg",
    });

    const { result, unmount } = renderUseImageUploadSelection();

    act(() => {
      result.current.selectFiles([file]);
    });

    unmount();

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:photo.jpg");
  });
});
