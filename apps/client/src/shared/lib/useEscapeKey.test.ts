import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useEscapeKey } from "./useEscapeKey";

const mountedHookCleanups: Array<() => void> = [];

const renderUseEscapeKey = ({
  onEscape = vi.fn(),
  enabled = true,
  target = document,
}: {
  onEscape?: () => void;
  enabled?: boolean;
  target?: Document | Window;
} = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const HookComponent = () => {
    useEscapeKey(onEscape, enabled, target);

    return null;
  };

  act(() => {
    root.render(createElement(HookComponent));
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

  mountedHookCleanups.push(unmount);

  return {
    unmount,
  };
};

describe("useEscapeKey", () => {
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

  it("calls callback when Escape is pressed", () => {
    const onEscape = vi.fn();

    renderUseEscapeKey({ onEscape });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("ignores non-Escape keys", () => {
    const onEscape = vi.fn();

    renderUseEscapeKey({ onEscape });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("does not listen when disabled", () => {
    const onEscape = vi.fn();

    renderUseEscapeKey({
      onEscape,
      enabled: false,
    });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("removes listener on unmount", () => {
    const onEscape = vi.fn();
    const { unmount } = renderUseEscapeKey({ onEscape });

    unmount();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("listens on provided target", () => {
    const onEscape = vi.fn();

    renderUseEscapeKey({
      onEscape,
      target: window,
    });

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onEscape).toHaveBeenCalledOnce();
  });
});
