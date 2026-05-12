import { useQuery } from "@tanstack/react-query";

import { getProfile } from "./profileApi";

export const profileQueryKey = ["profile"] as const;

export const useProfileQuery = () =>
  useQuery({
    queryKey: profileQueryKey,
    queryFn: getProfile,
    retry: false,
  });
