import { httpClient } from "@/shared/api/httpClient";
import type { AuthResponse, LoginFormValues, RegisterPayload } from "./types";

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const response = await httpClient.post<AuthResponse>(
    "/auth/register",
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
