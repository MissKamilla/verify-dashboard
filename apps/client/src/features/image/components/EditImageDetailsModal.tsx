import { useEffect } from "react";
import { EditImageDetailsForm } from "./EditImageDetailsForm";

import type { GalleryImage, ImageMetafields } from "../types";

type EditImageDetailsModalProps = {
  isOpen: boolean;
  image: GalleryImage | null;
  isSaving: boolean;
  error?: string;
  onSave: (metafields: ImageMetafields) => void;
  onClose: () => void;
};

export function EditImageDetailsModal({
  isOpen,
  image,
  isSaving,
  error,
  onSave,
  onClose,
}: EditImageDetailsModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isSaving) {
        return;
      }

      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !image) {
    return null;
  }

  const handleOverlayClick = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6"
      onClick={handleOverlayClick}
    >
      <EditImageDetailsForm
        image={image}
        isSaving={isSaving}
        error={error}
        onSave={onSave}
        onClose={onClose}
      />
    </div>
  );
}
