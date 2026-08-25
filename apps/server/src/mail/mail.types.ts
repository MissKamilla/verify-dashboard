export type VerificationEmailJobData = {
  email: string;
  code: string;
};

export type GalleryInvitationEmailJobData = {
  email: string;
  galleryTitle: string;
  token: string;
};

export type GallerySharedEmailJobData = {
  email: string;
  galleryTitle: string;
};
