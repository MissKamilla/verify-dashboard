import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";

import { loginUser } from "@/features/auth/authApi";
import { setAuthToken } from "@/features/auth/authToken";
import type { LoginFormValues } from "@/features/auth/types";
import { validateLoginForm } from "@/features/auth/validateAuthForms";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { AuthLayout } from "@/shared/ui/AuthLayout";
import { FormInputField } from "@/shared/ui/FormInputField";
import { PasswordInputField } from "@/shared/ui/PasswordInputField";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";

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
    <AuthLayout heroVariant="login">
      <div>
        <header className="mb-9">
          <h1 className="text-center text-4xl font-bold leading-[56px] text-text-main min-[1440px]:text-left">
            Sign In
          </h1>

          <p className="text-center text-sm leading-6 text-text-secondary min-[1440px]:text-left">
            Enter your email and password to sign in!
          </p>
        </header>

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
              <Form noValidate className="flex flex-col gap-6">
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 text-sm font-normal leading-none text-text-main">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 accent-brand"
                    />
                    Keep me logged in
                  </label>

                  <a
                    href="#"
                    className="text-sm font-normal leading-none text-brand"
                  >
                    Forget password?
                  </a>
                </div>

                {apiError && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="text-xs font-normal leading-6 text-error"
                  >
                    {apiError}
                  </p>
                )}

                <FormSubmitButton text="Sign In" disabled={isSubmitDisabled} />

                <p className="text-sm leading-none text-text-main">
                  Not registered yet?{" "}
                  <Link to="/register" className="text-brand">
                    Create an Account
                  </Link>
                </p>
              </Form>
            );
          }}
        </Formik>
      </div>
    </AuthLayout>
  );
}
