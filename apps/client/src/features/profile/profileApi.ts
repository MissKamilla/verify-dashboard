import { httpClient } from "@/shared/api/httpClient";
import type { UserProfile } from "./types";

export const getProfile = async (): Promise<UserProfile> => {
  const response = await httpClient.get<UserProfile>("users/profile");

  return response.data;
};
