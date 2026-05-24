import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getGalleryImages, uploadGalleryImages } from "./imageApi";

import type { GetImagesParams, UploadGalleryImagesPayload } from "./types";

export const imageQueryKeys = {
  all: ["image"] as const,

  galleryImages: (galleryId: number) =>
    [...imageQueryKeys.all, "gallery", galleryId] as const,

  galleryImagesList: (galleryId: number, params?: GetImagesParams) =>
    params
      ? ([...imageQueryKeys.galleryImages(galleryId), "list", params] as const)
      : ([...imageQueryKeys.galleryImages(galleryId), "list"] as const),
};

export const useGalleryImagesQuery = (
  galleryId: number,
  params?: GetImagesParams,
  enabled = true,
) =>
  useQuery({
    queryKey: imageQueryKeys.galleryImagesList(galleryId, params),
    queryFn: () => getGalleryImages(galleryId, params),
    enabled,
    retry: false,
  });

export const useUploadGalleryImagesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadGalleryImagesPayload) =>
      uploadGalleryImages(payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.galleryImages(variables.galleryId),
      });
    },
  });
};
