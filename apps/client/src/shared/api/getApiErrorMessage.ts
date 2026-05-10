import axios from "axios";

export const getApiErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return "Something went wrong";
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string") {
    return message;
  }

  return "Something went wrong";
};
