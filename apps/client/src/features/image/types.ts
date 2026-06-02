export type ImageMetafields = {
  name?: string;
  comment?: string;
};

export type GalleryImage = {
  id: number;
  path: string;
  galleryId: number;
  originalFilename: string;
  metafields: ImageMetafields;
  createdAt: string;
};

export type ImagesListResponse = {
  items: GalleryImage[];
  total: number;
  page: number;
  limit: number;
};

export type GetImagesParams = {
  page?: number;
  limit?: number;
};

export type UploadGalleryImagesPayload = {
  galleryId: number;
  files: File[];
  metafields?: ImageMetafields[];
  onUploadProgress?: (progress: UploadProgress) => void;
};

export type UpdateImageMetafieldsPayload = {
  imageId: number;
  metafields: ImageMetafields;
};

export type MoveImagesPayload = {
  imageIds: number[];
  targetGalleryId: number;
};

export type CopyImagesPayload = MoveImagesPayload;

export type DeleteImagesPayload = {
  imageIds: number[];
};

export type UploadProgress = {
  loadedBytes: number;
  totalBytes: number;
  percent: number;
};
