import type { Gallery } from "@/features/gallery/types";

import { SuccessModal } from "@/shared/ui/SuccessModal";

import { DeleteGalleryModal } from "./DeleteGalleryModal";

type GalleryDeleteDialogsProps = {
  galleryToDelete: Gallery | null;
  deleteError: string;
  isDeleting: boolean;
  isSuccessModalOpen: boolean;
  onConfirmDelete: () => void;
  onCloseDeleteModal: () => void;
  onCloseSuccessModal: () => void;
};

export function GalleryDeleteDialogs({
  galleryToDelete,
  deleteError,
  isDeleting,
  isSuccessModalOpen,
  onConfirmDelete,
  onCloseDeleteModal,
  onCloseSuccessModal,
}: GalleryDeleteDialogsProps) {
  return (
    <>
      <DeleteGalleryModal
        isOpen={Boolean(galleryToDelete)}
        galleryTitle={galleryToDelete?.title ?? ""}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={onConfirmDelete}
        onClose={onCloseDeleteModal}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="Success"
        description="Gallery has been successfully deleted from the list of galleries."
        onClose={onCloseSuccessModal}
      />
    </>
  );
}
