import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Gallery } from "@/features/gallery/types";

import { GalleryActionsMenu } from "./GalleryActionsMenu";

const mountedCleanups: Array<() => void> = [];

const gallery: Gallery = {
  id: 7,
  title: "Vacation photos",
  description: "Summer trip",
  userId: 3,
  role: "owner",
  createdAt: "2026-06-01T10:00:00.000Z",
};

const renderActionsMenu = ({
  galleryOverride = {},
  onShareClick = vi.fn(),
  onDeleteClick = vi.fn(),
}: {
  galleryOverride?: Partial<Gallery>;
  onShareClick?: (gallery: Gallery) => void;
  onDeleteClick?: (gallery: Gallery) => void;
} = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  const currentGallery = { ...gallery, ...galleryOverride };

  act(() => {
    root.render(
      <MemoryRouter>
        <GalleryActionsMenu
          gallery={currentGallery}
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
    gallery: currentGallery,
    onShareClick,
    onDeleteClick,
  };
};

const openDesktopMenu = (container: HTMLElement) => {
  const desktopTrigger = Array.from(
    container.querySelectorAll("button[aria-label='Open gallery actions']"),
  ).at(-1);

  act(() => {
    desktopTrigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
};

const openMobileSheet = (container: HTMLElement) => {
  const mobileTrigger = Array.from(
    container.querySelectorAll("button[aria-label='Open gallery actions']"),
  )[0];

  act(() => {
    mobileTrigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
};

describe("GalleryActionsMenu", () => {
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

  it("shows share and delete actions for owner galleries", () => {
    const { container, gallery, onShareClick } = renderActionsMenu();

    openDesktopMenu(container);

    expect(container.textContent).toContain("Share");
    expect(container.textContent).toContain("Edit");
    expect(container.textContent).toContain("Delete");

    const shareItem = Array.from(
      container.querySelectorAll("[role='menuitem']"),
    ).find((item) => item.textContent === "Share");

    act(() => {
      shareItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onShareClick).toHaveBeenCalledWith(gallery);
    expect(container.querySelector("[role='menu']")).toBeNull();
  });

  it("does not show share or delete actions for editor galleries", () => {
    const { container } = renderActionsMenu({
      galleryOverride: {
        role: "editor",
      },
    });

    openDesktopMenu(container);

    expect(container.textContent).not.toContain("Share");
    expect(container.textContent).toContain("Edit");
    expect(container.textContent).not.toContain("Delete");
  });

  it("runs share action from the mobile actions sheet", () => {
    const { container, gallery, onShareClick } = renderActionsMenu();

    openMobileSheet(container);

    const shareButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Share"),
    );

    act(() => {
      shareButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onShareClick).toHaveBeenCalledWith(gallery);
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });
});
