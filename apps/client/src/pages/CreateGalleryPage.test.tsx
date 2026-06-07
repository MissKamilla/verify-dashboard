import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CreateGalleryPage } from "./CreateGalleryPage";

vi.mock("@/features/gallery/components/GalleryWorkflowPageLayout", () => ({
  GalleryWorkflowPageLayout: ({
    title,
    actionTo,
    actionLabel,
    children,
  }: {
    title: string;
    actionTo: string;
    actionLabel: string;
    children: ReactNode;
  }) => (
    <div>
      <p>{title}</p>
      <p>{actionTo}</p>
      <p>{actionLabel}</p>
      {children}
    </div>
  ),
}));

vi.mock("@/features/gallery/components/CreateGalleryForm", () => ({
  CreateGalleryForm: () => <p>Create gallery form</p>,
}));

const mountedPageCleanups: Array<() => void> = [];

const renderPage = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(createElement(CreateGalleryPage));
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

describe("CreateGalleryPage", () => {
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

  it("renders create gallery workflow", () => {
    const container = renderPage();

    expect(container.textContent).toContain("Create a new gallery");
    expect(container.textContent).toContain("/galleries");
    expect(container.textContent).toContain("Go to gallery list");
    expect(container.textContent).toContain("Create gallery form");
  });
});
