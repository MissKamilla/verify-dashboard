export type Gallery = {
  id: number;
  title: string;
  description: string;
  userId: number;
  createdAt: string;
};

export type GalleryPreviewImage = {
  id: number;
  path: string;
};

export type GalleryListItem = Gallery & {
  photosCount: number;
  previewImages: GalleryPreviewImage[];
};

export type GalleriesListResponse = {
  items: GalleryListItem[];
  total: number;
  page: number;
  limit: number;
};

export type GetGalleriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "title";
  sortOrder?: "ASC" | "DESC";
};

export type CreateGalleryPayload = {
  title: string;
  description?: string;
};

export type UpdateGalleryPayload = Partial<CreateGalleryPayload>;

export type GalleryFormValues = {
  title: string;
  description: string;
};

export type GalleryFormErrors = Partial<
  Record<keyof GalleryFormValues, string>
>;

export type GallerySortBy = NonNullable<GetGalleriesParams["sortBy"]>;

export type GallerySortOrder = NonNullable<GetGalleriesParams["sortOrder"]>;
