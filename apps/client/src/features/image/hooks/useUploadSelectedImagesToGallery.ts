import { useUploadGalleryImagesMutation } from "../imageQueries";
import type { UploadProgress } from "../types";
import type { SelectedUploadImage } from "./useImageUploadSelection";

type UploadSelectedImagesToGalleryParams = {
  galleryId: number;
  selectedImages: SelectedUploadImage[];
  onUploadProgressChange: (uploadProgress: UploadProgress) => void;
};

export function useUploadSelectedImagesToGallery() {
  const uploadImagesMutation = useUploadGalleryImagesMutation();

  const uploadSelectedImagesToGallery = async ({
    galleryId,
    selectedImages,
    onUploadProgressChange,
  }: UploadSelectedImagesToGalleryParams) => {
    const selectedFiles = selectedImages.map((image) => image.file);

    if (selectedFiles.length === 0) {
      return false;
    }

    const totalUploadSize = selectedFiles.reduce(
      (totalSize, file) => totalSize + file.size,
      0,
    );

    onUploadProgressChange({
      loadedBytes: 0,
      totalBytes: totalUploadSize,
      percent: 0,
    });

    await uploadImagesMutation.mutateAsync({
      galleryId,
      files: selectedFiles,
      metafields: selectedImages.map((image) => ({
        name: image.metafields.name.trim(),
        comment: image.metafields.comment.trim(),
      })),
      onUploadProgress: onUploadProgressChange,
    });

    onUploadProgressChange({
      loadedBytes: totalUploadSize,
      totalBytes: totalUploadSize,
      percent: 100,
    });

    return true;
  };

  return {
    uploadSelectedImagesToGallery,
    isUploading: uploadImagesMutation.isPending,
  };
}
