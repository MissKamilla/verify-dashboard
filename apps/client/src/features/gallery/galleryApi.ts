import { httpClient } from "@/shared/api/httpClient";

import type {
  CreateGalleryPayload,
  GalleriesListResponse,
  Gallery,
  GetGalleriesParams,
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
