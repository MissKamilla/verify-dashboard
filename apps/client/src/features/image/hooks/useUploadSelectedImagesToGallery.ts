import { useState } from "react";

import {
  UPLOAD_IMAGES_CHUNK_SIZE,
  UPLOAD_IMAGES_CONCURRENCY,
} from "@/features/image/constants";
import { useUploadGalleryImagesMutation } from "@/features/image/imageQueries";

import type { SelectedUploadImage } from "./useImageUploadSelection";
import type { ImageMetafields, UploadProgress } from "@/features/image/types";

type UploadSelectedImagesToGalleryParams = {
  galleryId: number;
  selectedImages: SelectedUploadImage[];
  onUploadProgressChange: (uploadProgress: UploadProgress) => void;
};

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
};

const getSelectedImagesSize = (selectedImages: SelectedUploadImage[]) =>
  selectedImages.reduce((totalSize, image) => totalSize + image.file.size, 0);

const getSelectedImagesMetafields = (
  selectedImages: SelectedUploadImage[],
): ImageMetafields[] =>
  selectedImages.map((image) => ({
    name: image.metafields.name.trim(),
    comment: image.metafields.comment.trim(),
  }));

export function useUploadSelectedImagesToGallery() {
  const [isUploadingChunks, setIsUploadingChunks] = useState(false);

  const uploadImagesMutation = useUploadGalleryImagesMutation();

  const uploadSelectedImagesToGallery = async ({
    galleryId,
    selectedImages,
    onUploadProgressChange,
  }: UploadSelectedImagesToGalleryParams) => {
    if (selectedImages.length === 0) {
      return false;
    }

    const chunks = chunkArray(selectedImages, UPLOAD_IMAGES_CHUNK_SIZE);
    const chunkSizes = chunks.map(getSelectedImagesSize);
    const chunkLoadedBytes = chunks.map(() => 0);

    const totalUploadSize = chunkSizes.reduce(
      (totalSize, chunkSize) => totalSize + chunkSize,
      0,
    );

    const updateTotalProgress = () => {
      const loadedBytes = chunkLoadedBytes.reduce(
        (totalLoadedBytes, chunkLoadedByte) =>
          totalLoadedBytes + chunkLoadedByte,
        0,
      );

      const normalizedLoadedBytes = Math.min(loadedBytes, totalUploadSize);

      onUploadProgressChange({
        loadedBytes: normalizedLoadedBytes,
        totalBytes: totalUploadSize,
        percent:
          totalUploadSize > 0
            ? Math.round((normalizedLoadedBytes / totalUploadSize) * 100)
            : 100,
      });
    };

    onUploadProgressChange({
      loadedBytes: 0,
      totalBytes: totalUploadSize,
      percent: 0,
    });

    let nextChunkIndex = 0;

    const uploadChunk = async (chunkIndex: number) => {
      const chunk = chunks[chunkIndex];
      const chunkSize = chunkSizes[chunkIndex];

      await uploadImagesMutation.mutateAsync({
        galleryId,
        files: chunk.map((image) => image.file),
        metafields: getSelectedImagesMetafields(chunk),
        onUploadProgress: (chunkProgress) => {
          chunkLoadedBytes[chunkIndex] = Math.round(
            (chunkProgress.percent / 100) * chunkSize,
          );

          updateTotalProgress();
        },
      });

      chunkLoadedBytes[chunkIndex] = chunkSize;
      updateTotalProgress();
    };

    const uploadChunksWorker = async () => {
      while (nextChunkIndex < chunks.length) {
        const currentChunkIndex = nextChunkIndex;
        nextChunkIndex += 1;

        await uploadChunk(currentChunkIndex);
      }
    };

    setIsUploadingChunks(true);

    try {
      const workersCount = Math.min(UPLOAD_IMAGES_CONCURRENCY, chunks.length);

      await Promise.all(
        Array.from({ length: workersCount }, () => uploadChunksWorker()),
      );

      onUploadProgressChange({
        loadedBytes: totalUploadSize,
        totalBytes: totalUploadSize,
        percent: 100,
      });

      return true;
    } finally {
      setIsUploadingChunks(false);
    }
  };

  return {
    uploadSelectedImagesToGallery,
    isUploading: isUploadingChunks || uploadImagesMutation.isPending,
  };
}
