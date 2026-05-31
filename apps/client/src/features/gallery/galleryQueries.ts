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
  GalleryListItem,
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
  allList: (params?: Omit<GetGalleriesParams, "page" | "limit">) =>
    params
      ? ([...galleryQueryKeys.lists(), "all", params] as const)
      : ([...galleryQueryKeys.lists(), "all"] as const),

  details: () => [...galleryQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...galleryQueryKeys.details(), id] as const,
};

const ALL_GALLERIES_PAGE_LIMIT = 50;

const getAllGalleries = async (
  params?: Omit<GetGalleriesParams, "page" | "limit">,
): Promise<GalleryListItem[]> => {
  const items: GalleryListItem[] = [];
  let page = 1;

  while (true) {
    const response = await getGalleries({
      ...params,
      page,
      limit: ALL_GALLERIES_PAGE_LIMIT,
    });

    items.push(...response.items);

    if (response.items.length === 0 || items.length >= response.total) {
      break;
    }

    page += 1;
  }

  return items;
};

export const useGalleriesQuery = (
  params?: GetGalleriesParams,
  enabled = true,
) =>
  useQuery({
    queryKey: galleryQueryKeys.list(params),
    queryFn: () => getGalleries(params),
    enabled,
  });

export const useAllGalleriesQuery = (
  params?: Omit<GetGalleriesParams, "page" | "limit">,
  enabled = true,
) =>
  useQuery({
    queryKey: galleryQueryKeys.allList(params),
    queryFn: () => getAllGalleries(params),
    enabled,
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
