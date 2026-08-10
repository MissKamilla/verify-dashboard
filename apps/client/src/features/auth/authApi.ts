import { httpClient } from "@/shared/api/httpClient";

import type {
  AuthResponse,
  LoginFormValues,
  RegisterPayload,
  RegisterResponse,
  ResendVerificationPayload,
  VerifyEmailPayload,
} from "./types";

export const registerUser = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const response = await httpClient.post<RegisterResponse>(
    "/auth/register",
    payload,
  );

  return response.data;
};

export const verifyEmail = async (
  payload: VerifyEmailPayload,
): Promise<AuthResponse> => {
  const response = await httpClient.post<AuthResponse>(
    "/auth/verify-email",
    payload,
  );

  return response.data;
};

export const resendVerification = async (
  payload: ResendVerificationPayload,
): Promise<RegisterResponse> => {
  const response = await httpClient.post<RegisterResponse>(
    "/auth/resend-verification",
    payload,
  );

  return response.data;
};

export const loginUser = async (
  payload: LoginFormValues,
): Promise<AuthResponse> => {
  const response = await httpClient.post<AuthResponse>("/auth/login", payload);

  return response.data;
};
