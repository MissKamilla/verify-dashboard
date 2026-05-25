import { useState } from "react";

import { useDeleteImagesMutation } from "@/features/image/imageQueries";
import type { GalleryImage } from "@/features/image/types";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

type UseDeleteImagesProps = {
  galleryId: number;
  onDeleteSuccess?: () => void;
};

export function useDeleteImages({
  galleryId,
  onDeleteSuccess,
}: UseDeleteImagesProps) {
  const [imageIdsToDelete, setImageIdsToDelete] = useState<number[]>([]);
  const [deleteError, setDeleteError] = useState("");

  const deleteImagesMutation = useDeleteImagesMutation(galleryId);

  const openDeleteImageModal = (image: GalleryImage) => {
    setDeleteError("");
    setImageIdsToDelete([image.id]);
  };

  const openDeleteAllImagesModal = (imageIds: number[]) => {
    if (imageIds.length === 0) {
      return;
    }

    setDeleteError("");
    setImageIdsToDelete(imageIds);
  };

  const closeDeleteImagesModal = () => {
    if (deleteImagesMutation.isPending) {
      return;
    }

    setDeleteError("");
    setImageIdsToDelete([]);
  };

  const confirmDeleteImages = () => {
    if (imageIdsToDelete.length === 0) {
      return;
    }

    setDeleteError("");

    deleteImagesMutation.mutate(
      {
        imageIds: imageIdsToDelete,
      },
      {
        onSuccess: () => {
          setImageIdsToDelete([]);
          onDeleteSuccess?.();
        },
        onError: (error) => {
          setDeleteError(getApiErrorMessage(error));
        },
      },
    );
  };

  return {
    imageIdsToDelete,
    isDeleteImagesModalOpen: imageIdsToDelete.length > 0,
    deleteError,
    isDeleting: deleteImagesMutation.isPending,
    openDeleteImageModal,
    openDeleteAllImagesModal,
    closeDeleteImagesModal,
    confirmDeleteImages,
  };
}
