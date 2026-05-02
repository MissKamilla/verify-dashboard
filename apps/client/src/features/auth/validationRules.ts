export const hasNumber = (value: string) => /\d/.test(value);

export const hasLowercase = (value: string) => /[a-z]/.test(value);

export const hasUppercase = (value: string) => /[A-Z]/.test(value);

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const getNameError = (value: string, fieldLabel: string) => {
  const trimmedValue = value.trim();

  if (trimmedValue.length < 2 || trimmedValue.length > 50) {
    return `${fieldLabel} must be 2-50 characters`;
  }

  if (hasNumber(trimmedValue)) {
    return `${fieldLabel} cannot contain numbers`;
  }

  return "";
};

export const getEmailError = (value: string) => {
  const trimmedValue = value.trim();

  if (!isValidEmail(trimmedValue)) {
    return "Email must be valid";
  }

  return "";
};

export const getStrongPasswordError = (value: string) => {
  if (value.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!hasLowercase(value)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!hasUppercase(value)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!hasNumber(value)) {
    return "Password must contain at least one number";
  }

  return "";
};

export const getRequiredPasswordError = (value: string) => {
  if (!value) {
    return "Password is required";
  }

  return "";
};

export const getConfirmPasswordError = (
  password: string,
  confirmPassword: string,
) => {
  if (confirmPassword !== password) {
    return "Passwords must match";
  }

  return "";
};
