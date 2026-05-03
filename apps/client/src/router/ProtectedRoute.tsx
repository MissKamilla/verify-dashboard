import { Navigate, Outlet } from "react-router";

import { hasAuthToken } from "@/features/auth/authToken";

export function ProtectedRoute() {
  if (!hasAuthToken()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
