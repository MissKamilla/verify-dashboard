import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";

import { requestPasswordReset } from "@/features/auth/authApi";
import type { ForgotPasswordFormValues } from "@/features/auth/types";
import { validateForgotPasswordForm } from "@/features/auth/validateAuthForms";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { AuthLayout } from "@/shared/ui/AuthLayout";
import { FormInputField } from "@/shared/ui/FormInputField";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";

const initialFormValues: ForgotPasswordFormValues = {
  email: "",
};

export function ForgotPasswordPage() {
  const [apiError, setApiError] = useState("");
  const [message, setMessage] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: ({ message }) => {
      setApiError("");
      setMessage(message);
    },
    onError: (error) => {
      setMessage("");
      setApiError(getApiErrorMessage(error));
    },
  });

  return (
    <AuthLayout heroVariant="login">
      <div>
        <header className="mb-9">
          <h1 className="text-center text-4xl font-bold leading-[56px] text-text-main min-[1440px]:text-left">
            Forgot Password
          </h1>

          <p className="text-center text-sm leading-6 text-text-secondary min-[1440px]:text-left">
            Enter your email and we will send password reset instructions.
          </p>
        </header>

        <Formik<ForgotPasswordFormValues>
          initialValues={initialFormValues}
          validate={validateForgotPasswordForm}
          validateOnMount
          onSubmit={(values) => {
            setApiError("");
            setMessage("");
            forgotPasswordMutation.mutate({
              email: values.email,
            });
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isValid }) => {
            const isSubmitDisabled =
              !values.email.trim() ||
              !isValid ||
              forgotPasswordMutation.isPending;

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
                    forgotPasswordMutation.isPending
                      ? "Sending..."
                      : "Send reset link"
                  }
                  disabled={isSubmitDisabled}
                />

                <p className="text-sm leading-none text-text-main">
                  Remembered your password?{" "}
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
