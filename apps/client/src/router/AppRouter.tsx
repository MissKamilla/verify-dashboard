import { Navigate, Route, Routes } from "react-router";

import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { GalleriesPage } from "@/pages/GalleriesPage";
import { ProfilePage } from "@/pages/ProfilePage";

import { ProtectedRoute, PublicOnlyRoute } from "./RouteGuards";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/galleries" element={<GalleriesPage />} />
          <Route path="/galleries/list" element={<GalleriesPage />} />
          <Route path="/galleries/search" element={<GalleriesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
