const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const getImageSrc = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.replace(/^\//, "");

  return `${normalizedBaseUrl}/${normalizedPath}`;
};
