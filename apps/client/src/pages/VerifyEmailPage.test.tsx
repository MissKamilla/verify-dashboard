import { act, type ChangeEvent, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resendVerification, verifyEmail } from "@/features/auth/authApi";
import { setAuthToken } from "@/features/auth/authToken";
import type {
  AuthResponse,
  RegisterResponse,
  ResendVerificationPayload,
  VerifyEmailPayload,
} from "@/features/auth/types";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import { VerifyEmailPage } from "./VerifyEmailPage";

type MutationOptions<TResponse, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TResponse>;
  onSuccess: (response: TResponse) => void;
  onError: (error: unknown) => void;
};

const mutateMock = vi.fn();
const navigateMock = vi.fn();
let searchParams = new URLSearchParams();
let mutationOptions: Array<MutationOptions<unknown, Record<string, unknown>>>;
let isMutationPending = false;

vi.mock("react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  Navigate: ({ to }: { to: string }) => <p>Navigate to {to}</p>,
  useNavigate: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

vi.mock("@/features/auth/authApi", () => ({
  resendVerification: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock("@/features/auth/authToken", () => ({
  setAuthToken: vi.fn(),
}));

vi.mock("@/shared/api/getApiErrorMessage", () => ({
  getApiErrorMessage: vi.fn(),
}));

vi.mock("@/shared/ui/AuthLayout", () => ({
  AuthLayout: ({
    heroVariant,
    children,
  }: {
    heroVariant: string;
    children: ReactNode;
  }) => (
    <div>
      <p>Auth layout: {heroVariant}</p>
      {children}
    </div>
  ),
}));

vi.mock("@/shared/ui/FormInputField", () => ({
  FormInputField: ({
    label,
    name,
    value,
    onChange,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <label>
      {label}
      <input name={name} value={value} onChange={onChange} />
    </label>
  ),
}));

vi.mock("@/shared/ui/FormSubmitButton", () => ({
  FormSubmitButton: ({
    text,
    disabled,
  }: {
    text: string;
    disabled: boolean;
  }) => (
    <button type="submit" disabled={disabled}>
      {text}
    </button>
  ),
}));

const useMutationMock = vi.mocked(useMutation);
const useNavigateMock = vi.mocked(useNavigate);
const useSearchParamsMock = vi.mocked(useSearchParams);
const setAuthTokenMock = vi.mocked(setAuthToken);
const getApiErrorMessageMock = vi.mocked(getApiErrorMessage);

const mountedCleanups: Array<() => void> = [];

const renderPage = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(<VerifyEmailPage />);
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

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    vi.clearAllMocks();

    searchParams = new URLSearchParams("email=anna%40test.com");
    mutationOptions = [];
    isMutationPending = false;

    useNavigateMock.mockReturnValue(navigateMock);
    useSearchParamsMock.mockImplementation(
      () =>
        [searchParams, vi.fn()] as unknown as ReturnType<
          typeof useSearchParams
        >,
    );
    getApiErrorMessageMock.mockReturnValue("Invalid verification code");

    useMutationMock.mockImplementation((options) => {
      mutationOptions.push(
        options as MutationOptions<unknown, Record<string, unknown>>,
      );

      return {
        mutate: mutateMock,
        isPending: isMutationPending,
      } as unknown as ReturnType<typeof useMutation>;
    });
  });

  afterEach(() => {
    mountedCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("redirects to register when email query param is missing", () => {
    searchParams = new URLSearchParams();

    const container = renderPage();

    expect(container.textContent).toContain("Navigate to /register");
  });

  it("accepts only six numeric verification code characters", async () => {
    const container = renderPage();
    const codeInput = container.querySelector(
      "input[name='code']",
    ) as HTMLInputElement;

    await setInputValue(codeInput, "12a345678");

    expect(codeInput.value).toBe("123456");
    expect(
      container.querySelector<HTMLButtonElement>("button[type='submit']")
        ?.disabled,
    ).toBe(false);
  });

  it("submits verification code and handles success redirect", async () => {
    const container = renderPage();

    await setInputValue(
      container.querySelector("input[name='code']") as HTMLInputElement,
      "123456",
    );

    await submitForm(container);

    expect(mutateMock).toHaveBeenCalledWith({
      email: "anna@test.com",
      code: "123456",
    });

    const verifyOptions = mutationOptions.find(
      (options) => options.mutationFn === verifyEmail,
    ) as MutationOptions<AuthResponse, VerifyEmailPayload>;

    act(() => {
      verifyOptions.onSuccess({
        token: "verified-token",
      });
    });

    expect(setAuthTokenMock).toHaveBeenCalledWith("verified-token");
    expect(navigateMock).toHaveBeenCalledWith("/galleries", {
      replace: true,
    });
  });

  it("resends verification code and shows success message", () => {
    const container = renderPage();
    const resendButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Resend code",
    );

    act(() => {
      resendButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mutateMock).toHaveBeenCalledWith({
      email: "anna@test.com",
    });

    const resendOptions = mutationOptions.find(
      (options) => options.mutationFn === resendVerification,
    ) as MutationOptions<RegisterResponse, ResendVerificationPayload>;

    act(() => {
      resendOptions.onSuccess({
        message: "Verification code sent",
      });
    });

    expect(container.textContent).toContain("Verification code sent");
  });

  it("shows api error for failed verification", () => {
    const container = renderPage();
    const error = new Error("Bad code");
    const verifyOptions = mutationOptions.find(
      (options) => options.mutationFn === verifyEmail,
    ) as MutationOptions<AuthResponse, VerifyEmailPayload>;

    act(() => {
      verifyOptions.onError(error);
    });

    expect(getApiErrorMessageMock).toHaveBeenCalledWith(error);
    expect(container.querySelector("[role='alert']")?.textContent).toContain(
      "Invalid verification code",
    );
  });
});
