import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UseImageUploadSelectionResult } from "./useImageUploadSelection";
import { useImageUploadSelectionWithMessages } from "./useImageUploadSelectionWithMessages";

const createImageSelectionMock = (
  selectFilesResult = "",
): UseImageUploadSelectionResult => ({
  selectedImages: [],
  fileError: "",
  selectFiles: vi.fn(() => selectFilesResult),
  updateMetafield: vi.fn(),
  validateSelectedFiles: vi.fn(() => ""),
  clearSelectedImages: vi.fn(),
  clearFileError: vi.fn(),
});

describe("useImageUploadSelectionWithMessages", () => {
  const clearMessages = vi.fn();
  const clearWarning = vi.fn();
  const setWarningMessage = vi.fn();
  const onSelectionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears messages and selects files", () => {
    const imageSelection = createImageSelectionMock();
    const files = [new File(["photo"], "photo.jpg", { type: "image/jpeg" })];

    const result = useImageUploadSelectionWithMessages({
      imageSelection,
      clearMessages,
      clearWarning,
      setWarningMessage,
      onSelectionChange,
    });

    result.selectFiles(files);

    expect(onSelectionChange).toHaveBeenCalledOnce();
    expect(clearMessages).toHaveBeenCalledOnce();
    expect(imageSelection.selectFiles).toHaveBeenCalledWith(files);
    expect(setWarningMessage).not.toHaveBeenCalled();
  });

  it("shows warning when selected files are invalid", () => {
    const validationError = "Only JPEG, PNG files are allowed.";
    const imageSelection = createImageSelectionMock(validationError);
    const files = [new File(["photo"], "photo.gif", { type: "image/gif" })];

    const result = useImageUploadSelectionWithMessages({
      imageSelection,
      clearMessages,
      clearWarning,
      setWarningMessage,
    });

    result.selectFiles(files);

    expect(clearMessages).toHaveBeenCalledOnce();
    expect(imageSelection.selectFiles).toHaveBeenCalledWith(files);
    expect(setWarningMessage).toHaveBeenCalledWith(validationError);
  });

  it("updates metafield after clearing warning", () => {
    const imageSelection = createImageSelectionMock();

    const result = useImageUploadSelectionWithMessages({
      imageSelection,
      clearMessages,
      clearWarning,
      setWarningMessage,
    });

    result.updateMetafield("image-id", "name", "Updated photo name");

    expect(clearWarning).toHaveBeenCalledOnce();
    expect(imageSelection.updateMetafield).toHaveBeenCalledWith(
      "image-id",
      "name",
      "Updated photo name",
    );
  });

  it("clears warning and file error when warning is closed", () => {
    const imageSelection = createImageSelectionMock();

    const result = useImageUploadSelectionWithMessages({
      imageSelection,
      clearMessages,
      clearWarning,
      setWarningMessage,
    });

    result.closeWarning();

    expect(clearWarning).toHaveBeenCalledOnce();
    expect(imageSelection.clearFileError).toHaveBeenCalledOnce();
  });
});
