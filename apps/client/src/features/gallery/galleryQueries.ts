import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createGallery,
  deleteGallery,
  getGalleries,
  getGalleryById,
  updateGallery,
} from "./galleryApi";

import type {
  CreateGalleryPayload,
  GetGalleriesParams,
  UpdateGalleryPayload,
} from "./types";

type UpdateGalleryVariables = {
  id: number;
  payload: UpdateGalleryPayload;
};

export const galleryQueryKeys = {
  all: ["gallery"] as const,

  lists: () => [...galleryQueryKeys.all, "list"] as const,
  list: (params?: GetGalleriesParams) =>
    params
      ? ([...galleryQueryKeys.lists(), params] as const)
      : galleryQueryKeys.lists(),

  details: () => [...galleryQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...galleryQueryKeys.details(), id] as const,
};

export const useGalleriesQuery = (params?: GetGalleriesParams) =>
  useQuery({
    queryKey: galleryQueryKeys.list(params),
    queryFn: () => getGalleries(params),
  });

export const useGalleryQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: galleryQueryKeys.detail(id),
    queryFn: () => getGalleryById(id),
    enabled,
    retry: false,
  });

export const useCreateGalleryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGalleryPayload) => createGallery(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.lists(),
      });
    },
  });
};

export const useUpdateGalleryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateGalleryVariables) =>
      updateGallery(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteGalleryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteGallery(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.lists(),
      });

      queryClient.removeQueries({
        queryKey: galleryQueryKeys.detail(id),
      });
    },
  });
};
