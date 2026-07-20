import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { useOutletContext } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAllGalleriesQuery } from "@/features/gallery/galleryQueries";
import { useGalleryRouteGallery } from "@/features/gallery/hooks/useGalleryRouteGallery";
import type { Gallery } from "@/features/gallery/types";
import { useDeleteImages } from "@/features/image/hooks/useDeleteImages";
import { useImageGalleryAction } from "@/features/image/hooks/useImageGalleryAction";
import { useUpdateImages } from "@/features/image/hooks/useUpdateImages";
import { useGalleryImagesQuery } from "@/features/image/imageQueries";
import type { GalleryImage, ImagesListResponse } from "@/features/image/types";

import { GalleryDetailsPage } from "./GalleryDetailsPage";

type GalleryActionHookOptions = {
  galleryId: number;
  onActionSuccess: (action: "move" | "copy") => void;
};

type UpdateImagesHookOptions = {
  galleryId: number;
  onUpdateSuccess: () => void;
};

type DeleteImagesHookOptions = {
  galleryId: number;
  onDeleteSuccess: () => void;
};

const openMobileSidebarMock = vi.fn();
const openEditImageModalMock = vi.fn();
const openMoveImageModalMock = vi.fn();
const openCopyImageModalMock = vi.fn();
const openDeleteImageModalMock = vi.fn();
const openDeleteAllImagesModalMock = vi.fn();
const setSelectedTargetGalleryIdMock = vi.fn();
const confirmImageGalleryActionMock = vi.fn();
const closeImageGalleryActionModalMock = vi.fn();
const closeEditImageModalMock = vi.fn();
const saveImageDetailsMock = vi.fn();
const closeDeleteImagesModalMock = vi.fn();
const confirmDeleteImagesMock = vi.fn();

let imageActionSuccess: GalleryActionHookOptions["onActionSuccess"] | undefined;
let updateSuccess: UpdateImagesHookOptions["onUpdateSuccess"] | undefined;
let deleteSuccess: DeleteImagesHookOptions["onDeleteSuccess"] | undefined;
let imageToEdit: GalleryImage | null = null;
let activeImageGalleryAction: "move" | "copy" | null = null;
let isDeleteImagesModalOpen = false;
let imageIdsToDelete: number[] = [];

vi.mock("react-router", () => ({
  useOutletContext: vi.fn(),
}));

vi.mock("@/features/gallery/galleryQueries", () => ({
  useAllGalleriesQuery: vi.fn(),
}));

vi.mock("@/features/gallery/hooks/useGalleryRouteGallery", () => ({
  useGalleryRouteGallery: vi.fn(),
}));

vi.mock("@/features/image/imageQueries", () => ({
  useGalleryImagesQuery: vi.fn(),
}));

vi.mock("@/features/image/hooks/useDeleteImages", () => ({
  useDeleteImages: vi.fn(),
}));

vi.mock("@/features/image/hooks/useImageGalleryAction", () => ({
  useImageGalleryAction: vi.fn(),
}));

vi.mock("@/features/image/hooks/useUpdateImages", () => ({
  useUpdateImages: vi.fn(),
}));

vi.mock("@/features/gallery/components/GalleryDetailsEmptyState", () => ({
  GalleryDetailsEmptyState: ({
    galleryId,
    canUpload,
  }: {
    galleryId: number;
    canUpload: boolean;
  }) => (
    <p>
      Empty gallery: {galleryId}, can upload: {String(canUpload)}
    </p>
  ),
}));

vi.mock("@/features/gallery/components/GalleryActionLink", () => ({
  GalleryActionLink: ({
    to,
    label,
    className,
  }: {
    to: string;
    label: string;
    className?: string;
  }) => (
    <a href={to} data-class-name={className}>
      {label}: {to}
    </a>
  ),
}));

vi.mock("@/features/gallery/components/GalleryBackLink", () => ({
  GalleryBackLink: ({ to }: { to: string }) => <p>Back: {to}</p>,
}));

vi.mock("@/shared/ui/ScrollArea", () => ({
  ScrollArea: ({
    itemsCount,
    children,
  }: {
    itemsCount: number;
    children: ReactNode;
  }) => (
    <div data-items-count={itemsCount}>
      <p>Scroll area</p>
      {children}
    </div>
  ),
}));

vi.mock("@/features/image/components/ImageCard", () => ({
  ImageCard: ({
    image,
    canManage,
    onEditClick,
    onMoveClick,
    onCopyClick,
    onDeleteClick,
  }: {
    image: GalleryImage;
    canManage: boolean;
    onEditClick: (image: GalleryImage) => void;
    onMoveClick: (image: GalleryImage) => void;
    onCopyClick: (image: GalleryImage) => void;
    onDeleteClick: (image: GalleryImage) => void;
  }) => (
    <article>
      <p>Image card: {image.originalFilename}</p>
      {canManage && (
        <>
          <button type="button" onClick={() => onEditClick(image)}>
            Edit image {image.id}
          </button>
          <button type="button" onClick={() => onMoveClick(image)}>
            Move image {image.id}
          </button>
          <button type="button" onClick={() => onCopyClick(image)}>
            Copy image {image.id}
          </button>
          <button type="button" onClick={() => onDeleteClick(image)}>
            Delete image {image.id}
          </button>
        </>
      )}
    </article>
  ),
}));

vi.mock("@/features/image/components/EditImageDetailsModal", () => ({
  EditImageDetailsModal: ({ image }: { image: GalleryImage }) => (
    <p>Edit modal: {image.originalFilename}</p>
  ),
}));

vi.mock("@/features/image/components/ImageGalleryActionModal", () => ({
  ImageGalleryActionModal: ({
    imageAction,
    galleries,
    currentGalleryId,
  }: {
    imageAction: "move" | "copy";
    galleries: Gallery[];
    currentGalleryId: number;
  }) => (
    <p>
      Gallery action modal: {imageAction}, {galleries.length},{" "}
      {currentGalleryId}
    </p>
  ),
}));

vi.mock("@/features/image/components/DeleteImagesModal", () => ({
  DeleteImagesModal: ({
    isOpen,
    imagesCount,
  }: {
    isOpen: boolean;
    imagesCount: number;
  }) => (isOpen ? <p>Delete modal: {imagesCount}</p> : null),
}));

vi.mock("@/shared/ui/CopyrightFooter", () => ({
  CopyrightFooter: () => <p>Copyright footer</p>,
}));

vi.mock("@/shared/ui/Icon", () => ({
  Icon: () => <span>Icon</span>,
}));

vi.mock("@/shared/ui/SuccessModal", () => ({
  SuccessModal: ({
    isOpen,
    title,
    description,
    onClose,
  }: {
    isOpen: boolean;
    title: string;
    description: string;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div>
        <p>{title}</p>
        <p>{description}</p>
        <button type="button" onClick={onClose}>
          Close success modal
        </button>
      </div>
    ) : null,
}));

const useOutletContextMock = vi.mocked(useOutletContext);
const useGalleryRouteGalleryMock = vi.mocked(useGalleryRouteGallery);
const useGalleryImagesQueryMock = vi.mocked(useGalleryImagesQuery);
const useAllGalleriesQueryMock = vi.mocked(useAllGalleriesQuery);
const useUpdateImagesMock = vi.mocked(useUpdateImages);
const useDeleteImagesMock = vi.mocked(useDeleteImages);
const useImageGalleryActionMock = vi.mocked(useImageGalleryAction);

const gallery: Gallery = {
  id: 7,
  title: "Vacation photos",
  description: "Summer trip",
  userId: 3,
  role: "owner",
  createdAt: "2026-06-01T10:00:00.000Z",
};

const image: GalleryImage = {
  id: 10,
  path: "/uploads/photo.jpg",
  galleryId: gallery.id,
  originalFilename: "photo.jpg",
  metafields: {
    name: "Beach",
  },
  createdAt: "2026-06-01T10:00:00.000Z",
};

const secondImage: GalleryImage = {
  ...image,
  id: 11,
  path: "/uploads/second-photo.jpg",
  originalFilename: "second-photo.jpg",
};

const imagesResponse: ImagesListResponse = {
  items: [image, secondImage],
  total: 2,
  page: 1,
  limit: 50,
};

const mountedPageCleanups: Array<() => void> = [];

const renderPage = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(createElement(GalleryDetailsPage));
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

describe("GalleryDetailsPage", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();

    imageToEdit = null;
    activeImageGalleryAction = null;
    isDeleteImagesModalOpen = false;
    imageIdsToDelete = [];
    imageActionSuccess = undefined;
    updateSuccess = undefined;
    deleteSuccess = undefined;

    useOutletContextMock.mockReturnValue({
      openMobileSidebar: openMobileSidebarMock,
    });

    useGalleryRouteGalleryMock.mockReturnValue({
      gallery,
      numericGalleryId: gallery.id,
      isValidGalleryId: true,
      galleryPageState: null,
    });

    useGalleryImagesQueryMock.mockReturnValue({
      data: {
        ...imagesResponse,
        items: [],
        total: 0,
      },
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useGalleryImagesQuery>);

    useAllGalleriesQueryMock.mockReturnValue({
      data: [gallery],
      isPending: false,
    } as unknown as ReturnType<typeof useAllGalleriesQuery>);

    useImageGalleryActionMock.mockImplementation((options) => {
      imageActionSuccess = (options as GalleryActionHookOptions)
        .onActionSuccess;

      return {
        activeImageGalleryAction,
        isImageGalleryActionModalOpen: Boolean(activeImageGalleryAction),
        selectedTargetGalleryId: null,
        imageGalleryActionError: "",
        isImageGalleryActionSubmitting: false,
        setSelectedTargetGalleryId: setSelectedTargetGalleryIdMock,
        openMoveImageModal: openMoveImageModalMock,
        openCopyImageModal: openCopyImageModalMock,
        closeImageGalleryActionModal: closeImageGalleryActionModalMock,
        confirmImageGalleryAction: confirmImageGalleryActionMock,
      } as unknown as ReturnType<typeof useImageGalleryAction>;
    });

    useUpdateImagesMock.mockImplementation((options) => {
      updateSuccess = (options as UpdateImagesHookOptions).onUpdateSuccess;

      return {
        imageToEdit,
        editImageError: "",
        isSaving: false,
        openEditImageModal: openEditImageModalMock,
        closeEditImageModal: closeEditImageModalMock,
        saveImageDetails: saveImageDetailsMock,
      } as unknown as ReturnType<typeof useUpdateImages>;
    });

    useDeleteImagesMock.mockImplementation((options) => {
      deleteSuccess = (options as DeleteImagesHookOptions).onDeleteSuccess;

      return {
        imageIdsToDelete,
        isDeleteImagesModalOpen,
        deleteError: "",
        isDeleting: false,
        openDeleteImageModal: openDeleteImageModalMock,
        openDeleteAllImagesModal: openDeleteAllImagesModalMock,
        closeDeleteImagesModal: closeDeleteImagesModalMock,
        confirmDeleteImages: confirmDeleteImagesMock,
      } as unknown as ReturnType<typeof useDeleteImages>;
    });
  });

  afterEach(() => {
    mountedPageCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("renders route page state instead of gallery details", () => {
    useGalleryRouteGalleryMock.mockReturnValue({
      gallery: undefined,
      numericGalleryId: gallery.id,
      isValidGalleryId: true,
      galleryPageState: <p>Gallery route state</p>,
    });

    const container = renderPage();

    expect(container.textContent).toBe("Gallery route state");
  });

  it("renders nothing when gallery is missing", () => {
    useGalleryRouteGalleryMock.mockReturnValue({
      gallery: undefined,
      numericGalleryId: gallery.id,
      isValidGalleryId: true,
      galleryPageState: null,
    });

    const container = renderPage();

    expect(container.textContent).toBe("");
  });

  it("renders loaded empty gallery details and opens mobile sidebar", () => {
    const container = renderPage();

    expect(container.textContent).toContain("Gallery");
    expect(container.textContent).toContain("Vacation photos");
    expect(container.textContent).toContain("Summer trip");
    expect(container.textContent).toContain(
      "Upload photos: /galleries/7/upload-photos",
    );
    expect(container.textContent).toContain("Empty gallery: 7");
    expect(container.textContent).toContain("Back: /galleries");

    const openMenuButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open menu"]',
    );

    act(() => {
      openMenuButton?.click();
    });

    expect(openMobileSidebarMock).toHaveBeenCalledOnce();
  });

  it("renders image loading and error states", () => {
    useGalleryImagesQueryMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    } as unknown as ReturnType<typeof useGalleryImagesQuery>);

    const loadingContainer = renderPage();

    expect(loadingContainer.textContent).toContain("Loading photos...");

    mountedPageCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    useGalleryImagesQueryMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    } as unknown as ReturnType<typeof useGalleryImagesQuery>);

    const errorContainer = renderPage();

    expect(errorContainer.textContent).toContain(
      "Failed to load photos. Please try again.",
    );
  });

  it("renders images and wires image actions", () => {
    useGalleryImagesQueryMock.mockReturnValue({
      data: imagesResponse,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useGalleryImagesQuery>);

    const container = renderPage();

    expect(container.textContent).toContain("Image card: photo.jpg");
    expect(container.textContent).toContain("Image card: second-photo.jpg");
    expect(container.textContent).toContain("Delete All (2)");

    const clickButton = (text: string) => {
      const button = Array.from(container.querySelectorAll("button")).find(
        (element) => element.textContent === text,
      );

      act(() => {
        button?.click();
      });
    };

    clickButton("Edit image 10");
    clickButton("Move image 10");
    clickButton("Copy image 10");
    clickButton("Delete image 10");
    clickButton("Delete All (2)");

    expect(openEditImageModalMock).toHaveBeenCalledWith(image);
    expect(openMoveImageModalMock).toHaveBeenCalledWith(image);
    expect(openCopyImageModalMock).toHaveBeenCalledWith(image);
    expect(openDeleteImageModalMock).toHaveBeenCalledWith(image);
    expect(openDeleteAllImagesModalMock).toHaveBeenCalledWith([10, 11]);
  });

  it("keeps viewer gallery read-only while mobile menu stays available", () => {
    useGalleryRouteGalleryMock.mockReturnValue({
      gallery: {
        ...gallery,
        role: "viewer",
      },
      numericGalleryId: gallery.id,
      isValidGalleryId: true,
      galleryPageState: null,
    });

    useGalleryImagesQueryMock.mockReturnValue({
      data: imagesResponse,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useGalleryImagesQuery>);

    const container = renderPage();

    expect(container.textContent).toContain("Image card: photo.jpg");
    expect(container.textContent).not.toContain(
      "Upload photos: /galleries/7/upload-photos",
    );
    expect(container.textContent).not.toContain("Delete All (2)");
    expect(container.textContent).not.toContain("Edit image 10");
    expect(container.textContent).not.toContain("Move image 10");
    expect(container.textContent).not.toContain("Copy image 10");
    expect(container.textContent).not.toContain("Delete image 10");

    const openMenuButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open menu"]',
    );

    act(() => {
      openMenuButton?.click();
    });

    expect(openMobileSidebarMock).toHaveBeenCalledOnce();
  });

  it("passes read-only state to empty gallery state for viewer", () => {
    useGalleryRouteGalleryMock.mockReturnValue({
      gallery: {
        ...gallery,
        role: "viewer",
      },
      numericGalleryId: gallery.id,
      isValidGalleryId: true,
      galleryPageState: null,
    });

    const container = renderPage();

    expect(container.textContent).toContain("Empty gallery: 7, can upload: false");
    expect(container.textContent).not.toContain(
      "Upload photos: /galleries/7/upload-photos",
    );
  });

  it("renders action, edit, delete, and success modals from hook state", () => {
    imageToEdit = image;
    activeImageGalleryAction = "copy";
    isDeleteImagesModalOpen = true;
    imageIdsToDelete = [10, 11];

    const container = renderPage();

    expect(container.textContent).toContain("Edit modal: photo.jpg");
    expect(container.textContent).toContain("Gallery action modal: copy, 1, 7");
    expect(container.textContent).toContain("Delete modal: 2");

    act(() => {
      imageActionSuccess?.("copy");
    });

    expect(container.textContent).toContain("Success");
    expect(container.textContent).toContain(
      "Photos have been successfully copied to another gallery.",
    );

    const closeButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Close success modal",
    );

    act(() => {
      closeButton?.click();
      updateSuccess?.();
      deleteSuccess?.();
    });

    expect(container.textContent).toContain(
      "Photos have been successfully deleted from the gallery.",
    );
  });
});
