import { Navigate, Outlet, useLocation } from "react-router";

import { hasAuthToken } from "@/features/auth/authToken";

export function PublicOnlyRoute() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isInviteRegistration =
    location.pathname === "/register" && searchParams.has("invite");
  const isPasswordReset = location.pathname === "/reset-password";

  if (hasAuthToken() && !isInviteRegistration && !isPasswordReset) {
    return <Navigate to="/galleries" replace />;
  }

  return <Outlet />;
}

export function ProtectedRoute() {
  if (!hasAuthToken()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
