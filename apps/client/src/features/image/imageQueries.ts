import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { galleryQueryKeys } from "@/features/gallery/galleryQueries";

import {
  copyImages,
  deleteImages,
  getGalleryImages,
  moveImages,
  updateImageMetafields,
  uploadGalleryImages,
} from "./imageApi";

import type {
  CopyImagesPayload,
  DeleteImagesPayload,
  GetImagesParams,
  MoveImagesPayload,
  UpdateImageMetafieldsPayload,
  UploadGalleryImagesPayload,
} from "./types";

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

      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.lists(),
      });
    },
  });
};

export const useUpdateImageMetafieldsMutation = (galleryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateImageMetafieldsPayload) =>
      updateImageMetafields(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.galleryImages(galleryId),
      });
    },
  });
};

export const useMoveImagesMutation = (sourceGalleryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MoveImagesPayload) => moveImages(payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.galleryImages(sourceGalleryId),
      });

      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.galleryImages(variables.targetGalleryId),
      });

      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.lists(),
      });
    },
  });
};

export const useCopyImagesMutation = (sourceGalleryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CopyImagesPayload) => copyImages(payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.galleryImages(sourceGalleryId),
      });

      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.galleryImages(variables.targetGalleryId),
      });

      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.lists(),
      });
    },
  });
};

export const useDeleteImagesMutation = (galleryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteImagesPayload) => deleteImages(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.galleryImages(galleryId),
      });

      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.lists(),
      });
    },
  });
};
