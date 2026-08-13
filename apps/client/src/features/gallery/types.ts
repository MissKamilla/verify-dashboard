export type Gallery = {
  id: number;
  title: string;
  description: string;
  userId: number;
  role: GalleryRole;
  createdAt: string;
};

export type GalleryRole = "owner" | "editor" | "viewer";

export type GalleryAccessRole = Exclude<GalleryRole, "owner">;

export type GalleryPreviewImage = {
  id: number;
  path: string;
};

export type GalleryListItem = Gallery & {
  photosCount: number;
  previewImages: GalleryPreviewImage[];
};

export type GalleryAccessUser = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  createdAt: string;
};

export type GalleryAccess = {
  id: number;
  galleryId: number;
  userId: number;
  role: GalleryAccessRole;
  createdAt: string;
};

export type GalleryAccessListItem =
  | (GalleryAccess & {
      status: "active";
      user: GalleryAccessUser;
    })
  | {
      id: number;
      galleryId: number;
      email: string;
      role: GalleryAccessRole;
      createdAt: string;
      status: "pending";
    };

export type UpdateGalleryAccessPayload = {
  role: GalleryAccessRole;
};

export type CreateGalleryAccessPayload = UpdateGalleryAccessPayload & {
  email: string;
  sendNotification: boolean;
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

export type GalleryAccessFormValues = {
  email: string;
  role: GalleryAccessRole | "";
};

export type GalleryAccessFormErrors = Partial<
  Record<keyof GalleryAccessFormValues, string>
>;

export type CreateGalleryAccessResponse = {
  status: "access_granted" | "invitation_sent";
};

export type GalleryAccessRecipientResponse = {
  registered: boolean;
};
