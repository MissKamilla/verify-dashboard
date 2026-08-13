import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  useCreateGalleryAccessMutation,
  useGalleryAccessRecipientQuery,
} from "@/features/gallery/galleryQueries";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import { GalleryAccessForm } from "./GalleryAccessForm";

vi.mock("@/features/gallery/galleryQueries", () => ({
  useCreateGalleryAccessMutation: vi.fn(),
  useGalleryAccessRecipientQuery: vi.fn(),
}));

vi.mock("@/shared/api/getApiErrorMessage", () => ({
  getApiErrorMessage: vi.fn(),
}));

const useCreateGalleryAccessMutationMock = vi.mocked(
  useCreateGalleryAccessMutation,
);
const useGalleryAccessRecipientQueryMock = vi.mocked(
  useGalleryAccessRecipientQuery,
);
const getApiErrorMessageMock = vi.mocked(getApiErrorMessage);

const mutateAsyncMock = vi.fn();
const mountedCleanups: Array<() => void> = [];
let recipientRegistered = true;
let isRecipientPending = false;

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

const getNotificationCheckbox = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>("input[type='checkbox']");

describe("GalleryAccessForm", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();

    recipientRegistered = true;
    isRecipientPending = false;

    mutateAsyncMock.mockResolvedValue(undefined);
    getApiErrorMessageMock.mockReturnValue("User already has access");
    useCreateGalleryAccessMutationMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateGalleryAccessMutation>);
    useGalleryAccessRecipientQueryMock.mockImplementation(
      (_galleryId, _email, enabled) =>
        ({
          data: enabled
            ? {
                registered: recipientRegistered,
              }
            : undefined,
          isPending: isRecipientPending,
        }) as unknown as ReturnType<typeof useGalleryAccessRecipientQuery>,
    );
  });

  afterEach(() => {
    mountedCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("keeps access controls hidden and submit disabled until email is valid", async () => {
    const container = renderGalleryAccessForm();

    expect(
      container.querySelector("[aria-hidden]")?.getAttribute("aria-hidden"),
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
      container.querySelector("[aria-hidden]")?.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(getShareButton(container)?.disabled).toBe(true);
    expect(useGalleryAccessRecipientQueryMock).toHaveBeenLastCalledWith(
      7,
      "invalid-email",
      false,
    );
  });

  it("submits trimmed registered email with viewer role and notification disabled by default", async () => {
    const container = renderGalleryAccessForm();

    await setInputValue(
      container.querySelector("input[name='email']") as HTMLInputElement,
      "  user@example.com  ",
    );

    expect(
      container.querySelector("[aria-hidden]")?.getAttribute("aria-hidden"),
    ).toBe("false");
    expect(
      (
        container.querySelector(
          "button[aria-label='Select user role']",
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    expect(getShareButton(container)?.disabled).toBe(false);
    expect(getNotificationCheckbox(container)?.checked).toBe(false);
    expect(getNotificationCheckbox(container)?.disabled).toBe(false);
    expect(useGalleryAccessRecipientQueryMock).toHaveBeenLastCalledWith(
      7,
      "user@example.com",
      true,
    );

    await submitForm(container);

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      galleryId: 7,
      payload: {
        email: "user@example.com",
        role: "viewer",
        sendNotification: false,
      },
    });
    expect(
      (container.querySelector("input[name='email']") as HTMLInputElement)
        .value,
    ).toBe("");
    expect(getShareButton(container)?.disabled).toBe(true);
  });

  it("submits registered email with notification enabled when checkbox is checked", async () => {
    const container = renderGalleryAccessForm();
    const emailInput = container.querySelector(
      "input[name='email']",
    ) as HTMLInputElement;

    await setInputValue(emailInput, "user@example.com");

    await act(async () => {
      getNotificationCheckbox(container)?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });

    expect(getNotificationCheckbox(container)?.checked).toBe(true);

    await submitForm(container);

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      galleryId: 7,
      payload: {
        email: "user@example.com",
        role: "viewer",
        sendNotification: true,
      },
    });
  });

  it("forces notification for unregistered recipient invitations", async () => {
    recipientRegistered = false;

    const container = renderGalleryAccessForm();

    await setInputValue(
      container.querySelector("input[name='email']") as HTMLInputElement,
      "new-user@example.com",
    );

    expect(getNotificationCheckbox(container)?.checked).toBe(true);
    expect(getNotificationCheckbox(container)?.disabled).toBe(true);

    await submitForm(container);

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      galleryId: 7,
      payload: {
        email: "new-user@example.com",
        role: "viewer",
        sendNotification: true,
      },
    });
  });

  it("disables sharing while recipient lookup is pending", async () => {
    isRecipientPending = true;

    const container = renderGalleryAccessForm();

    await setInputValue(
      container.querySelector("input[name='email']") as HTMLInputElement,
      "user@example.com",
    );

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
