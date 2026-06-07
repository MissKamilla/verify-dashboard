import { act, createElement, useRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePopupDismiss } from "./usePopupDismiss";

const mountedHookCleanups: Array<() => void> = [];

const renderUsePopupDismiss = ({
  onClose = vi.fn(),
  enabled = true,
}: {
  onClose?: () => void;
  enabled?: boolean;
} = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const HookComponent = () => {
    const popupRef = useRef<HTMLDivElement | null>(null);

    usePopupDismiss(popupRef, onClose, enabled);

    return createElement(
      "div",
      {
        ref: popupRef,
        "data-testid": "popup",
      },
      "Popup",
    );
  };

  act(() => {
    root.render(createElement(HookComponent));
  });

  const popup = container.querySelector("[data-testid='popup']");

  if (!popup) {
    throw new Error("Expected popup element");
  }

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

  mountedHookCleanups.push(unmount);

  return {
    popup,
    unmount,
  };
};

describe("usePopupDismiss", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.clearAllMocks();
  });

  it("closes popup when clicking outside", () => {
    const onClose = vi.fn();

    renderUsePopupDismiss({ onClose });

    document.body.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
      }),
    );

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close popup when clicking inside", () => {
    const onClose = vi.fn();
    const { popup } = renderUsePopupDismiss({ onClose });

    popup.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
      }),
    );

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes popup when Escape is pressed", () => {
    const onClose = vi.fn();

    renderUsePopupDismiss({ onClose });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not listen when disabled", () => {
    const onClose = vi.fn();

    renderUsePopupDismiss({
      onClose,
      enabled: false,
    });

    document.body.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
      }),
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("removes listeners on unmount", () => {
    const onClose = vi.fn();
    const { unmount } = renderUsePopupDismiss({ onClose });

    unmount();

    document.body.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
      }),
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).not.toHaveBeenCalled();
  });
});
