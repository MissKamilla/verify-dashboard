import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";
import { removeAuthToken } from "@/features/auth/authToken";

type UseRedirectOnUnauthorizedParams = {
  isError: boolean;
  error: unknown;
};

export function useRedirectOnUnauthorized({
  isError,
  error,
}: UseRedirectOnUnauthorizedParams) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isError) {
      return;
    }

    if (!isUnauthorizedError(error)) {
      return;
    }

    removeAuthToken();
    queryClient.clear();
    navigate("/login", { replace: true });
  }, [isError, error, navigate, queryClient]);
}
