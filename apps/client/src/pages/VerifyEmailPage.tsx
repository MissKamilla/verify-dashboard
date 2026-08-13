import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { resendVerification, verifyEmail } from "@/features/auth/authApi";
import { setAuthToken } from "@/features/auth/authToken";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { AuthLayout } from "@/shared/ui/AuthLayout";
import { FormInputField } from "@/shared/ui/FormInputField";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";

export function VerifyEmailPage() {
  const [code, setCode] = useState("");
  const [apiError, setApiError] = useState("");
  const [message, setMessage] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email");

  const verifyMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: ({ token }) => {
      setAuthToken(token);
      navigate("/galleries", { replace: true });
    },
    onError: (error) => {
      setApiError(getApiErrorMessage(error));
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendVerification,
    onSuccess: ({ message }) => {
      setApiError("");
      setMessage(message);
    },
    onError: (error) => {
      setMessage("");
      setApiError(getApiErrorMessage(error));
    },
  });

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setApiError("");
    setMessage("");

    verifyMutation.mutate({
      email,
      code,
    });
  };

  const handleResend = () => {
    resendMutation.mutate({ email });
  };

  return (
    <AuthLayout heroVariant="register">
      <div>
        <header className="mb-9">
          <h1 className="text-center text-4xl font-bold leading-[56px] text-text-main min-[1440px]:text-left">
            Verify Email
          </h1>

          <p className="text-center text-sm leading-6 text-text-secondary min-[1440px]:text-left">
            Enter the 6-digit code sent to {email}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FormInputField
            label="Verification code"
            name="code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={6}
            required
          />

          {apiError && (
            <p role="alert" className="text-xs leading-6 text-error">
              {apiError}
            </p>
          )}

          {message && (
            <p className="text-xs leading-6 text-text-secondary">{message}</p>
          )}

          <FormSubmitButton
            text="Verify email"
            disabled={code.length !== 6 || verifyMutation.isPending}
          />

          <button
            type="button"
            onClick={handleResend}
            disabled={resendMutation.isPending}
            className="text-sm font-bold text-brand disabled:opacity-50"
          >
            {resendMutation.isPending ? "Sending..." : "Resend code"}
          </button>

          <p className="text-sm text-text-main">
            Wrong email?{" "}
            <Link to="/register" className="font-bold text-brand">
              Sign Up again
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
