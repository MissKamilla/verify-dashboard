export const MAIL_QUEUE = 'mail';

export const MAIL_JOBS = {
  VERIFICATION: 'send-verification-email',
  GALLERY_INVITATION: 'send-gallery-invitation',
  GALLERY_SHARED: 'send-gallery-shared-notification',
} as const;
