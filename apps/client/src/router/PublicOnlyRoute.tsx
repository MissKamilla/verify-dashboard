import { Navigate, Outlet } from "react-router";

import { hasAuthToken } from "@/features/auth/authToken";

export function PublicOnlyRoute() {
  if (hasAuthToken()) {
    return <Navigate to="/galleries" replace />;
  }

  return <Outlet />;
}
