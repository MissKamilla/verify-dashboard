export type UserProfile = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  createdAt: string;
};

export type AccountSettingsFormValues = {
  firstname: string;
  lastname: string;
};

export type AccountSettingsFormErrors = Partial<
  Record<keyof AccountSettingsFormValues, string>
>;

export type UpdateProfilePayload = {
  firstname?: string;
  lastname?: string;
  email?: string;
  oldPassword?: string;
  password?: string;
};

export type ChangePasswordFormValues = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type ChangePasswordFormErrors = Partial<
  Record<keyof ChangePasswordFormValues, string>
>;
