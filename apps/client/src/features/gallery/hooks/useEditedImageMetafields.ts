import { useMemo, useState } from "react";

import type {
  GalleryImage,
  ImageMetafields,
  UpdateImageMetafieldsPayload,
} from "@/features/image/types";

type ImageMetafieldName = "name" | "comment";

export function useEditedImageMetafields(images: GalleryImage[]) {
  const [editedImageMetafields, setEditedImageMetafields] = useState<
    Record<number, ImageMetafields>
  >({});

  const imagesById = useMemo(
    () => new Map(images.map((image) => [image.id, image])),
    [images],
  );

  const updateImageMetafield = (
    imageId: string,
    field: ImageMetafieldName,
    value: string,
  ) => {
    const numericImageId = Number(imageId);

    setEditedImageMetafields((currentMetafields) => {
      const image = imagesById.get(numericImageId);

      if (!image) {
        return currentMetafields;
      }

      const currentImageMetafields =
        currentMetafields[numericImageId] ?? image.metafields;

      return {
        ...currentMetafields,
        [numericImageId]: {
          ...currentImageMetafields,
          [field]: value,
        },
      };
    });
  };

  const getImageMetafields = (
    imageId: number,
    fallback: ImageMetafields,
  ) => editedImageMetafields[imageId] ?? fallback;

  const changedImageMetafields = useMemo(
    () =>
      Object.entries(editedImageMetafields).reduce<
        UpdateImageMetafieldsPayload[]
      >((changedMetafields, [imageId, metafields]) => {
        const numericImageId = Number(imageId);
        const image = imagesById.get(numericImageId);

        if (!image) {
          return changedMetafields;
        }

        const currentMetafields = {
          name: metafields.name?.trim() ?? "",
          comment: metafields.comment?.trim() ?? "",
        };

        const initialMetafields = {
          name: image.metafields.name?.trim() ?? "",
          comment: image.metafields.comment?.trim() ?? "",
        };

        const hasChanges =
          currentMetafields.name !== initialMetafields.name ||
          currentMetafields.comment !== initialMetafields.comment;

        if (!hasChanges) {
          return changedMetafields;
        }

        changedMetafields.push({
          imageId: numericImageId,
          metafields: currentMetafields,
        });

        return changedMetafields;
      }, []),
    [editedImageMetafields, imagesById],
  );

  const resetEditedImageMetafields = () => {
    setEditedImageMetafields({});
  };

  const removeEditedImageMetafields = (imageIds: number[]) => {
    setEditedImageMetafields((currentMetafields) => {
      const nextMetafields = { ...currentMetafields };

      imageIds.forEach((imageId) => {
        delete nextMetafields[imageId];
      });

      return nextMetafields;
    });
  };

  return {
    changedImageMetafields,
    getImageMetafields,
    removeEditedImageMetafields,
    resetEditedImageMetafields,
    updateImageMetafield,
  };
}
