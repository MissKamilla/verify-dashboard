import { useState } from "react";

import type {
  SelectedUploadImage,
  UseImageUploadSelectionResult,
} from "@/features/image/hooks/useImageUploadSelection";
import { useUploadSelectedImagesToGallery } from "@/features/image/hooks/useUploadSelectedImagesToGallery";
import type { UploadProgress } from "@/features/image/types";
import { validateImageMetafields } from "@/features/image/validateImageMetafields";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import { useCreateGalleryMutation } from "../galleryQueries";
import type { GalleryFormValues } from "../types";

type UseCreateGalleryWithImagesProps = {
  selectedImages: SelectedUploadImage[];
  validateSelectedFiles: UseImageUploadSelectionResult["validateSelectedFiles"];
  clearSelectedImages: UseImageUploadSelectionResult["clearSelectedImages"];
};

type SubmitCreateGalleryProps = {
  values: GalleryFormValues;
  resetForm: () => void;
};

export function useCreateGalleryWithImages({
  selectedImages,
  validateSelectedFiles,
  clearSelectedImages,
}: UseCreateGalleryWithImagesProps) {
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );

  const createGalleryMutation = useCreateGalleryMutation();
  const { uploadSelectedImagesToGallery, isUploading } =
    useUploadSelectedImagesToGallery();

  const isSubmitting = createGalleryMutation.isPending || isUploading;

  const clearMessages = () => {
    setApiError("");
    setSuccessMessage("");
    setWarningMessage("");
  };

  const deleteSelectedImages = () => {
    setUploadProgress(null);
    clearSelectedImages();
    clearMessages();
  };

  const submitCreateGallery = async ({
    values,
    resetForm,
  }: SubmitCreateGalleryProps) => {
    clearMessages();
    setUploadProgress(null);

    const hasSelectedImages = selectedImages.length > 0;

    if (hasSelectedImages) {
      const filesValidationError = validateSelectedFiles();
      if (filesValidationError) {
        setWarningMessage(filesValidationError);
        return;
      }

      const metafieldsValidationError = validateImageMetafields(
        selectedImages.map((image) => image.metafields),
      );

      if (metafieldsValidationError) {
        setWarningMessage(metafieldsValidationError);
        return;
      }
    }

    try {
      const gallery = await createGalleryMutation.mutateAsync({
        title: values.title.trim(),
        description: values.description.trim(),
      });

      await uploadSelectedImagesToGallery({
        galleryId: gallery.id,
        selectedImages,
        onUploadProgressChange: setUploadProgress,
      });

      resetForm();
      clearSelectedImages();
      setSuccessMessage(
        "Success. A new gallery has been created in the gallery list.",
      );
    } catch (error) {
      setUploadProgress(null);
      setApiError(getApiErrorMessage(error));
    }
  };

  const closeSuccess = () => {
    setSuccessMessage("");
    setUploadProgress(null);
  };

  return {
    apiError,
    successMessage,
    warningMessage,
    uploadProgress,
    isSubmitting,
    submitCreateGallery,
    deleteSelectedImages,
    clearMessages,
    closeSuccess,
    closeError: () => setApiError(""),
    closeWarning: () => setWarningMessage(""),
    setWarningMessage,
  };
}
