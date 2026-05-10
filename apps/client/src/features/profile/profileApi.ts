import { httpClient } from "@/shared/api/httpClient";
import type { UpdateProfilePayload, UserProfile } from "./types";

export const getProfile = async (): Promise<UserProfile> => {
  const response = await httpClient.get<UserProfile>("/users/profile");

  return response.data;
};

export const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<UserProfile> => {
  const response = await httpClient.patch<UserProfile>(
    "/users/profile",
    payload,
  );

  return response.data;
};
