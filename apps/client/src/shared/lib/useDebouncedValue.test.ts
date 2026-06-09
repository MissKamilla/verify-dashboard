import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedValue } from "./useDebouncedValue";

const mountedHookCleanups: Array<() => void> = [];

const renderUseDebouncedValue = (
  initialValue: string,
  delay: number,
  onDebouncedValueChange = vi.fn(),
) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const result = {
    current: undefined as unknown as string,
  };

  const HookComponent = ({ value }: { value: string }) => {
    result.current = useDebouncedValue(
      value,
      delay,
      onDebouncedValueChange,
    );

    return null;
  };

  const render = (value: string) => {
    act(() => {
      root.render(createElement(HookComponent, { value }));
    });
  };

  render(initialValue);

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
    result,
    render,
    unmount,
  };
};

describe("useDebouncedValue", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    mountedHookCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("returns initial value before debounce delay passes", () => {
    const { result } = renderUseDebouncedValue("initial", 300);

    expect(result.current).toBe("initial");
  });

  it("updates debounced value after delay", () => {
    const onDebouncedValueChange = vi.fn();
    const { result, render } = renderUseDebouncedValue(
      "initial",
      300,
      onDebouncedValueChange,
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    render("updated");

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("updated");
    expect(onDebouncedValueChange).toHaveBeenCalledWith("updated");
  });

  it("does not call change callback on initial debounce", () => {
    const onDebouncedValueChange = vi.fn();

    renderUseDebouncedValue("initial", 300, onDebouncedValueChange);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onDebouncedValueChange).not.toHaveBeenCalled();
  });

  it("clears previous timeout when value changes before delay", () => {
    const onDebouncedValueChange = vi.fn();
    const { result, render } = renderUseDebouncedValue(
      "initial",
      300,
      onDebouncedValueChange,
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    render("first");

    act(() => {
      vi.advanceTimersByTime(200);
    });

    render("second");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("second");
    expect(onDebouncedValueChange).toHaveBeenCalledOnce();
    expect(onDebouncedValueChange).toHaveBeenCalledWith("second");
  });
});
