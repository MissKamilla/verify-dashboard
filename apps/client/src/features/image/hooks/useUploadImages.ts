import { useEffect, useRef, useState } from "react";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import { MAX_IMAGES_PER_GALLERY } from "../constants";
import {
  useGalleryImagesQuery,
  useUploadGalleryImagesMutation,
} from "../imageQueries";
import type { GetImagesParams, UploadProgress } from "../types";
import { validateImageFiles } from "../validateImageFiles";
import { validateImageMetafields } from "../validateImageMetafields";

type UseUploadImagesProps = {
  galleryId: number;
};

type SelectedUploadImage = {
  id: string;
  file: File;
  previewUrl: string;
  metafields: {
    name: string;
    comment: string;
  };
};

const GALLERY_IMAGE_COUNT_QUERY_PARAMS = {
  page: 1,
  limit: 1,
} satisfies GetImagesParams;

const createSelectedUploadImages = (files: File[]): SelectedUploadImage[] =>
  files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    metafields: {
      name: "",
      comment: "",
    },
  }));

const revokeSelectedUploadImageUrls = (images: SelectedUploadImage[]) => {
  images.forEach((image) => {
    URL.revokeObjectURL(image.previewUrl);
  });
};

export function useUploadImages({ galleryId }: UseUploadImagesProps) {
  const [selectedImages, setSelectedImages] = useState<SelectedUploadImage[]>(
    [],
  );
  const selectedImagesRef = useRef<SelectedUploadImage[]>([]);
  const [fileError, setFileError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );

  const { data: galleryImagesData, isPending: isGalleryImagesPending } =
    useGalleryImagesQuery(galleryId, GALLERY_IMAGE_COUNT_QUERY_PARAMS);
  const availableImagesCount = galleryImagesData
    ? Math.max(MAX_IMAGES_PER_GALLERY - galleryImagesData.total, 0)
    : MAX_IMAGES_PER_GALLERY;

  const uploadImagesMutation = useUploadGalleryImagesMutation();

  useEffect(() => {
    return () => {
      revokeSelectedUploadImageUrls(selectedImagesRef.current);
    };
  }, []);

  const replaceSelectedImages = (nextImages: SelectedUploadImage[]) => {
    revokeSelectedUploadImageUrls(selectedImagesRef.current);

    selectedImagesRef.current = nextImages;
    setSelectedImages(nextImages);
  };

  const updateMetafield = (
    imageId: string,
    field: "name" | "comment",
    value: string,
  ) => {
    setWarningMessage("");

    setSelectedImages((currentImages) => {
      const nextImages = currentImages.map((image) =>
        image.id === imageId
          ? {
              ...image,
              metafields: {
                ...image.metafields,
                [field]: value,
              },
            }
          : image,
      );

      selectedImagesRef.current = nextImages;

      return nextImages;
    });
  };

  const clearSelectedImages = () => {
    setUploadProgress(null);
    replaceSelectedImages([]);
    setFileError("");
    setApiError("");
    setSuccessMessage("");
    setWarningMessage("");
  };

  const selectFiles = (files: File[]) => {
    setUploadProgress(null);
    setApiError("");
    setSuccessMessage("");
    setWarningMessage("");

    const validationError = validateImageFiles(files, availableImagesCount);

    setFileError(validationError);
    if (validationError) {
      replaceSelectedImages([]);
      setWarningMessage(validationError);
      return;
    }

    replaceSelectedImages(createSelectedUploadImages(files));
  };

  const closeWarning = () => {
    setWarningMessage("");
    setFileError("");
  };

  const uploadSelectedImages = () => {
    setApiError("");
    setWarningMessage("");
    setSuccessMessage("");

    const selectedFiles = selectedImages.map((image) => image.file);
    const validationError = validateImageFiles(
      selectedFiles,
      availableImagesCount,
    );

    setFileError(validationError);

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

    const totalUploadSize = selectedFiles.reduce(
      (totalSize, file) => totalSize + file.size,
      0,
    );

    setUploadProgress({
      loadedBytes: 0,
      totalBytes: totalUploadSize,
      percent: 0,
    });

    uploadImagesMutation.mutate(
      {
        galleryId,
        files: selectedFiles,
        metafields: selectedImages.map((image) => ({
          name: image.metafields.name.trim(),
          comment: image.metafields.comment.trim(),
        })),
        onUploadProgress: setUploadProgress,
      },
      {
        onSuccess: () => {
          setUploadProgress({
            loadedBytes: totalUploadSize,
            totalBytes: totalUploadSize,
            percent: 100,
          });
          replaceSelectedImages([]);
          setFileError("");
          setSuccessMessage("Photos have been uploaded to your gallery.");
        },
        onError: (error) => {
          setUploadProgress(null);
          setApiError(getApiErrorMessage(error));
        },
      },
    );
  };

  const isUploading = uploadImagesMutation.isPending;
  const isFilesSelectDisabled = isGalleryImagesPending || isUploading;
  const isSubmitDisabled =
    !selectedImages.length ||
    !!fileError ||
    isGalleryImagesPending ||
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
