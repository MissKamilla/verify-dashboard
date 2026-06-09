import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loginUser } from "@/features/auth/authApi";
import { setAuthToken } from "@/features/auth/authToken";
import type { AuthResponse, LoginFormValues } from "@/features/auth/types";
import { validateLoginForm } from "@/features/auth/validateAuthForms";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import { LoginPage } from "./LoginPage";

type LoginMutationOptions = {
  mutationFn: typeof loginUser;
  onSuccess: (response: AuthResponse) => void;
  onError: (error: unknown) => void;
};

type FormikRenderProps = {
  values: LoginFormValues;
  errors: Partial<Record<keyof LoginFormValues, string>>;
  touched: Partial<Record<keyof LoginFormValues, boolean>>;
  handleChange: () => void;
  handleBlur: () => void;
  isValid: boolean;
};

let formValues: LoginFormValues;
let isFormValid: boolean;
let submitForm: (() => void) | undefined;
let latestMutationOptions: LoginMutationOptions | undefined;
let isMutationPending = false;

const mutateMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

vi.mock("formik", () => ({
  Formik: ({
    initialValues,
    validate,
    onSubmit,
    children,
  }: {
    initialValues: LoginFormValues;
    validate: typeof validateLoginForm;
    onSubmit: (values: LoginFormValues) => void;
    children: (props: FormikRenderProps) => ReactNode;
  }) => {
    submitForm = () => onSubmit(formValues);

    return (
      <div
        data-initial-email={initialValues.email}
        data-has-validation={String(validate === validateLoginForm)}
      >
        {children({
          values: formValues,
          errors: {},
          touched: {},
          handleChange: vi.fn(),
          handleBlur: vi.fn(),
          isValid: isFormValid,
        })}
      </div>
    );
  },
  Form: ({ children }: { children: ReactNode }) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitForm?.();
      }}
    >
      {children}
    </form>
  ),
}));

vi.mock("@/features/auth/authApi", () => ({
  loginUser: vi.fn(),
}));

vi.mock("@/features/auth/authToken", () => ({
  setAuthToken: vi.fn(),
}));

vi.mock("@/features/auth/validateAuthForms", () => ({
  validateLoginForm: vi.fn(),
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
  }: {
    label: string;
    name: string;
    value: string;
  }) => (
    <label>
      {label}
      <input name={name} value={value} readOnly />
    </label>
  ),
}));

vi.mock("@/shared/ui/PasswordInputField", () => ({
  PasswordInputField: ({
    label,
    name,
    value,
  }: {
    label: string;
    name: string;
    value: string;
  }) => (
    <label>
      {label}
      <input name={name} value={value} readOnly />
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
const setAuthTokenMock = vi.mocked(setAuthToken);
const getApiErrorMessageMock = vi.mocked(getApiErrorMessage);

const mountedPageCleanups: Array<() => void> = [];

const renderPage = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(createElement(LoginPage));
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

describe("LoginPage", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    formValues = {
      email: "",
      password: "",
    };

    isFormValid = false;
    isMutationPending = false;
    submitForm = undefined;
    latestMutationOptions = undefined;

    vi.clearAllMocks();

    useNavigateMock.mockReturnValue(navigateMock);
    getApiErrorMessageMock.mockReturnValue("Invalid credentials");

    useMutationMock.mockImplementation((options) => {
      latestMutationOptions = options as LoginMutationOptions;

      return {
        mutate: mutateMock,
        isPending: isMutationPending,
      } as unknown as ReturnType<typeof useMutation>;
    });
  });

  afterEach(() => {
    mountedPageCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("renders login form with disabled submit for empty values", () => {
    const container = renderPage();

    expect(container.textContent).toContain("Auth layout: login");
    expect(container.textContent).toContain("Sign In");
    expect(container.textContent).toContain("Enter your email and password");
    expect(container.textContent).toContain("Create an Account");
    expect(container.querySelector("button")?.disabled).toBe(true);
    expect(
      container
        .querySelector("[data-has-validation]")
        ?.getAttribute("data-has-validation"),
    ).toBe("true");
  });

  it("submits login values and handles success redirect", () => {
    formValues = {
      email: "john@example.com",
      password: "password123",
    };

    isFormValid = true;

    const container = renderPage();

    expect(container.querySelector("button")?.disabled).toBe(false);

    act(() => {
      container
        .querySelector("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true }));
    });

    expect(latestMutationOptions?.mutationFn).toBe(loginUser);
    expect(mutateMock).toHaveBeenCalledWith(formValues);

    act(() => {
      latestMutationOptions?.onSuccess({ token: "auth-token" });
    });

    expect(setAuthTokenMock).toHaveBeenCalledWith("auth-token");
    expect(navigateMock).toHaveBeenCalledWith("/galleries", {
      replace: true,
    });
  });

  it("shows api error from failed login", () => {
    const container = renderPage();
    const error = new Error("Bad credentials");

    act(() => {
      latestMutationOptions?.onError(error);
    });

    expect(getApiErrorMessageMock).toHaveBeenCalledWith(error);
    expect(container.textContent).toContain("Invalid credentials");
  });
});
