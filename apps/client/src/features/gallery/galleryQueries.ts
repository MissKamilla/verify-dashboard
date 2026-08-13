import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createGallery,
  createGalleryAccess,
  deleteGallery,
  deleteGalleryAccess,
  getGalleries,
  getGalleryAccesses,
  getGalleryAccessRecipient,
  getGalleryById,
  revokeGalleryInvitation,
  updateGallery,
  updateGalleryAccess,
} from "./galleryApi";

import type {
  CreateGalleryAccessPayload,
  CreateGalleryPayload,
  GalleryListItem,
  GetGalleriesParams,
  UpdateGalleryAccessPayload,
  UpdateGalleryPayload,
} from "./types";

type UpdateGalleryVariables = {
  id: number;
  payload: UpdateGalleryPayload;
};

type CreateGalleryAccessVariables = {
  galleryId: number;
  payload: CreateGalleryAccessPayload;
};

type UpdateGalleryAccessVariables = {
  galleryId: number;
  userId: number;
  payload: UpdateGalleryAccessPayload;
};

type DeleteGalleryAccessVariables = {
  galleryId: number;
  userId: number;
};

type DeleteGalleryInvitationVariables = {
  galleryId: number;
  invitationId: number;
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
  accesses: () => [...galleryQueryKeys.all, "access"] as const,
  accessList: (galleryId: number) =>
    [...galleryQueryKeys.accesses(), galleryId] as const,
  accessRecipient: (galleryId: number, email: string) =>
    [...galleryQueryKeys.accesses(), galleryId, "recipient", email] as const,
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

export const useGalleryAccessesQuery = (galleryId: number, enabled = true) =>
  useQuery({
    queryKey: galleryQueryKeys.accessList(galleryId),
    queryFn: () => getGalleryAccesses(galleryId),
    enabled,
    retry: false,
  });

export const useCreateGalleryAccessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, payload }: CreateGalleryAccessVariables) =>
      createGalleryAccess(galleryId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.accessList(variables.galleryId),
      });
    },
  });
};

export const useUpdateGalleryAccessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      galleryId,
      userId,
      payload,
    }: UpdateGalleryAccessVariables) =>
      updateGalleryAccess(galleryId, userId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.accessList(variables.galleryId),
      });
    },
  });
};

export const useDeleteGalleryAccessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, userId }: DeleteGalleryAccessVariables) =>
      deleteGalleryAccess(galleryId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.accessList(variables.galleryId),
      });
    },
  });
};

export const useRevokeGalleryInvitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, invitationId }: DeleteGalleryInvitationVariables) =>
      revokeGalleryInvitation(galleryId, invitationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: galleryQueryKeys.accessList(variables.galleryId),
      });
    },
  });
};

export const useGalleryAccessRecipientQuery = (
  galleryId: number,
  email: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: galleryQueryKeys.accessRecipient(galleryId, email),
    queryFn: () => getGalleryAccessRecipient(galleryId, email),
    enabled,
    retry: false,
  });
