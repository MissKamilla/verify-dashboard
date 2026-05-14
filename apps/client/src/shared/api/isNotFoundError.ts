import axios from "axios";

export const isNotFoundError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return error.response?.status === 404;
};
