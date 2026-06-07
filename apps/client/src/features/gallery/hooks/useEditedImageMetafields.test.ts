import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { GalleryImage } from "@/features/image/types";

import { useEditedImageMetafields } from "./useEditedImageMetafields";

const mountedHookCleanups: Array<() => void> = [];

const images: GalleryImage[] = [
  {
    id: 11,
    path: "/uploads/first.jpg",
    galleryId: 7,
    originalFilename: "first.jpg",
    metafields: {
      name: " First image ",
      comment: " First comment ",
    },
    createdAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: 12,
    path: "/uploads/second.jpg",
    galleryId: 7,
    originalFilename: "second.jpg",
    metafields: {
      name: "Second image",
      comment: "",
    },
    createdAt: "2026-06-01T11:00:00.000Z",
  },
];

const renderUseEditedImageMetafields = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as ReturnType<
      typeof useEditedImageMetafields
    >,
  };

  const HookComponent = () => {
    result.current = useEditedImageMetafields(images);

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

describe("useEditedImageMetafields", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("returns fallback metafields before editing", () => {
    const { result } = renderUseEditedImageMetafields();

    expect(
      result.current.getImageMetafields(images[0].id, images[0].metafields),
    ).toEqual(images[0].metafields);

    expect(result.current.changedImageMetafields).toEqual([]);
  });

  it("updates metafield and returns trimmed changed payload", () => {
    const { result } = renderUseEditedImageMetafields();

    act(() => {
      result.current.updateImageMetafield(
        String(images[0].id),
        "comment",
        "  Updated comment  ",
      );
    });

    expect(
      result.current.getImageMetafields(images[0].id, images[0].metafields),
    ).toEqual({
      name: " First image ",
      comment: "  Updated comment  ",
    });

    expect(result.current.changedImageMetafields).toEqual([
      {
        imageId: images[0].id,
        metafields: {
          name: "First image",
          comment: "Updated comment",
        },
      },
    ]);
  });

  it("ignores unknown image id", () => {
    const { result } = renderUseEditedImageMetafields();

    act(() => {
      result.current.updateImageMetafield("999", "name", "Unknown image");
    });

    expect(result.current.changedImageMetafields).toEqual([]);
  });

  it("does not include whitespace-only changes", () => {
    const { result } = renderUseEditedImageMetafields();

    act(() => {
      result.current.updateImageMetafield(
        String(images[0].id),
        "name",
        "First image",
      );
    });

    expect(result.current.changedImageMetafields).toEqual([]);
  });

  it("removes selected edited metafields", () => {
    const { result } = renderUseEditedImageMetafields();

    act(() => {
      result.current.updateImageMetafield(
        String(images[0].id),
        "comment",
        "Updated first comment",
      );

      result.current.updateImageMetafield(
        String(images[1].id),
        "comment",
        "Updated second comment",
      );
    });

    act(() => {
      result.current.removeEditedImageMetafields([images[0].id]);
    });

    expect(result.current.changedImageMetafields).toEqual([
      {
        imageId: images[1].id,
        metafields: {
          name: "Second image",
          comment: "Updated second comment",
        },
      },
    ]);
  });

  it("resets all edited metafields", () => {
    const { result } = renderUseEditedImageMetafields();

    act(() => {
      result.current.updateImageMetafield(
        String(images[0].id),
        "comment",
        "Updated comment",
      );
    });

    act(() => {
      result.current.resetEditedImageMetafields();
    });

    expect(result.current.changedImageMetafields).toEqual([]);
  });
});
