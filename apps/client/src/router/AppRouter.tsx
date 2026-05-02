import { Navigate, Route, Routes } from "react-router";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { GalleriesPage } from "../pages/GalleriesPage";
import { ProfilePage } from "../pages/ProfilePage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/galleries" element={<GalleriesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}
