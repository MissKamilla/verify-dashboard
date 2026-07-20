import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { GalleryListItem } from "@/features/gallery/types";

import { GalleryCard } from "./GalleryCard";

vi.mock("./GalleryCardPreview", () => ({
  GalleryCardPreview: ({ photosCount }: { photosCount: number }) => (
    <p>Preview: {photosCount}</p>
  ),
}));

vi.mock("./GalleryActionsMenu", () => ({
  GalleryActionsMenu: ({ gallery }: { gallery: GalleryListItem }) => (
    <p>Actions menu: {gallery.role}</p>
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

const renderCard = (galleryOverride: Partial<GalleryListItem> = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      <MemoryRouter>
        <GalleryCard
          gallery={{ ...gallery, ...galleryOverride }}
          onDeleteClick={vi.fn()}
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

  return container;
};

describe("GalleryCard", () => {
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

  it("renders role badge and actions for owner gallery", () => {
    const container = renderCard();

    expect(container.textContent).toContain("Vacation photos");
    expect(container.textContent).toContain("Owner");
    expect(container.textContent).toContain("Actions menu: owner");
  });

  it("renders editor badge and actions for editor gallery", () => {
    const container = renderCard({ role: "editor" });

    expect(container.textContent).toContain("Editor");
    expect(container.textContent).toContain("Actions menu: editor");
  });

  it("renders viewer badge without actions for viewer gallery", () => {
    const container = renderCard({ role: "viewer" });

    expect(container.textContent).toContain("Viewer");
    expect(container.textContent).not.toContain("Actions menu");
  });
});
