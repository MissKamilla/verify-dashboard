import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  useDeleteGalleryAccessMutation,
  useUpdateGalleryAccessMutation,
} from "@/features/gallery/galleryQueries";
import type { GalleryAccessListItem } from "@/features/gallery/types";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import { GalleryAccessRow } from "./GalleryAccessRow";

vi.mock("@/features/gallery/galleryQueries", () => ({
  useDeleteGalleryAccessMutation: vi.fn(),
  useUpdateGalleryAccessMutation: vi.fn(),
}));

vi.mock("@/shared/api/getApiErrorMessage", () => ({
  getApiErrorMessage: vi.fn(),
}));

const useDeleteGalleryAccessMutationMock = vi.mocked(
  useDeleteGalleryAccessMutation,
);
const useUpdateGalleryAccessMutationMock = vi.mocked(
  useUpdateGalleryAccessMutation,
);
const getApiErrorMessageMock = vi.mocked(getApiErrorMessage);

const updateMutateAsyncMock = vi.fn();
const deleteMutateAsyncMock = vi.fn();
const mountedCleanups: Array<() => void> = [];

const access: GalleryAccessListItem = {
  id: 1,
  galleryId: 7,
  userId: 3,
  role: "viewer",
  createdAt: "2026-08-04T10:00:00.000Z",
  status: "active",
  user: {
    id: 3,
    firstname: "Jane",
    lastname: "Doe",
    email: "jane@example.com",
    createdAt: "2026-08-04T10:00:00.000Z",
  },
};

const renderGalleryAccessRow = ({
  accessOverride,
  isUpdating = false,
  isDeleting = false,
}: {
  accessOverride?: GalleryAccessListItem;
  isUpdating?: boolean;
  isDeleting?: boolean;
} = {}) => {
  useUpdateGalleryAccessMutationMock.mockReturnValue({
    mutateAsync: updateMutateAsyncMock,
    isPending: isUpdating,
  } as unknown as ReturnType<typeof useUpdateGalleryAccessMutation>);

  useDeleteGalleryAccessMutationMock.mockReturnValue({
    mutateAsync: deleteMutateAsyncMock,
    isPending: isDeleting,
  } as unknown as ReturnType<typeof useDeleteGalleryAccessMutation>);

  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(<GalleryAccessRow access={accessOverride ?? access} />);
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

const clickElement = async (element: Element | null | undefined) => {
  await act(async () => {
    element?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
  });
};

const openRoleMenu = async (container: HTMLElement) => {
  await clickElement(
    container.querySelector(
      "button[aria-label='Change role for jane@example.com']",
    ),
  );
};

const openActionsMenu = async (container: HTMLElement) => {
  await clickElement(
    container.querySelector(
      "button[aria-label='Open actions for jane@example.com']",
    ),
  );
};

const findMenuItem = (text: string) =>
  Array.from(document.body.querySelectorAll("[role='menuitem']")).find(
    (item) => item.textContent === text,
  );

describe("GalleryAccessRow", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();

    updateMutateAsyncMock.mockResolvedValue(undefined);
    deleteMutateAsyncMock.mockResolvedValue(undefined);
    getApiErrorMessageMock.mockReturnValue("Backend error");
  });

  afterEach(() => {
    mountedCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.clearAllMocks();
  });

  it("renders user details and current role", () => {
    const container = renderGalleryAccessRow();

    expect(container.textContent).toContain("Jane Doe");
    expect(container.textContent).toContain("jane@example.com");
    expect(container.textContent).toContain("Viewer");
  });

  it("renders pending invitation without role or action controls", () => {
    const pendingAccess: GalleryAccessListItem = {
      id: 2,
      galleryId: 7,
      email: "pending@example.com",
      role: "editor",
      createdAt: "2026-08-04T11:00:00.000Z",
      status: "pending",
    };

    const container = renderGalleryAccessRow({
      accessOverride: pendingAccess,
    });

    expect(container.textContent).toContain("pending@example.com");
    expect(container.textContent).toContain("Editor");
    expect(container.querySelector("[title='Awaiting registration']")).not.toBe(
      null,
    );
    expect(
      container.querySelector(
        "button[aria-label='Change role for jane@example.com']",
      ),
    ).toBeNull();
    expect(
      container.querySelector(
        "button[aria-label='Open actions for jane@example.com']",
      ),
    ).toBeNull();
  });

  it("updates access role when a different role is selected", async () => {
    const container = renderGalleryAccessRow();

    await openRoleMenu(container);
    await clickElement(findMenuItem("Editor"));

    expect(updateMutateAsyncMock).toHaveBeenCalledWith({
      galleryId: 7,
      userId: 3,
      payload: {
        role: "editor",
      },
    });
  });

  it("does not update access role when the current role is selected", async () => {
    const container = renderGalleryAccessRow();

    await openRoleMenu(container);
    await clickElement(findMenuItem("Viewer"));

    expect(updateMutateAsyncMock).not.toHaveBeenCalled();
  });

  it("shows backend error when role update fails", async () => {
    updateMutateAsyncMock.mockRejectedValueOnce(new Error("Forbidden"));

    const container = renderGalleryAccessRow();

    await openRoleMenu(container);
    await clickElement(findMenuItem("Editor"));

    expect(getApiErrorMessageMock).toHaveBeenCalledWith(expect.any(Error));
    expect(container.querySelector("[role='alert']")?.textContent).toContain(
      "Backend error",
    );
  });

  it("revokes access and closes the confirm modal on success", async () => {
    const container = renderGalleryAccessRow();

    await openActionsMenu(container);
    await clickElement(findMenuItem("Revoke"));

    expect(container.textContent).toContain("Revoke access");
    expect(container.textContent).toContain("jane@example.com");

    const confirmButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Revoke",
    );

    await clickElement(confirmButton);

    expect(deleteMutateAsyncMock).toHaveBeenCalledWith({
      galleryId: 7,
      userId: 3,
    });
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("keeps revoke modal open and shows backend error when revoke fails", async () => {
    deleteMutateAsyncMock.mockRejectedValueOnce(new Error("Conflict"));

    const container = renderGalleryAccessRow();

    await openActionsMenu(container);
    await clickElement(findMenuItem("Revoke"));

    const confirmButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Revoke",
    );

    await clickElement(confirmButton);

    expect(getApiErrorMessageMock).toHaveBeenCalledWith(expect.any(Error));
    expect(container.querySelector("[role='dialog']")).not.toBeNull();
    expect(container.textContent).toContain("Backend error");
  });

  it("disables role and actions controls while a mutation is pending", () => {
    const container = renderGalleryAccessRow({
      isUpdating: true,
    });

    expect(
      container.querySelector<HTMLButtonElement>(
        "button[aria-label='Change role for jane@example.com']",
      )?.disabled,
    ).toBe(true);

    expect(
      container.querySelector<HTMLButtonElement>(
        "button[aria-label='Open actions for jane@example.com']",
      )?.disabled,
    ).toBe(true);
  });
});
