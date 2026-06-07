import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Modal } from "./Modal";

const mountedCleanups: Array<() => void> = [];

const renderModal = ({
  isOpen = true,
  isDismissDisabled = false,
  onClose = vi.fn(),
}: {
  isOpen?: boolean;
  isDismissDisabled?: boolean;
  onClose?: () => void;
} = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(
        Modal,
        {
          isOpen,
          titleId: "modal-title",
          descriptionId: "modal-description",
          isDismissDisabled,
          onClose,
          children: [
            createElement(
              "h2",
              { id: "modal-title", key: "title" },
              "Modal title",
            ),
            createElement(
              "p",
              { id: "modal-description", key: "description" },
              "Modal description",
            ),
          ],
        },
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
  };
};

describe("Modal", () => {
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
    const { container } = renderModal({
      isOpen: false,
    });

    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("renders dialog with title and description ids", () => {
    const { container } = renderModal();

    const dialog = container.querySelector("[role='dialog']");

    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(dialog?.getAttribute("aria-labelledby")).toBe("modal-title");
    expect(dialog?.getAttribute("aria-describedby")).toBe("modal-description");
    expect(container.textContent).toContain("Modal title");
  });

  it("closes when overlay, close button or Escape is used", () => {
    const onClose = vi.fn();
    const { container } = renderModal({ onClose });

    const overlay = container.firstElementChild;
    const closeButton = container.querySelector(
      "button[aria-label='Close modal']",
    );

    overlay?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("does not close from overlay, button or Escape when dismiss is disabled", () => {
    const onClose = vi.fn();
    const { container } = renderModal({
      isDismissDisabled: true,
      onClose,
    });

    const overlay = container.firstElementChild;
    const closeButton = container.querySelector(
      "button[aria-label='Close modal']",
    );

    overlay?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(closeButton?.hasAttribute("disabled")).toBe(true);
  });

  it("does not close when clicking dialog content", () => {
    const onClose = vi.fn();
    const { container } = renderModal({ onClose });

    const dialog = container.querySelector("[role='dialog']");

    dialog?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onClose).not.toHaveBeenCalled();
  });
});
