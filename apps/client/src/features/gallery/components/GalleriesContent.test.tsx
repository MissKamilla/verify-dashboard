import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Gallery, GalleryListItem } from "@/features/gallery/types";

import { GalleriesContent } from "./GalleriesContent";

vi.mock("@/features/gallery/useGalleryDelete", () => ({
  useGalleryDelete: () => ({
    galleryToDelete: null,
    deleteError: "",
    isDeleting: false,
    isSuccessModalOpen: false,
    openDeleteModal: vi.fn(),
    confirmDelete: vi.fn(),
    closeDeleteModal: vi.fn(),
    closeSuccessModal: vi.fn(),
  }),
}));

vi.mock("./GalleriesList", () => ({
  GalleriesList: ({
    galleries,
    onShareClick,
  }: {
    galleries: GalleryListItem[];
    onShareClick: (gallery: Gallery) => void;
  }) => (
    <button type="button" onClick={() => onShareClick(galleries[0])}>
      Share first gallery
    </button>
  ),
}));

vi.mock("./GalleryDeleteDialogs", () => ({
  GalleryDeleteDialogs: () => <p>Delete dialogs</p>,
}));

vi.mock("./GalleryShareModal", () => ({
  GalleryShareModal: ({
    galleryId,
    galleryTitle,
    onClose,
  }: {
    galleryId: number;
    galleryTitle: string;
    onClose: () => void;
  }) => (
    <section role="dialog">
      <p>
        Share modal for {galleryTitle} #{galleryId}
      </p>
      <button type="button" onClick={onClose}>
        Close share modal
      </button>
    </section>
  ),
}));

const mountedCleanups: Array<() => void> = [];

const gallery: GalleryListItem = {
  id: 7,
  title: "Vacation photos",
  description: "Summer trip",
  userId: 3,
  role: "owner",
  createdAt: "2026-06-01T10:00:00.000Z",
  photosCount: 2,
  previewImages: [],
};

const renderGalleriesContent = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      <GalleriesContent
        galleries={[gallery]}
        totalGalleries={1}
        currentPage={1}
        totalPages={1}
        pageLimit={12}
        onPageChange={vi.fn()}
        isPending={false}
        isError={false}
        error={null}
        isFetching={false}
        onRetry={vi.fn()}
      />,
    );
  });

  const unmount = () => {
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

describe("GalleriesContent", () => {
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

  it("opens and closes the share modal for a selected gallery", () => {
    const { container } = renderGalleriesContent();

    expect(container.querySelector("[role='dialog']")).toBeNull();

    const shareButton = container.querySelector("button");

    act(() => {
      shareButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain(
      "Share modal for Vacation photos #7",
    );

    const closeButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Close share modal",
    );

    act(() => {
      closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.querySelector("[role='dialog']")).toBeNull();
  });
});
