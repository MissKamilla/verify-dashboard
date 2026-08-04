import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateGalleryAccessMutation } from "@/features/gallery/galleryQueries";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import { GalleryAccessForm } from "./GalleryAccessForm";

vi.mock("@/features/gallery/galleryQueries", () => ({
  useCreateGalleryAccessMutation: vi.fn(),
}));

vi.mock("@/shared/api/getApiErrorMessage", () => ({
  getApiErrorMessage: vi.fn(),
}));

const useCreateGalleryAccessMutationMock = vi.mocked(
  useCreateGalleryAccessMutation,
);
const getApiErrorMessageMock = vi.mocked(getApiErrorMessage);

const mutateAsyncMock = vi.fn();
const mountedCleanups: Array<() => void> = [];

const renderGalleryAccessForm = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(<GalleryAccessForm galleryId={7} />);
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

const setInputValue = async (input: HTMLInputElement, value: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;

  await act(async () => {
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

const submitForm = async (container: HTMLElement) => {
  await act(async () => {
    container
      .querySelector("form")
      ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
};

const getShareButton = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("button")).find(
    (button) => button.textContent === "Share",
  ) as HTMLButtonElement | undefined;

describe("GalleryAccessForm", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();

    mutateAsyncMock.mockResolvedValue(undefined);
    getApiErrorMessageMock.mockReturnValue("User already has access");
    useCreateGalleryAccessMutationMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateGalleryAccessMutation>);
  });

  afterEach(() => {
    mountedCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("keeps access controls hidden and submit disabled until email is valid", async () => {
    const container = renderGalleryAccessForm();

    expect(
      container
        .querySelector("[aria-hidden]")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(
      (
        container.querySelector(
          "button[aria-label='Select user role']",
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(getShareButton(container)?.disabled).toBe(true);

    await setInputValue(
      container.querySelector("input[name='email']") as HTMLInputElement,
      "invalid-email",
    );

    expect(
      container
        .querySelector("[aria-hidden]")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(getShareButton(container)?.disabled).toBe(true);
  });

  it("submits trimmed email with viewer role by default", async () => {
    const container = renderGalleryAccessForm();

    await setInputValue(
      container.querySelector("input[name='email']") as HTMLInputElement,
      "  user@example.com  ",
    );

    expect(
      container
        .querySelector("[aria-hidden]")
        ?.getAttribute("aria-hidden"),
    ).toBe("false");
    expect(
      (
        container.querySelector(
          "button[aria-label='Select user role']",
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    expect(getShareButton(container)?.disabled).toBe(false);

    await submitForm(container);

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      galleryId: 7,
      payload: {
        email: "user@example.com",
        role: "viewer",
      },
    });
    expect(
      (container.querySelector("input[name='email']") as HTMLInputElement)
        .value,
    ).toBe("");
    expect(getShareButton(container)?.disabled).toBe(true);
  });

  it("clears api errors when the email changes", async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error("Conflict"));

    const container = renderGalleryAccessForm();
    const emailInput = container.querySelector(
      "input[name='email']",
    ) as HTMLInputElement;

    await setInputValue(emailInput, "user@example.com");
    await submitForm(container);

    expect(getApiErrorMessageMock).toHaveBeenCalledWith(expect.any(Error));
    expect(container.textContent).toContain("User already has access");

    await setInputValue(emailInput, "other@example.com");

    expect(container.textContent).not.toContain("User already has access");
  });
});
