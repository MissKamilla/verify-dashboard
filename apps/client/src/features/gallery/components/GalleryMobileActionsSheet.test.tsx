import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GalleryMobileActionsSheet } from "./GalleryMobileActionsSheet";

const mountedCleanups: Array<() => void> = [];

const renderGalleryMobileActionsSheet = ({
  canShare = true,
  canDelete = true,
  onShareClick = vi.fn(),
  onDeleteClick = vi.fn(),
  onClose = vi.fn(),
} = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      <MemoryRouter>
        <GalleryMobileActionsSheet
          galleryId={7}
          isOpen
          canShare={canShare}
          canDelete={canDelete}
          onClose={onClose}
          onShareClick={onShareClick}
          onDeleteClick={onDeleteClick}
        />
      </MemoryRouter>,
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
    onShareClick,
    onDeleteClick,
  };
};

describe("GalleryMobileActionsSheet", () => {
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

  it("renders share, edit and delete actions when all permissions are enabled", () => {
    const { container, onClose, onShareClick } =
      renderGalleryMobileActionsSheet();

    expect(container.textContent).toContain("Share");
    expect(container.textContent).toContain("Edit");
    expect(container.textContent).toContain("Delete");

    const shareButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Share"),
    );

    act(() => {
      shareButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onClose).toHaveBeenCalledOnce();
    expect(onShareClick).toHaveBeenCalledOnce();
  });

  it("omits owner-only actions when permissions are disabled", () => {
    const { container } = renderGalleryMobileActionsSheet({
      canShare: false,
      canDelete: false,
    });

    expect(container.textContent).not.toContain("Share");
    expect(container.textContent).toContain("Edit");
    expect(container.textContent).not.toContain("Delete");
  });
});
