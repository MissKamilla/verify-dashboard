import type { GalleryAccessRole } from "@/features/gallery/types";

export type RegisterFormValues = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterFormErrors = Partial<
  Record<keyof RegisterFormValues, string>
>;

export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

export type RegisterPayload = Omit<RegisterFormValues, "confirmPassword">;

export type ForgotPasswordFormValues = {
  email: string;
};

export type ForgotPasswordFormErrors = Partial<
  Record<keyof ForgotPasswordFormValues, string>
>;

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export type ResetPasswordFormErrors = Partial<
  Record<keyof ResetPasswordFormValues, string>
>;

export type RegisterResponse = {
  message: string;
};

export type VerifyEmailPayload = {
  email: string;
  code: string;
};

export type ResendVerificationPayload = {
  email: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};

export type InvitationResponse = {
  email: string;
  galleryTitle: string;
  role: GalleryAccessRole;
};

export type RegisterByInvitePayload = Omit<RegisterPayload, "email"> & {
  token: string;
};
