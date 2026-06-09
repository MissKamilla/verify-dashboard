import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MobileActionsSheet } from "./MobileActionsSheet";
import type { MobileActionsSheetAction } from "./MobileActionsSheet";

const mountedCleanups: Array<() => void> = [];

const buttonActionMock = vi.fn();

const actions: MobileActionsSheetAction[] = [
  {
    type: "button",
    label: "Delete",
    iconSrc: "/delete.svg",
    onClick: buttonActionMock,
  },
  {
    type: "link",
    label: "Edit",
    iconSrc: "/edit.svg",
    to: "/edit",
  },
];

const renderMobileActionsSheet = ({
  isOpen = true,
  onClose = vi.fn(),
}: {
  isOpen?: boolean;
  onClose?: () => void;
} = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(
        MemoryRouter,
        null,
        createElement(MobileActionsSheet, {
          isOpen,
          closeLabel: "Close actions",
          actions,
          onClose,
        }),
      ),
    );
  });

  let isUnmounted = false;

  const unmount = () => {
    if (isUnmounted) {
      return;
    }

    isUnmounted = true;

    act(() => {
      root.unmount();
    });

    container.remove();
  };

  mountedCleanups.push(unmount);

  return {
    container,
    unmount,
  };
};

describe("MobileActionsSheet", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    buttonActionMock.mockReset();
    document.body.style.overflow = "";
  });

  afterEach(() => {
    mountedCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    document.body.style.overflow = "";
    vi.clearAllMocks();
  });

  it("does not render when closed", () => {
    const { container } = renderMobileActionsSheet({
      isOpen: false,
    });

    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("locks body scroll while open and restores it on unmount", () => {
    document.body.style.overflow = "auto";

    const { unmount } = renderMobileActionsSheet();

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("auto");
  });

  it("closes from overlay, close button and Escape", () => {
    const onClose = vi.fn();
    const { container } = renderMobileActionsSheet({ onClose });

    const overlay = container.firstElementChild;
    const closeButton = container.querySelector(
      "button[aria-label='Close actions']",
    );

    overlay?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("runs button action and closes sheet", () => {
    const onClose = vi.fn();
    const { container } = renderMobileActionsSheet({ onClose });

    const deleteButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Delete"),
    );

    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(buttonActionMock).toHaveBeenCalledOnce();
  });

  it("closes sheet when link action is clicked", () => {
    const onClose = vi.fn();
    const { container } = renderMobileActionsSheet({ onClose });

    const editLink = container.querySelector("a[href='/edit']");

    editLink?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
