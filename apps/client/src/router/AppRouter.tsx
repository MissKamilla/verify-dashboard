import { Navigate, Route, Routes } from "react-router";

import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

import { CreateGalleryPage } from "@/pages/CreateGalleryPage";
import { EditGalleryPage } from "@/pages/EditGalleryPage";
import { GalleriesPage } from "@/pages/GalleriesPage";
import { GalleryDetailsPage } from "@/pages/GalleryDetailsPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { UploadPhotosPage } from "@/pages/UploadPhotosPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";

import { ProtectedRoute, PublicOnlyRoute } from "./RouteGuards";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/galleries" element={<GalleriesPage />} />
          <Route path="/galleries/list" element={<GalleriesPage />} />

          <Route path="/galleries/create" element={<CreateGalleryPage />} />
          <Route
            path="/galleries/:galleryId/edit"
            element={<EditGalleryPage />}
          />
          <Route
            path="/galleries/:galleryId/upload-photos"
            element={<UploadPhotosPage />}
          />
          <Route
            path="/galleries/:galleryId"
            element={<GalleryDetailsPage />}
          />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
