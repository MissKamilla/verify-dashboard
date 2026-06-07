import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundPage } from "./NotFoundPage";

vi.mock("react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@/shared/ui/Icon", () => ({
  Icon: () => <span>Icon</span>,
}));

const mountedPageCleanups: Array<() => void> = [];

const renderPage = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(createElement(NotFoundPage));
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

describe("NotFoundPage", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });
  });

  afterEach(() => {
    mountedPageCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("renders not-found message and home link", () => {
    const container = renderPage();

    expect(container.textContent).toContain("Page Not Found");

    expect(container.textContent).toContain(
      "Sorry, the page you requested could not be found.",
    );

    expect(container.textContent).toContain("Home page");

    const homeLink = container.querySelector<HTMLAnchorElement>('a[href="/"]');

    expect(homeLink).not.toBeNull();
  });
});
