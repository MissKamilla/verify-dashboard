import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Dropdown } from "./Dropdown";
import type { DropdownOption } from "./Dropdown";

const mountedCleanups: Array<() => void> = [];
type SortValue = "" | "title" | "createdAt";

const options: DropdownOption<SortValue>[] = [
  {
    value: "title",
    label: "Title",
  },
  {
    value: "createdAt",
    label: "Created date",
  },
];

const renderDropdown = ({
  value = "",
  onChange = vi.fn(),
}: {
  value?: SortValue;
  onChange?: (value: SortValue) => void;
} = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      <MemoryRouter>
        <Dropdown<SortValue>
          value={value}
          options={options}
          ariaLabel="Sort by"
          placeholder="Choose sorting"
          onChange={onChange}
        />
      </MemoryRouter>,
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

describe("Dropdown", () => {
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

  it("renders selected option or placeholder", () => {
    const { container } = renderDropdown({
      value: "title",
    });

    expect(container.textContent).toContain("Title");

    mountedCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    const emptyDropdown = renderDropdown();

    expect(emptyDropdown.container.textContent).toContain("Choose sorting");
  });

  it("opens menu and selects option", () => {
    const onChange = vi.fn();
    const { container } = renderDropdown({ onChange });

    const trigger = container.querySelector("button[aria-label='Sort by']");

    act(() => {
      trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector("[role='menu']")).not.toBeNull();

    const menuItems = container.querySelectorAll("[role='menuitem']");

    act(() => {
      menuItems[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledWith("createdAt");
    expect(container.querySelector("[role='menu']")).toBeNull();
  });

  it("closes menu on outside click", () => {
    const { container } = renderDropdown();

    const trigger = container.querySelector("button[aria-label='Sort by']");

    act(() => {
      trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.querySelector("[role='menu']")).not.toBeNull();

    act(() => {
      document.body.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true }),
      );
    });

    expect(container.querySelector("[role='menu']")).toBeNull();
  });
});
