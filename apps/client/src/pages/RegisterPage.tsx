import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";

import { registerUser } from "@/features/auth/authApi";
import { setAuthToken } from "@/features/auth/authToken";
import type { RegisterFormValues } from "@/features/auth/types";
import { validateRegisterForm } from "@/features/auth/validateAuthForms";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { AuthLayout } from "@/shared/ui/AuthLayout";
import { PasswordInputField } from "@/shared/ui/PasswordInputField";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { FormInputField } from "@/shared/ui/FormInputField";

const initialFormValues: RegisterFormValues = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterPage() {
  const [apiError, setApiError] = useState("");

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

  return (
    <AuthLayout heroVariant="register">
      <div>
        <header className="mb-6">
          <h1 className="text-center text-[36px] font-bold leading-[56px] text-text-main min-[1440px]:text-left">
            Sign Up
          </h1>
          <div className="mt-6 inline-block border-b-2 border-brand pb-3">
            <p className="text-[16px] font-bold leading-none text-text-main">
              Personal Information
            </p>
          </div>
        </header>

        <Formik<RegisterFormValues>
          initialValues={initialFormValues}
          validate={validateRegisterForm}
          validateOnMount
          onSubmit={(values) => {
            setApiError("");
            registerMutation.mutate({
              firstname: values.firstname,
              lastname: values.lastname,
              email: values.email,
              password: values.password,
            });
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isValid }) => {
            const isSubmitDisabled =
              !values.firstname.trim() ||
              !values.lastname.trim() ||
              !values.email.trim() ||
              !values.password ||
              !values.confirmPassword ||
              !isValid ||
              registerMutation.isPending;
            return (
              <Form noValidate className="flex flex-col gap-6">
                <FormInputField
                  label="First name"
                  type="text"
                  name="firstname"
                  value={values.firstname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstname ? errors.firstname : undefined}
                  autoComplete="given-name"
                  placeholder="Your first name"
                  required
                />

                <FormInputField
                  label="Last name"
                  type="text"
                  name="lastname"
                  value={values.lastname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastname ? errors.lastname : undefined}
                  autoComplete="family-name"
                  placeholder="Your last name"
                  required
                />

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
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  required
                />

                <PasswordInputField
                  label="Confirm Password"
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

                <p className="text-[14px] leading-[24px] text-text-secondary">
                  By registering you agree to{" "}
                  <a href="#" className="font-medium text-[#007A5A] underline">
                    Terms & Conditions{" "}
                  </a>
                  and{" "}
                  <a href="#" className="font-medium text-[#007A5A] underline">
                    Privacy Policy
                  </a>
                </p>

                {apiError && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="text-[12px] font-normal leading-[24px] text-error"
                  >
                    {apiError}
                  </p>
                )}

                <FormSubmitButton text="Continue" disabled={isSubmitDisabled} />

                <p className="text-[14px] leading-none text-text-main">
                  Already have an account?{" "}
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
