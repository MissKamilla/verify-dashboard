import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGalleryRouteGallery } from "@/features/gallery/hooks/useGalleryRouteGallery";
import type { Gallery } from "@/features/gallery/types";

import { EditGalleryPage } from "./EditGalleryPage";

vi.mock("@/features/gallery/hooks/useGalleryRouteGallery", () => ({
  useGalleryRouteGallery: vi.fn(),
}));

vi.mock("@/features/gallery/components/GalleryWorkflowPageLayout", () => ({
  GalleryWorkflowPageLayout: ({
    title,
    actionTo,
    actionLabel,
    footerLeft,
    children,
  }: {
    title: string;
    actionTo: string;
    actionLabel: string;
    footerLeft?: ReactNode;
    children: ReactNode;
  }) => (
    <div>
      <p>{title}</p>
      <p>{actionTo}</p>
      <p>{actionLabel}</p>
      {footerLeft}
      {children}
    </div>
  ),
}));

vi.mock("@/features/gallery/components/GalleryBackLink", () => ({
  GalleryBackLink: ({ to }: { to: string }) => <p>Back: {to}</p>,
}));

vi.mock("@/features/gallery/components/EditGalleryForm", () => ({
  EditGalleryForm: ({ gallery }: { gallery: Gallery }) => (
    <p>Edit form: {gallery.title}</p>
  ),
}));

const useGalleryRouteGalleryMock = vi.mocked(useGalleryRouteGallery);

const gallery: Gallery = {
  id: 7,
  title: "Vacation photos",
  description: "Summer trip",
  userId: 3,
  role: "owner",
  createdAt: "2026-06-01T10:00:00.000Z",
};

const mountedPageCleanups: Array<() => void> = [];

const renderPage = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(createElement(EditGalleryPage));
  });

  const unmount = () => {
    act(() => {
      root.unmount();
    });

    container.remove();
  };

  mountedPageCleanups.push(unmount);

  return container;
};

describe("EditGalleryPage", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    useGalleryRouteGalleryMock.mockReturnValue({
      gallery,
      numericGalleryId: gallery.id,
      isValidGalleryId: true,
      galleryPageState: null,
    });
  });

  afterEach(() => {
    mountedPageCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.clearAllMocks();
  });

  it("renders route page state instead of gallery form", () => {
    useGalleryRouteGalleryMock.mockReturnValue({
      gallery: undefined,
      numericGalleryId: 7,
      isValidGalleryId: true,
      galleryPageState: <p>Gallery route state</p>,
    });

    const container = renderPage();

    expect(container.textContent).toBe("Gallery route state");
  });

  it("renders nothing when gallery is missing", () => {
    useGalleryRouteGalleryMock.mockReturnValue({
      gallery: undefined,
      numericGalleryId: 7,
      isValidGalleryId: true,
      galleryPageState: null,
    });

    const container = renderPage();

    expect(container.textContent).toBe("");
  });

  it("renders edit form and navigation for loaded gallery", () => {
    const container = renderPage();

    expect(container.textContent).toContain("Edit gallery");
    expect(container.textContent).toContain("/galleries/7/upload-photos");
    expect(container.textContent).toContain("Upload photos");
    expect(container.textContent).toContain("Back: /galleries");
    expect(container.textContent).toContain("Edit form: Vacation photos");
  });
});
