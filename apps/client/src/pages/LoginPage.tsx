import { useState, type ChangeEvent, type SyntheticEvent } from "react";

import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";

import { FormInputField } from "@/shared/ui/FormInputField";

import { loginUser } from "@/features/auth/authApi";
import { setAuthToken } from "@/features/auth/authToken";
import { getApiErrorMessage } from "@/features/auth/getApiErrorMessage";
import type { LoginFormValues, LoginFormErrors } from "@/features/auth/types";

import { validateLoginForm } from "@/features/auth/validateLoginForm";

const initialFormValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginPage() {
  const [formValues, setFormValues] =
    useState<LoginFormValues>(initialFormValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [apiError, setApiError] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;

    setFormValues((prev) => ({
      ...prev,
      [name as keyof LoginFormValues]: value,
    }));
  };

  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ token }) => {
      setAuthToken(token);
      navigate("/galleries", { replace: true });
    },
    onError: (error) => {
      setApiError(getApiErrorMessage(error));
    },
  });

  const handleSubmit = (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();
    const validationErrors = validateLoginForm(formValues);

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setApiError("");
    loginMutation.mutate(formValues);
  };

  return (
    <main>
      <form onSubmit={handleSubmit} noValidate>
        <FormInputField
          label="Email"
          type="email"
          name="email"
          value={formValues.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <FormInputField
          label="Password"
          type="password"
          name="password"
          value={formValues.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        {apiError && <p role="alert">{apiError}</p>}
        <button type="submit" disabled={loginMutation.isPending}>
          Sign In
        </button>
        <p>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </main>
  );
}
