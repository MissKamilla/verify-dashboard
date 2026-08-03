import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AnchoredPopupAlign } from "@/shared/lib/useAnchoredPopupPosition";

import { DropdownMenu, DropdownMenuItem } from "./DropdownMenu";

const mountedCleanups: Array<() => void> = [];

type RenderDropdownMenuOptions = {
  renderInPortal?: boolean;
  portalAlign?: AnchoredPopupAlign;
  onSelect?: () => void;
};

const renderDropdownMenu = ({
  renderInPortal = false,
  portalAlign = "start",
  onSelect = vi.fn(),
}: RenderDropdownMenuOptions = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      <MemoryRouter>
        <DropdownMenu
          renderInPortal={renderInPortal}
          portalAlign={portalAlign}
          rootClassName="relative"
          menuClassName="left-0 top-8 z-10 w-[132px] rounded-2xl"
          trigger={({ isOpen, toggle }) => (
            <button
              type="button"
              aria-label="Open test menu"
              aria-expanded={isOpen}
              onClick={toggle}
            >
              Actions
            </button>
          )}
        >
          {({ close }) => (
            <DropdownMenuItem
              onClick={() => {
                close();
                onSelect();
              }}
            >
              Select item
            </DropdownMenuItem>
          )}
        </DropdownMenu>
      </MemoryRouter>,
    );
  });

  const unmount = () => {
    act(() => {
      root.unmount();
    });

    container.remove();
  };

  mountedCleanups.push(unmount);

  return {
    container,
    onSelect,
  };
};

describe("DropdownMenu", () => {
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

  it("does not apply portal positioning styles to a regular menu", () => {
    const { container } = renderDropdownMenu();

    const trigger = container.querySelector(
      "button[aria-label='Open test menu']",
    );

    act(() => {
      trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const menu = container.querySelector<HTMLElement>("[role='menu']");

    expect(menu).not.toBeNull();
    expect(menu?.style.visibility).toBe("");
    expect(menu?.style.top).toBe("");
    expect(menu?.style.left).toBe("");
  });

  it("renders portal menu in document body and keeps item clicks inside the popup", () => {
    const { container, onSelect } = renderDropdownMenu({
      renderInPortal: true,
      portalAlign: "end",
    });

    const trigger = container.querySelector(
      "button[aria-label='Open test menu']",
    );

    act(() => {
      trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const menu = document.body.querySelector<HTMLElement>("[role='menu']");

    expect(menu).not.toBeNull();
    expect(container.querySelector("[role='menu']")).toBeNull();
    expect(menu?.className).toContain("fixed");
    expect(menu?.style.visibility).toBe("visible");

    const menuItem = menu?.querySelector("[role='menuitem']");

    act(() => {
      menuItem?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      menuItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSelect).toHaveBeenCalledOnce();
    expect(document.body.querySelector("[role='menu']")).toBeNull();
  });
});
