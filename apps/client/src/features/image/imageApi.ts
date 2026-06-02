import { httpClient } from "@/shared/api/httpClient";

import type {
  CopyImagesPayload,
  DeleteImagesPayload,
  GalleryImage,
  GetImagesParams,
  ImagesListResponse,
  MoveImagesPayload,
  UpdateImageMetafieldsPayload,
  UploadGalleryImagesPayload,
} from "./types";

export const getGalleryImages = async (
  galleryId: number,
  params?: GetImagesParams,
): Promise<ImagesListResponse> => {
  const response = await httpClient.get<ImagesListResponse>(
    `/galleries/${galleryId}/images`,
    {
      params,
    },
  );

  return response.data;
};

export const uploadGalleryImages = async ({
  galleryId,
  files,
  metafields,
  onUploadProgress,
}: UploadGalleryImagesPayload): Promise<GalleryImage[]> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  if (metafields) {
    formData.append("metafields", JSON.stringify(metafields));
  }

  const response = await httpClient.post<GalleryImage[]>(
    `/galleries/${galleryId}/images`,
    formData,
    {
      onUploadProgress: (progressEvent) => {
        if (!onUploadProgress || !progressEvent.total) {
          return;
        }

        const loadedBytes = progressEvent.loaded;
        const totalBytes = progressEvent.total;
        const percent = Math.round((loadedBytes / totalBytes) * 100);

        onUploadProgress({
          loadedBytes,
          totalBytes,
          percent,
        });
      },
    },
  );

  return response.data;
};

export const updateImageMetafields = async ({
  imageId,
  metafields,
}: UpdateImageMetafieldsPayload): Promise<GalleryImage> => {
  const response = await httpClient.patch<GalleryImage>(
    `/images/${imageId}/metafields`,
    metafields,
  );

  return response.data;
};

export const moveImages = async (
  payload: MoveImagesPayload,
): Promise<GalleryImage[]> => {
  const response = await httpClient.patch<GalleryImage[]>(
    "/images/move",
    payload,
  );

  return response.data;
};

export const copyImages = async (
  payload: CopyImagesPayload,
): Promise<GalleryImage[]> => {
  const response = await httpClient.post<GalleryImage[]>(
    "/images/copy",
    payload,
  );

  return response.data;
};

export const deleteImages = async (
  payload: DeleteImagesPayload,
): Promise<void> => {
  await httpClient.delete("/images", {
    params: payload,
    paramsSerializer: {
      indexes: null,
    },
  });
};
