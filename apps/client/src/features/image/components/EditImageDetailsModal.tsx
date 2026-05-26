import { Modal } from "@/shared/ui/Modal";
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
  if (!isOpen || !image) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      titleId="edit-image-details-title"
      descriptionId="edit-image-details-description"
      isDismissDisabled={isSaving}
      onClose={onClose}
    >
      <EditImageDetailsForm
        image={image}
        isSaving={isSaving}
        error={error}
        onSave={onSave}
        onClose={onClose}
      />
    </Modal>
  );
}
