import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpClient } from "@/shared/api/httpClient";

import {
  createGallery,
  createGalleryAccess,
  deleteGallery,
  deleteGalleryAccess,
  getGalleries,
  getGalleryById,
  getGalleryAccesses,
  updateGallery,
  updateGalleryAccess,
} from "./galleryApi";

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("galleryApi", () => {
  const gallery = {
    id: 10,
    title: "Nature",
    description: "Summer photos",
    userId: 1,
    role: "owner",
    createdAt: "2026-06-08T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets galleries with query params", async () => {
    const params = {
      page: 2,
      limit: 5,
      search: "nature",
      sortBy: "title" as const,
      sortOrder: "ASC" as const,
    };

    const responseData = {
      items: [
        {
          ...gallery,
          photosCount: 0,
          previewImages: [],
        },
      ],
      total: 1,
      page: 2,
      limit: 5,
    };

    vi.mocked(httpClient.get).mockResolvedValue({
      data: responseData,
    });

    const result = await getGalleries(params);

    expect(httpClient.get).toHaveBeenCalledWith("/galleries", {
      params,
    });

    expect(result).toEqual(responseData);
  });

  it("gets gallery by id", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: gallery,
    });

    const result = await getGalleryById(10);

    expect(httpClient.get).toHaveBeenCalledWith("/galleries/10");

    expect(result).toEqual(gallery);
  });

  it("creates gallery", async () => {
    const payload = {
      title: "Nature",
      description: "Summer photos",
    };

    vi.mocked(httpClient.post).mockResolvedValue({
      data: gallery,
    });

    const result = await createGallery(payload);

    expect(httpClient.post).toHaveBeenCalledWith("/galleries", payload);

    expect(result).toEqual(gallery);
  });

  it("updates gallery", async () => {
    const payload = {
      title: "Travel",
    };

    vi.mocked(httpClient.patch).mockResolvedValue({
      data: {
        ...gallery,
        title: "Travel",
      },
    });

    const result = await updateGallery(10, payload);

    expect(httpClient.patch).toHaveBeenCalledWith("/galleries/10", payload);

    expect(result.title).toBe("Travel");
  });

  it("deletes gallery", async () => {
    vi.mocked(httpClient.delete).mockResolvedValue({
      data: undefined,
    });

    await deleteGallery(10);

    expect(httpClient.delete).toHaveBeenCalledWith("/galleries/10");
  });

  it("gets gallery access list", async () => {
    const accesses = [
      {
        id: 1,
        galleryId: 10,
        userId: 20,
        role: "viewer",
        createdAt: "2026-06-09T10:00:00.000Z",
        user: {
          id: 20,
          firstname: "Alex",
          lastname: "Stone",
          email: "alex@example.com",
          createdAt: "2026-06-01T10:00:00.000Z",
        },
      },
    ];

    vi.mocked(httpClient.get).mockResolvedValue({
      data: accesses,
    });

    const result = await getGalleryAccesses(10);

    expect(httpClient.get).toHaveBeenCalledWith("/galleries/10/access");
    expect(result).toEqual(accesses);
  });

  it("creates gallery access", async () => {
    const payload = {
      email: "alex@example.com",
      role: "editor" as const,
    };

    const access = {
      id: 1,
      galleryId: 10,
      userId: 20,
      role: payload.role,
      createdAt: "2026-06-09T10:00:00.000Z",
    };

    vi.mocked(httpClient.post).mockResolvedValue({
      data: access,
    });

    const result = await createGalleryAccess(10, payload);

    expect(httpClient.post).toHaveBeenCalledWith(
      "/galleries/10/access",
      payload,
    );
    expect(result).toEqual(access);
  });

  it("updates gallery access role", async () => {
    const payload = {
      role: "viewer" as const,
    };

    const access = {
      id: 1,
      galleryId: 10,
      userId: 20,
      role: payload.role,
      createdAt: "2026-06-09T10:00:00.000Z",
    };

    vi.mocked(httpClient.patch).mockResolvedValue({
      data: access,
    });

    const result = await updateGalleryAccess(10, 20, payload);

    expect(httpClient.patch).toHaveBeenCalledWith(
      "/galleries/10/access/20",
      payload,
    );
    expect(result).toEqual(access);
  });

  it("deletes gallery access", async () => {
    vi.mocked(httpClient.delete).mockResolvedValue({
      data: undefined,
    });

    await deleteGalleryAccess(10, 20);

    expect(httpClient.delete).toHaveBeenCalledWith(
      "/galleries/10/access/20",
    );
  });
});
