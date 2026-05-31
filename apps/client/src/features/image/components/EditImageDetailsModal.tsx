import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { EditImageDetailsForm } from "./EditImageDetailsForm";
import { DiscardImageChangesModal } from "./DiscardImageChangesModal";

import type { GalleryImage, ImageMetafields } from "@/features/image/types";

type EditImageDetailsModalProps = {
  image: GalleryImage;
  isSaving: boolean;
  error?: string;
  onSave: (metafields: ImageMetafields) => void;
  onClose: () => void;
};

export function EditImageDetailsModal({
  image,
  isSaving,
  error,
  onSave,
  onClose,
}: EditImageDetailsModalProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] =
    useState(false);

  const handleCloseRequest = () => {
    if (isDirty) {
      setIsDiscardChangesModalOpen(true);
      return;
    }

    onClose();
  };

  const handleDiscardChanges = () => {
    setIsDirty(false);
    setIsDiscardChangesModalOpen(false);
    onClose();
  };

  return (
    <>
      <div className={isDiscardChangesModalOpen ? "hidden" : undefined}>
        <Modal
          isOpen
          titleId="edit-image-details-title"
          descriptionId="edit-image-details-description"
          isDismissDisabled={isSaving || isDiscardChangesModalOpen}
          onClose={handleCloseRequest}
        >
          <EditImageDetailsForm
            key={image.id}
            image={image}
            isSaving={isSaving}
            error={error}
            onSave={onSave}
            onClose={handleCloseRequest}
            onDirtyChange={setIsDirty}
          />
        </Modal>
      </div>

      <DiscardImageChangesModal
        isOpen={isDiscardChangesModalOpen}
        onConfirm={handleDiscardChanges}
        onClose={() => setIsDiscardChangesModalOpen(false)}
      />
    </>
  );
}
