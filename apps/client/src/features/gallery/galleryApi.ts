import { httpClient } from "@/shared/api/httpClient";

import type {
  CreateGalleryPayload,
  CreateGalleryAccessPayload,
  CreateGalleryAccessResponse,
  GalleryAccess,
  GalleryAccessListItem,
  GalleryAccessRecipientResponse,
  GalleriesListResponse,
  Gallery,
  GetGalleriesParams,
  UpdateGalleryAccessPayload,
  UpdateGalleryPayload,
} from "./types";

export const getGalleries = async (
  params?: GetGalleriesParams,
): Promise<GalleriesListResponse> => {
  const response = await httpClient.get<GalleriesListResponse>("/galleries", {
    params,
  });

  return response.data;
};

export const getGalleryById = async (id: number): Promise<Gallery> => {
  const response = await httpClient.get<Gallery>(`/galleries/${id}`);

  return response.data;
};

export const createGallery = async (
  payload: CreateGalleryPayload,
): Promise<Gallery> => {
  const response = await httpClient.post<Gallery>("/galleries", payload);

  return response.data;
};

export const updateGallery = async (
  id: number,
  payload: UpdateGalleryPayload,
): Promise<Gallery> => {
  const response = await httpClient.patch<Gallery>(`/galleries/${id}`, payload);

  return response.data;
};

export const deleteGallery = async (id: number): Promise<void> => {
  await httpClient.delete(`/galleries/${id}`);
};

export const getGalleryAccesses = async (
  galleryId: number,
): Promise<GalleryAccessListItem[]> => {
  const response = await httpClient.get<GalleryAccessListItem[]>(
    `/galleries/${galleryId}/access`,
  );

  return response.data;
};

export const createGalleryAccess = async (
  galleryId: number,
  payload: CreateGalleryAccessPayload,
): Promise<CreateGalleryAccessResponse> => {
  const response = await httpClient.post<CreateGalleryAccessResponse>(
    `/galleries/${galleryId}/access`,
    payload,
  );

  return response.data;
};

export const updateGalleryAccess = async (
  galleryId: number,
  userId: number,
  payload: UpdateGalleryAccessPayload,
): Promise<GalleryAccess> => {
  const response = await httpClient.patch<GalleryAccess>(
    `/galleries/${galleryId}/access/${userId}`,
    payload,
  );

  return response.data;
};

export const deleteGalleryAccess = async (
  galleryId: number,
  userId: number,
): Promise<void> => {
  await httpClient.delete(`/galleries/${galleryId}/access/${userId}`);
};

export const getGalleryAccessRecipient = async (
  galleryId: number,
  email: string,
): Promise<GalleryAccessRecipientResponse> => {
  const response = await httpClient.get<GalleryAccessRecipientResponse>(
    `/galleries/${galleryId}/access/recipient`,
    {
      params: {
        email,
      },
    },
  );

  return response.data;
};
