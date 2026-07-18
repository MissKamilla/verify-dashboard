import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGalleryRouteGallery } from "@/features/gallery/hooks/useGalleryRouteGallery";
import type { Gallery } from "@/features/gallery/types";

import { UploadPhotosPage } from "./UploadPhotosPage";

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

vi.mock("@/features/image/components/ImageUploadForm", () => ({
  ImageUploadForm: ({ galleryId }: { galleryId: number }) => (
    <p>Upload form: {galleryId}</p>
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
    root.render(createElement(UploadPhotosPage));
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

describe("UploadPhotosPage", () => {
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

  it("renders route page state instead of upload form", () => {
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

  it("renders upload form and navigation for loaded gallery", () => {
    const container = renderPage();

    expect(container.textContent).toContain("Gallery");
    expect(container.textContent).toContain("/galleries/7");
    expect(container.textContent).toContain("Go to my gallery");
    expect(container.textContent).toContain("Back: /galleries/7/edit");
    expect(container.textContent).toContain("Upload form: 7");
  });
});
