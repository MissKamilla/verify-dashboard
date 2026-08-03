import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GalleryShareModal } from "./GalleryShareModal";

vi.mock("@/features/gallery/components/GalleryAccessForm", () => ({
  GalleryAccessForm: ({ galleryId }: { galleryId: number }) => (
    <p>Access form for gallery {galleryId}</p>
  ),
}));

vi.mock("@/features/gallery/components/GalleryAccessList", () => ({
  GalleryAccessList: ({ galleryId }: { galleryId: number }) => (
    <p>Access list for gallery {galleryId}</p>
  ),
}));

const mountedCleanups: Array<() => void> = [];

const renderGalleryShareModal = ({
  isOpen = true,
  onClose = vi.fn(),
} = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      <GalleryShareModal
        isOpen={isOpen}
        galleryId={7}
        galleryTitle="Vacation photos"
        onClose={onClose}
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
    onClose,
  };
};

describe("GalleryShareModal", () => {
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

  it("does not render when closed", () => {
    const { container } = renderGalleryShareModal({
      isOpen: false,
    });

    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("renders access management content for the selected gallery", () => {
    const { container } = renderGalleryShareModal();

    expect(container.textContent).toContain("Share gallery");
    expect(container.textContent).toContain("Vacation photos");
    expect(container.textContent).toContain("Access form for gallery 7");
    expect(container.textContent).toContain("Access list for gallery 7");
  });

  it("closes from the modal close button", () => {
    const { container, onClose } = renderGalleryShareModal();

    const closeButton = container.querySelector(
      "button[aria-label='Close modal']",
    );

    act(() => {
      closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onClose).toHaveBeenCalledOnce();
  });
});
