import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";

import { resetPassword } from "@/features/auth/authApi";
import type { ResetPasswordFormValues } from "@/features/auth/types";
import { validateResetPasswordForm } from "@/features/auth/validateAuthForms";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { AuthLayout } from "@/shared/ui/AuthLayout";
import { PasswordInputField } from "@/shared/ui/PasswordInputField";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";

const initialFormValues: ResetPasswordFormValues = {
  password: "",
  confirmPassword: "",
};

export function ResetPasswordPage() {
  const [apiError, setApiError] = useState("");
  const [message, setMessage] = useState("");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: ({ message }) => {
      setApiError("");
      setMessage(message);
    },
    onError: (error) => {
      setMessage("");
      setApiError(getApiErrorMessage(error));
    },
  });

  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <AuthLayout heroVariant="login">
      <div>
        <header className="mb-9">
          <h1 className="text-center text-4xl font-bold leading-[56px] text-text-main min-[1440px]:text-left">
            Reset Password
          </h1>

          <p className="text-center text-sm leading-6 text-text-secondary min-[1440px]:text-left">
            Create a new password for your account.
          </p>
        </header>

        <Formik<ResetPasswordFormValues>
          initialValues={initialFormValues}
          validate={validateResetPasswordForm}
          validateOnMount
          onSubmit={(values) => {
            setApiError("");
            setMessage("");
            resetPasswordMutation.mutate({
              token,
              password: values.password,
            });
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isValid }) => {
            const isSubmitDisabled =
              !values.password ||
              !values.confirmPassword ||
              !isValid ||
              resetPasswordMutation.isPending;

            return (
              <Form noValidate className="flex flex-col gap-6">
                <PasswordInputField
                  label="New password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password ? errors.password : undefined}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  required
                />

                <PasswordInputField
                  label="Confirm new password"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.confirmPassword ? errors.confirmPassword : undefined
                  }
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  required
                />

                {apiError && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="text-xs font-normal leading-6 text-error"
                  >
                    {apiError}
                  </p>
                )}

                {message && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-xs font-normal leading-6 text-text-secondary"
                  >
                    {message}
                  </p>
                )}

                <FormSubmitButton
                  text={
                    resetPasswordMutation.isPending
                      ? "Saving..."
                      : "Reset password"
                  }
                  disabled={isSubmitDisabled}
                />

                <p className="text-sm leading-none text-text-main">
                  Back to{" "}
                  <Link to="/login" className="font-bold text-brand">
                    Sign In
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
