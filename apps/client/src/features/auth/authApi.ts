import axios from "axios";

import type { AuthResponse, LoginFormValues, RegisterPayload } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/register`,
    payload,
  );

  return response.data;
};

export const loginUser = async (
  payload: LoginFormValues,
): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/login`,
    payload,
  );

  return response.data;
};
