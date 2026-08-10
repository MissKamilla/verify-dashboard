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

export type AuthResponse = {
  token: string;
};
