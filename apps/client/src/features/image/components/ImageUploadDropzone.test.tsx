import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ImageUploadDropzone } from "./ImageUploadDropzone";

const mountedCleanups: Array<() => void> = [];

const renderImageUploadDropzone = ({
  disabled = false,
  hasError = false,
  onFilesSelect = vi.fn(),
}: {
  disabled?: boolean;
  hasError?: boolean;
  onFilesSelect?: (files: File[]) => void;
} = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(ImageUploadDropzone, {
        disabled,
        hasError,
        onFilesSelect,
      }),
    );
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

  mountedCleanups.push(unmount);

  return {
    container,
  };
};

const createFileList = (files: File[]) => {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] ?? null,
  } as {
    [index: number]: File;
    length: number;
    item: (index: number) => File | null;
  };

  files.forEach((file, index) => {
    fileList[index] = file;
  });

  return fileList as unknown as FileList;
};

describe("ImageUploadDropzone", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });
  });

  afterEach(() => {
    mountedCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.clearAllMocks();
  });

  it("renders file input with accepted image mime types", () => {
    const { container } = renderImageUploadDropzone();

    const input = container.querySelector("input[type='file']");

    expect(input?.getAttribute("multiple")).toBe("");
    expect(input?.getAttribute("accept")).toBe("image/jpeg,image/png");
  });

  it("selects files from file input and clears input value", () => {
    const onFilesSelect = vi.fn();
    const { container } = renderImageUploadDropzone({ onFilesSelect });

    const input = container.querySelector("input") as HTMLInputElement;
    const files = [
      new File(["photo"], "photo.jpg", {
        type: "image/jpeg",
      }),
    ];

    Object.defineProperty(input, "files", {
      configurable: true,
      value: createFileList(files),
    });

    act(() => {
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(onFilesSelect.mock.calls[0]?.[0]).toEqual(files);
    expect(input.value).toBe("");
  });

  it("selects dropped files and sets copy drop effect", () => {
    const onFilesSelect = vi.fn();
    const { container } = renderImageUploadDropzone({ onFilesSelect });

    const dropzone = container.firstElementChild as HTMLDivElement;
    const files = [
      new File(["photo"], "photo.jpg", {
        type: "image/jpeg",
      }),
    ];

    const dragOverEvent = new Event("dragover", {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(dragOverEvent, "dataTransfer", {
      value: {
        dropEffect: "",
      },
    });

    act(() => {
      dropzone.dispatchEvent(dragOverEvent);
    });

    expect((dragOverEvent as DragEvent).dataTransfer?.dropEffect).toBe("copy");

    const dropEvent = new Event("drop", {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: createFileList(files),
      },
    });

    act(() => {
      dropzone.dispatchEvent(dropEvent);
    });

    expect(onFilesSelect.mock.calls[0]?.[0]).toEqual(files);
  });

  it("does not select dropped files while disabled", () => {
    const onFilesSelect = vi.fn();
    const { container } = renderImageUploadDropzone({
      disabled: true,
      onFilesSelect,
    });

    const dropzone = container.firstElementChild as HTMLDivElement;
    const dropEvent = new Event("drop", {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: createFileList([
          new File(["photo"], "photo.jpg", {
            type: "image/jpeg",
          }),
        ]),
      },
    });

    act(() => {
      dropzone.dispatchEvent(dropEvent);
    });

    expect(onFilesSelect).not.toHaveBeenCalled();
  });
});
