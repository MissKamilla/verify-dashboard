import { useEffect, useRef, useState } from "react";

import { validateImageFiles } from "../validateImageFiles";

type UseImageUploadSelectionProps = {
  availableImagesCount: number;
};

export type SelectedUploadImage = {
  id: string;
  file: File;
  previewUrl: string;
  metafields: {
    name: string;
    comment: string;
  };
};

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

export type UseImageUploadSelectionResult = ReturnType<
  typeof useImageUploadSelection
>;

export function useImageUploadSelection({
  availableImagesCount,
}: UseImageUploadSelectionProps) {
  const [selectedImages, setSelectedImages] = useState<SelectedUploadImage[]>(
    [],
  );
  const selectedImagesRef = useRef<SelectedUploadImage[]>([]);
  const [fileError, setFileError] = useState("");

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

  const selectFiles = (files: File[]) => {
    const validationError = validateImageFiles(files, availableImagesCount);

    setFileError(validationError);
    if (validationError) {
      replaceSelectedImages([]);
      return validationError;
    }

    replaceSelectedImages(createSelectedUploadImages(files));
    return "";
  };

  const updateMetafield = (
    imageId: string,
    field: "name" | "comment",
    value: string,
  ) => {
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

  const validateSelectedFiles = () => {
    const validationError = validateImageFiles(
      selectedImages.map((image) => image.file),
      availableImagesCount,
    );

    setFileError(validationError);
    return validationError;
  };

  const clearSelectedImages = () => {
    replaceSelectedImages([]);
    setFileError("");
  };

  return {
    selectedImages,
    fileError,
    selectFiles,
    updateMetafield,
    validateSelectedFiles,
    clearSelectedImages,
    clearFileError: () => setFileError(""),
  };
}
