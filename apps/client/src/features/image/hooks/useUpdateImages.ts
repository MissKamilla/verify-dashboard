import { useState } from "react";

import { useUpdateImageMetafieldsMutation } from "@/features/image/imageQueries";
import type { GalleryImage, ImageMetafields } from "@/features/image/types";
import { validateImageMetafields } from "@/features/image/validateImageMetafields";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

type UseUpdateImagesProps = {
  galleryId: number;
  onUpdateSuccess?: () => void;
};

export function useUpdateImages({
  galleryId,
  onUpdateSuccess,
}: UseUpdateImagesProps) {
  const [imageToEdit, setImageToEdit] = useState<GalleryImage | null>(null);
  const [editImageError, setEditImageError] = useState("");

  const updateImageMetafieldsMutation =
    useUpdateImageMetafieldsMutation(galleryId);

  const openEditImageModal = (image: GalleryImage) => {
    setEditImageError("");
    setImageToEdit(image);
  };

  const closeEditImageModal = () => {
    if (updateImageMetafieldsMutation.isPending) {
      return;
    }

    setEditImageError("");
    setImageToEdit(null);
  };

  const saveImageDetails = (metafields: ImageMetafields) => {
    if (!imageToEdit) {
      return;
    }

    const validationError = validateImageMetafields([metafields]);

    if (validationError) {
      setEditImageError(validationError);
      return;
    }

    const currentName = imageToEdit.metafields.name?.trim() ?? "";
    const currentComment = imageToEdit.metafields.comment?.trim() ?? "";
    const nextName = metafields.name?.trim() ?? "";
    const nextComment = metafields.comment?.trim() ?? "";

    if (currentName === nextName && currentComment === nextComment) {
      setEditImageError("");
      setImageToEdit(null);
      return;
    }

    setEditImageError("");

    updateImageMetafieldsMutation.mutate(
      {
        imageId: imageToEdit.id,
        metafields,
      },
      {
        onSuccess: () => {
          setImageToEdit(null);
          onUpdateSuccess?.();
        },
        onError: (error) => {
          setEditImageError(getApiErrorMessage(error));
        },
      },
    );
  };

  return {
    imageToEdit,
    editImageError,
    isSaving: updateImageMetafieldsMutation.isPending,
    openEditImageModal,
    closeEditImageModal,
    saveImageDetails,
  };
}
