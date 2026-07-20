import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDeleteGalleryMutation } from "./galleryQueries";
import type { Gallery } from "./types";
import { useGalleryDelete } from "./useGalleryDelete";

vi.mock("./galleryQueries", () => ({
  useDeleteGalleryMutation: vi.fn(),
}));

const mutateMock = vi.fn();
const useDeleteGalleryMutationMock = vi.mocked(useDeleteGalleryMutation);

const mountedHookCleanups: Array<() => void> = [];

const gallery: Gallery = {
  id: 7,
  title: "Vacation photos",
  description: "Summer trip",
  userId: 3,
  role: "owner",
  createdAt: "2026-06-01T10:00:00.000Z",
};

const renderUseGalleryDelete = (onDeleteSuccess?: () => void) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as ReturnType<typeof useGalleryDelete>,
  };

  const HookComponent = () => {
    result.current = useGalleryDelete({
      onDeleteSuccess,
    });

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

describe("useGalleryDelete", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    mutateMock.mockReset();

    useDeleteGalleryMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGalleryMutation>);
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.clearAllMocks();
  });

  it("opens and closes delete modal", () => {
    const { result } = renderUseGalleryDelete();

    act(() => {
      result.current.openDeleteModal(gallery);
    });

    expect(result.current.galleryToDelete).toEqual(gallery);

    act(() => {
      result.current.closeDeleteModal();
    });

    expect(result.current.galleryToDelete).toBeNull();
    expect(result.current.deleteError).toBe("");
  });

  it("does not close modal while deletion is pending", () => {
    useDeleteGalleryMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: true,
    } as unknown as ReturnType<typeof useDeleteGalleryMutation>);

    const { result } = renderUseGalleryDelete();

    act(() => {
      result.current.openDeleteModal(gallery);
    });

    act(() => {
      result.current.closeDeleteModal();
    });

    expect(result.current.galleryToDelete).toEqual(gallery);
    expect(result.current.isDeleting).toBe(true);
  });

  it("does not call mutation when gallery is not selected", () => {
    const { result } = renderUseGalleryDelete();

    act(() => {
      result.current.confirmDelete();
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("deletes selected gallery and opens success modal", () => {
    const onDeleteSuccess = vi.fn();
    const { result } = renderUseGalleryDelete(onDeleteSuccess);

    act(() => {
      result.current.openDeleteModal(gallery);
    });

    act(() => {
      result.current.confirmDelete();
    });

    expect(mutateMock).toHaveBeenCalledOnce();

    const [galleryId, mutationOptions] = mutateMock.mock.calls[0] as [
      number,
      {
        onSuccess: () => void;
      },
    ];

    expect(galleryId).toBe(gallery.id);

    act(() => {
      mutationOptions.onSuccess();
    });

    expect(result.current.galleryToDelete).toBeNull();
    expect(result.current.isSuccessModalOpen).toBe(true);
    expect(onDeleteSuccess).toHaveBeenCalledOnce();

    act(() => {
      result.current.closeSuccessModal();
    });

    expect(result.current.isSuccessModalOpen).toBe(false);
  });

  it("shows fallback message when deletion fails", () => {
    const { result } = renderUseGalleryDelete();

    act(() => {
      result.current.openDeleteModal(gallery);
    });

    act(() => {
      result.current.confirmDelete();
    });

    const [, mutationOptions] = mutateMock.mock.calls[0] as [
      number,
      {
        onError: (error: unknown) => void;
      },
    ];

    act(() => {
      mutationOptions.onError(new Error("Network error"));
    });

    expect(result.current.deleteError).toBe("Something went wrong");
    expect(result.current.galleryToDelete).toEqual(gallery);
  });
});
