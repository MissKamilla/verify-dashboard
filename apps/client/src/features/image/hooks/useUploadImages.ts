import { useState } from "react";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import { MAX_IMAGES_PER_GALLERY } from "../constants";
import { useGalleryImagesQuery } from "../imageQueries";
import type { GetImagesParams, UploadProgress } from "../types";
import { validateImageMetafields } from "../validateImageMetafields";
import { useImageUploadSelection } from "./useImageUploadSelection";
import { useImageUploadSelectionWithMessages } from "./useImageUploadSelectionWithMessages";
import { useUploadSelectedImagesToGallery } from "./useUploadSelectedImagesToGallery";

type UseUploadImagesProps = {
  galleryId: number;
};

const GALLERY_IMAGE_COUNT_QUERY_PARAMS = {
  page: 1,
  limit: 1,
} satisfies GetImagesParams;

export function useUploadImages({ galleryId }: UseUploadImagesProps) {
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );

  const {
    data: galleryImagesData,
    isPending: isGalleryImagesPending,
    isFetching: isGalleryImagesFetching,
  } = useGalleryImagesQuery(galleryId, GALLERY_IMAGE_COUNT_QUERY_PARAMS);

  const isGalleryImagesLoading =
    isGalleryImagesPending || isGalleryImagesFetching;

  const availableImagesCount = galleryImagesData
    ? Math.max(MAX_IMAGES_PER_GALLERY - galleryImagesData.total, 0)
    : MAX_IMAGES_PER_GALLERY;

  const { uploadSelectedImagesToGallery, isUploading } =
    useUploadSelectedImagesToGallery();

  const clearMessages = () => {
    setApiError("");
    setSuccessMessage("");
    setWarningMessage("");
  };

  const imageSelection = useImageUploadSelection({ availableImagesCount });

  const {
    selectedImages,
    fileError,
    selectFiles,
    updateMetafield,
    validateSelectedFiles,
    clearSelectedImages: clearImageSelection,
    closeWarning,
  } = useImageUploadSelectionWithMessages({
    imageSelection,
    clearMessages,
    clearWarning: () => setWarningMessage(""),
    setWarningMessage,
    onSelectionChange: () => setUploadProgress(null),
  });

  const clearSelectedImages = () => {
    setUploadProgress(null);
    clearImageSelection();
    clearMessages();
  };

  const uploadSelectedImages = async () => {
    setApiError("");
    setWarningMessage("");
    setSuccessMessage("");

    const validationError = validateSelectedFiles();

    if (validationError) {
      setWarningMessage(validationError);
      return;
    }

    const metafieldsValidationError = validateImageMetafields(
      selectedImages.map((image) => image.metafields),
    );

    if (metafieldsValidationError) {
      setWarningMessage(metafieldsValidationError);
      return;
    }

    try {
      await uploadSelectedImagesToGallery({
        galleryId,
        selectedImages,
        onUploadProgressChange: setUploadProgress,
      });

      clearImageSelection();
      setSuccessMessage("Photos have been uploaded to your gallery.");
    } catch (error) {
      setUploadProgress(null);
      setApiError(getApiErrorMessage(error));
    }
  };

  const isFilesSelectDisabled = isGalleryImagesLoading || isUploading;
  const isSubmitDisabled =
    !selectedImages.length ||
    !!fileError ||
    isGalleryImagesLoading ||
    isUploading;

  const closeSuccess = () => {
    setSuccessMessage("");
    setUploadProgress(null);
  };

  return {
    selectedImages,
    fileError,
    apiError,
    successMessage,
    warningMessage,
    uploadProgress,
    isUploading,
    isFilesSelectDisabled,
    isSubmitDisabled,
    selectFiles,
    updateMetafield,
    clearSelectedImages,
    uploadSelectedImages,
    closeWarning,
    closeSuccess,
    closeError: () => setApiError(""),
  };
}
