import { useState, type ChangeEvent, type SyntheticEvent } from "react";

import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { FormInputField } from "@/shared/ui/FormInputField";

import { registerUser } from "@/features/auth/authApi";
import { setAuthToken } from "@/features/auth/authToken";
import { getApiErrorMessage } from "@/features/auth/getApiErrorMessage";
import type {
  RegisterFormErrors,
  RegisterFormValues,
  RegisterPayload,
} from "@/features/auth/types";

import { validateRegisterForm } from "@/features/auth/validateRegisterForm";

const initialFormValues: RegisterFormValues = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterPage() {
  const [formValues, setFormValues] =
    useState<RegisterFormValues>(initialFormValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [apiError, setApiError] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;

    setFormValues((prev) => ({
      ...prev,
      [name as keyof RegisterFormValues]: value,
    }));
  };

  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: registerUser,
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
    const validationErrors = validateRegisterForm(formValues);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setApiError("");

    const registerPayload: RegisterPayload = {
      firstname: formValues.firstname,
      lastname: formValues.lastname,
      email: formValues.email,
      password: formValues.password,
    };
    registerMutation.mutate(registerPayload);
  };

  return (
    <main>
      <h1>Register</h1>

      <form onSubmit={handleSubmit} noValidate>
        <FormInputField
          label="First Name"
          type="text"
          name="firstname"
          value={formValues.firstname}
          onChange={handleChange}
          error={errors.firstname}
          autoComplete="given-name"
        />

        <FormInputField
          label="Last Name"
          type="text"
          name="lastname"
          value={formValues.lastname}
          onChange={handleChange}
          error={errors.lastname}
          autoComplete="family-name"
        />

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
          autoComplete="new-password"
        />

        <FormInputField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formValues.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        {apiError && <p role="alert">{apiError}</p>}
        <button type="submit" disabled={registerMutation.isPending}>
          Continue
        </button>
        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </main>
  );
}
