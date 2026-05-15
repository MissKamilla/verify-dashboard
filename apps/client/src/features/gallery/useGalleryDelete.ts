import { useState } from "react";

import { useDeleteGalleryMutation } from "@/features/gallery/galleryQueries";
import type { Gallery } from "@/features/gallery/types";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

export function useGalleryDelete() {
  const [galleryToDelete, setGalleryToDelete] = useState<Gallery | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const deleteGalleryMutation = useDeleteGalleryMutation();

  const openDeleteModal = (gallery: Gallery) => {
    setDeleteError("");
    setGalleryToDelete(gallery);
  };

  const closeDeleteModal = () => {
    if (deleteGalleryMutation.isPending) {
      return;
    }

    setDeleteError("");
    setGalleryToDelete(null);
  };

  const confirmDelete = () => {
    if (!galleryToDelete) {
      return;
    }

    setDeleteError("");

    deleteGalleryMutation.mutate(galleryToDelete.id, {
      onSuccess: () => {
        setGalleryToDelete(null);
        setIsSuccessModalOpen(true);
      },
      onError: (error) => {
        setDeleteError(getApiErrorMessage(error));
      },
    });
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  return {
    galleryToDelete,
    deleteError,
    isDeleting: deleteGalleryMutation.isPending,
    isSuccessModalOpen,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    closeSuccessModal,
  };
}
