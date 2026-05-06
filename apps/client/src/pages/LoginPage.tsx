import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { Link, useNavigate } from "react-router";

import { loginUser } from "@/features/auth/authApi";
import { setAuthToken } from "@/features/auth/authToken";
import { getApiErrorMessage } from "@/features/auth/getApiErrorMessage";
import type { LoginFormValues } from "@/features/auth/types";
import { validateLoginForm } from "@/features/auth/validateLoginForm";
import { FormInputField } from "@/shared/ui/FormInputField";
import { PasswordInputField } from "@/shared/ui/PasswordInputField";

const initialFormValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginPage() {
  const [apiError, setApiError] = useState("");
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

  return (
    <Formik<LoginFormValues>
      initialValues={initialFormValues}
      validate={validateLoginForm}
      validateOnMount
      onSubmit={(values) => {
        setApiError("");
        loginMutation.mutate(values);
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, isValid }) => {
        const isSubmitDisabled =
          !values.email.trim() ||
          !values.password ||
          !isValid ||
          loginMutation.isPending;

        return (
          <div>
            <header>
              <h1>Sign In</h1>

              <p>Enter your email and password to sign in!</p>
            </header>

            <Form noValidate>
              <FormInputField
                label="Email"
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : undefined}
                autoComplete="email"
                placeholder="mail@simmmple.com"
                required
              />

              <PasswordInputField
                label="Password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : undefined}
                autoComplete="current-password"
                placeholder="Min. 8 characters"
                required
              />

              {apiError && (
                <p role="alert" aria-live="polite">
                  {apiError}
                </p>
              )}

              <button type="submit" disabled={isSubmitDisabled}>
                Sign In
              </button>

              <p>
                Not registered yet?{" "}
                <Link to="/register">Create an Account</Link>
              </p>
            </Form>
          </div>
        );
      }}
    </Formik>
  );
}
