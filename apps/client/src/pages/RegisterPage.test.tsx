import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { registerByInvite, registerUser } from "@/features/auth/authApi";
import { setAuthToken } from "@/features/auth/authToken";
import type {
  AuthResponse,
  InvitationResponse,
  RegisterByInvitePayload,
  RegisterFormValues,
  RegisterPayload,
  RegisterResponse,
} from "@/features/auth/types";
import { validateRegisterForm } from "@/features/auth/validateAuthForms";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import { RegisterPage } from "./RegisterPage";

type RegisterMutationOptions<TResponse, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TResponse>;
  onSuccess: (response: TResponse, variables: TVariables) => void;
  onError: (error: unknown) => void;
};

type FormikRenderProps = {
  values: RegisterFormValues;
  errors: Partial<Record<keyof RegisterFormValues, string>>;
  touched: Partial<Record<keyof RegisterFormValues, boolean>>;
  handleChange: () => void;
  handleBlur: () => void;
  isValid: boolean;
};

let formValues: RegisterFormValues;
let isFormValid: boolean;
let submitForm: (() => void) | undefined;
let mutationOptions: Array<
  RegisterMutationOptions<unknown, Record<string, unknown>>
>;
let invitationQueryResult: {
  data?: InvitationResponse;
  isPending: boolean;
  isError: boolean;
};
let isMutationPending = false;

const mutateMock = vi.fn();
const navigateMock = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("formik", () => ({
  Formik: ({
    initialValues,
    enableReinitialize,
    validate,
    onSubmit,
    children,
  }: {
    initialValues: RegisterFormValues;
    enableReinitialize?: boolean;
    validate: typeof validateRegisterForm;
    onSubmit: (values: RegisterFormValues) => void;
    children: (props: FormikRenderProps) => ReactNode;
  }) => {
    submitForm = () => onSubmit(formValues);

    return (
      <div
        data-initial-email={initialValues.email}
        data-enable-reinitialize={String(Boolean(enableReinitialize))}
        data-has-validation={String(validate === validateRegisterForm)}
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
  getInvitation: vi.fn(),
  registerByInvite: vi.fn(),
  registerUser: vi.fn(),
}));

vi.mock("@/features/auth/authToken", () => ({
  setAuthToken: vi.fn(),
}));

vi.mock("@/features/auth/validateAuthForms", () => ({
  validateRegisterForm: vi.fn(),
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
    readOnly,
    onChange,
  }: {
    label: string;
    name: string;
    value: string;
    readOnly?: boolean;
    onChange?: () => void;
  }) => (
    <label>
      {label}
      <input
        name={name}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
      />
    </label>
  ),
}));

vi.mock("@/shared/ui/PasswordInputField", () => ({
  PasswordInputField: ({
    label,
    name,
    value,
    onChange,
  }: {
    label: string;
    name: string;
    value: string;
    onChange?: () => void;
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
const useQueryMock = vi.mocked(useQuery);
const useNavigateMock = vi.mocked(useNavigate);
const useSearchParamsMock = vi.mocked(useSearchParams);
const setAuthTokenMock = vi.mocked(setAuthToken);
const getApiErrorMessageMock = vi.mocked(getApiErrorMessage);

const mountedPageCleanups: Array<() => void> = [];

const renderPage = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(createElement(RegisterPage));
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

describe("RegisterPage", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      IS_REACT_ACT_ENVIRONMENT: true,
    });

    formValues = {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    isFormValid = false;
    isMutationPending = false;
    submitForm = undefined;
    mutationOptions = [];
    searchParams = new URLSearchParams();
    invitationQueryResult = {
      isPending: false,
      isError: false,
    };

    vi.clearAllMocks();

    useNavigateMock.mockReturnValue(navigateMock);
    useSearchParamsMock.mockImplementation(
      () =>
        [searchParams, vi.fn()] as unknown as ReturnType<
          typeof useSearchParams
        >,
    );
    getApiErrorMessageMock.mockReturnValue("Email already exists");

    useMutationMock.mockImplementation((options) => {
      mutationOptions.push(
        options as RegisterMutationOptions<unknown, Record<string, unknown>>,
      );

      return {
        mutate: mutateMock,
        isPending: isMutationPending,
      } as unknown as ReturnType<typeof useMutation>;
    });

    useQueryMock.mockImplementation((options) => {
      return {
        ...invitationQueryResult,
        queryKey: options.queryKey,
      } as unknown as ReturnType<typeof useQuery>;
    });
  });

  afterEach(() => {
    mountedPageCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it("renders register form with disabled submit for empty values", () => {
    const container = renderPage();

    expect(container.textContent).toContain("Auth layout: register");
    expect(container.textContent).toContain("Sign Up");
    expect(container.textContent).toContain("Personal Information");
    expect(container.textContent).toContain("Already have an account?");
    expect(container.querySelector("button")?.disabled).toBe(true);
    expect(
      container
        .querySelector("[data-has-validation]")
        ?.getAttribute("data-has-validation"),
    ).toBe("true");
    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
        queryKey: ["auth", "invitation", ""],
      }),
    );
  });

  it("submits register values and redirects to email verification on success", () => {
    formValues = {
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    isFormValid = true;

    const container = renderPage();

    expect(container.querySelector("button")?.disabled).toBe(false);

    act(() => {
      container
        .querySelector("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true }));
    });

    const registerOptions = mutationOptions.find(
      (options) => options.mutationFn === registerUser,
    ) as RegisterMutationOptions<RegisterResponse, RegisterPayload>;

    expect(mutateMock).toHaveBeenCalledWith({
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      password: "password123",
    });

    act(() => {
      registerOptions.onSuccess(
        { message: "Verification code sent" },
        {
          firstname: "John",
          lastname: "Doe",
          email: "john@example.com",
          password: "password123",
        },
      );
    });

    expect(setAuthTokenMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(
      "/verify-email?email=john%40example.com",
      {
        replace: true,
      },
    );
  });

  it("loads invitation email and registers by invite", () => {
    searchParams = new URLSearchParams("invite=invite-token");
    invitationQueryResult = {
      data: {
        email: "invitee@example.com",
        galleryTitle: "Shared gallery",
        role: "viewer",
      },
      isPending: false,
      isError: false,
    };
    formValues = {
      firstname: "Ivan",
      lastname: "Invitee",
      email: "invitee@example.com",
      password: "password123",
      confirmPassword: "password123",
    };
    isFormValid = true;

    const container = renderPage();

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        queryKey: ["auth", "invitation", "invite-token"],
      }),
    );
    expect(
      container
        .querySelector("[data-enable-reinitialize]")
        ?.getAttribute("data-enable-reinitialize"),
    ).toBe("true");

    const emailInput = container.querySelector(
      "input[name='email']",
    ) as HTMLInputElement;

    expect(emailInput.value).toBe("invitee@example.com");
    expect(emailInput.readOnly).toBe(true);

    act(() => {
      container
        .querySelector("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true }));
    });

    expect(mutateMock).toHaveBeenCalledWith({
      firstname: "Ivan",
      lastname: "Invitee",
      password: "password123",
      token: "invite-token",
    });

    const inviteOptions = mutationOptions.find(
      (options) => options.mutationFn === registerByInvite,
    ) as RegisterMutationOptions<AuthResponse, RegisterByInvitePayload>;

    act(() => {
      inviteOptions.onSuccess(
        { token: "invite-auth-token" },
        {
          firstname: "Ivan",
          lastname: "Invitee",
          password: "password123",
          token: "invite-token",
        },
      );
    });

    expect(setAuthTokenMock).toHaveBeenCalledWith("invite-auth-token");
    expect(navigateMock).toHaveBeenCalledWith("/galleries", {
      replace: true,
    });
  });

  it("shows loading and invalid states for invitation lookup", () => {
    searchParams = new URLSearchParams("invite=invite-token");
    invitationQueryResult = {
      isPending: true,
      isError: false,
    };

    let container = renderPage();

    expect(container.textContent).toContain("Loading invitation...");
    expect(container.querySelector("form")).toBeNull();

    mountedPageCleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });

    invitationQueryResult = {
      isPending: false,
      isError: true,
    };

    container = renderPage();

    expect(container.textContent).toContain("Invalid invitation");
    expect(container.textContent).toContain(
      "This invitation is invalid or has expired.",
    );
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "/register",
    );
  });

  it("shows api error from failed registration", () => {
    const container = renderPage();
    const error = new Error("Duplicate email");
    const registerOptions = mutationOptions.find(
      (options) => options.mutationFn === registerUser,
    ) as RegisterMutationOptions<RegisterResponse, RegisterPayload>;

    act(() => {
      registerOptions.onError(error);
    });

    expect(getApiErrorMessageMock).toHaveBeenCalledWith(error);
    expect(container.textContent).toContain("Email already exists");
  });
});
