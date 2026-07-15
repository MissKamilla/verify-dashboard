export enum GalleryRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export const GALLERY_ACCESS_ROLES = [
  GalleryRole.EDITOR,
  GalleryRole.VIEWER,
] as const;

export type GalleryAccessRole = (typeof GALLERY_ACCESS_ROLES)[number];
