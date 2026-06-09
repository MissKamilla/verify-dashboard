export type AuthResponseBody = {
  token: string;
};

export type ProfileResponseBody = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
};

export type GalleryResponseBody = {
  id: number;
  title: string;
  description: string;
  userId: number;
  createdAt: string;
};

export type ValidationErrorResponseBody = {
  statusCode: number;
  message: string[];
};

export type ErrorResponseBody = {
  statusCode: number;
  message: string;
};

export type RegisterUserPayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

export type CreateGalleryPayload = {
  title: string;
  description: string;
};

export type GalleryListItemResponseBody = GalleryResponseBody & {
  photosCount: number;
  previewImages: {
    id: number;
    path: string;
  }[];
};

export type GalleriesListResponseBody = {
  items: GalleryListItemResponseBody[];
  total: number;
  page: number;
  limit: number;
};

export type ImageMetafieldsResponseBody = {
  name?: string;
  comment?: string;
};

export type ImageResponseBody = {
  id: number;
  path: string;
  galleryId: number;
  originalFilename: string;
  metafields: ImageMetafieldsResponseBody;
  createdAt: string;
};

export type ImagesListResponseBody = {
  items: ImageResponseBody[];
  total: number;
  page: number;
  limit: number;
};
