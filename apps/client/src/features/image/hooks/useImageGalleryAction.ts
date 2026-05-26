import { useState } from "react";

import {
  useCopyImagesMutation,
  useMoveImagesMutation,
} from "@/features/image/imageQueries";
import type { GalleryImage } from "@/features/image/types";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

type ImageGalleryAction = "move" | "copy";

type ActiveImageGalleryAction = {
  type: ImageGalleryAction;
  image: GalleryImage;
};

type UseImageGalleryActionProps = {
  galleryId: number;
};

export function useImageGalleryAction({
  galleryId,
}: UseImageGalleryActionProps) {
  const [activeAction, setActiveAction] =
    useState<ActiveImageGalleryAction | null>(null);
  const [selectedTargetGalleryId, setSelectedTargetGalleryId] = useState("");
  const [imageGalleryActionError, setImageGalleryActionError] = useState("");

  const moveImagesMutation = useMoveImagesMutation(galleryId);
  const copyImagesMutation = useCopyImagesMutation(galleryId);

  const isImageGalleryActionSubmitting =
    moveImagesMutation.isPending || copyImagesMutation.isPending;

  const openImageGalleryActionModal = (
    type: ImageGalleryAction,
    image: GalleryImage,
  ) => {
    setImageGalleryActionError("");
    setSelectedTargetGalleryId("");
    setActiveAction({ type, image });
  };

  const openMoveImageModal = (image: GalleryImage) => {
    openImageGalleryActionModal("move", image);
  };

  const openCopyImageModal = (image: GalleryImage) => {
    openImageGalleryActionModal("copy", image);
  };

  const closeImageGalleryActionModal = () => {
    if (isImageGalleryActionSubmitting) {
      return;
    }

    setImageGalleryActionError("");
    setSelectedTargetGalleryId("");
    setActiveAction(null);
  };

  const confirmImageGalleryAction = () => {
    if (!activeAction || !selectedTargetGalleryId) {
      return;
    }

    const targetGalleryId = Number(selectedTargetGalleryId);

    if (!Number.isInteger(targetGalleryId) || targetGalleryId <= 0) {
      setImageGalleryActionError("Please select a valid gallery.");
      return;
    }

    setImageGalleryActionError("");

    const payload = {
      imageIds: [activeAction.image.id],
      targetGalleryId,
    };

    const mutationOptions = {
      onSuccess: () => {
        setSelectedTargetGalleryId("");
        setActiveAction(null);
      },
      onError: (error: unknown) => {
        setImageGalleryActionError(getApiErrorMessage(error));
      },
    };

    if (activeAction.type === "move") {
      moveImagesMutation.mutate(payload, mutationOptions);
      return;
    }

    copyImagesMutation.mutate(payload, mutationOptions);
  };

  return {
    activeImageGalleryAction: activeAction?.type ?? null,
    isImageGalleryActionModalOpen: Boolean(activeAction),
    selectedTargetGalleryId,
    imageGalleryActionError,
    isImageGalleryActionSubmitting,
    setSelectedTargetGalleryId,
    openMoveImageModal,
    openCopyImageModal,
    closeImageGalleryActionModal,
    confirmImageGalleryAction,
  };
}
