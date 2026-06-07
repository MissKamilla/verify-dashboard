import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpClient } from "@/shared/api/httpClient";

import {
  copyImages,
  deleteImages,
  getGalleryImages,
  moveImages,
  updateImageMetafields,
  uploadGalleryImages,
} from "./imageApi";

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

type UploadRequestConfig = {
  onUploadProgress: (event: { loaded: number; total?: number }) => void;
};

describe("imageApi", () => {
  const image = {
    id: 100,
    path: "/uploads/images/lake.png",
    galleryId: 10,
    originalFilename: "lake.png",
    metafields: {
      name: "Lake",
      comment: "Summer photo",
    },
    createdAt: "2026-06-08T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets gallery images with params", async () => {
    const params = {
      page: 2,
      limit: 5,
    };

    const responseData = {
      items: [image],
      total: 1,
      page: 2,
      limit: 5,
    };

    vi.mocked(httpClient.get).mockResolvedValue({
      data: responseData,
    });

    const result = await getGalleryImages(10, params);

    expect(httpClient.get).toHaveBeenCalledWith("/galleries/10/images", {
      params,
    });

    expect(result).toEqual(responseData);
  });

  it("uploads files with metafields and reports progress", async () => {
    const files = [
      new File(["lake"], "lake.png", {
        type: "image/png",
      }),
      new File(["forest"], "forest.jpg", {
        type: "image/jpeg",
      }),
    ];

    const metafields = [
      {
        name: "Lake",
      },
      {
        name: "Forest",
      },
    ];

    const onUploadProgress = vi.fn();

    vi.mocked(httpClient.post).mockResolvedValue({
      data: [image],
    });

    const uploadPromise = uploadGalleryImages({
      galleryId: 10,
      files,
      metafields,
      onUploadProgress,
    });

    const formData = vi.mocked(httpClient.post).mock.calls[0]?.[1] as FormData;

    const requestConfig = vi.mocked(httpClient.post).mock
      .calls[0]?.[2] as UploadRequestConfig;

    expect(httpClient.post).toHaveBeenCalledWith(
      "/galleries/10/images",
      expect.any(FormData),
      expect.objectContaining({
        onUploadProgress: expect.any(Function),
      }),
    );

    expect(formData.getAll("images")).toEqual(files);

    expect(formData.get("metafields")).toBe(JSON.stringify(metafields));

    requestConfig.onUploadProgress({
      loaded: 25,
      total: 100,
    });

    expect(onUploadProgress).toHaveBeenCalledWith({
      loadedBytes: 25,
      totalBytes: 100,
      percent: 25,
    });

    await expect(uploadPromise).resolves.toEqual([image]);
  });

  it("does not append metafields when they are missing", async () => {
    const files = [
      new File(["lake"], "lake.png", {
        type: "image/png",
      }),
    ];

    vi.mocked(httpClient.post).mockResolvedValue({
      data: [image],
    });

    const uploadPromise = uploadGalleryImages({
      galleryId: 10,
      files,
    });

    const formData = vi.mocked(httpClient.post).mock.calls[0]?.[1] as FormData;

    const requestConfig = vi.mocked(httpClient.post).mock
      .calls[0]?.[2] as UploadRequestConfig;

    expect(formData.get("metafields")).toBeNull();

    requestConfig.onUploadProgress({
      loaded: 10,
      total: 0,
    });

    await expect(uploadPromise).resolves.toEqual([image]);
  });

  it("updates image metafields", async () => {
    const payload = {
      imageId: 100,
      metafields: {
        name: "Updated lake",
      },
    };

    vi.mocked(httpClient.patch).mockResolvedValue({
      data: {
        ...image,
        metafields: payload.metafields,
      },
    });

    const result = await updateImageMetafields(payload);

    expect(httpClient.patch).toHaveBeenCalledWith(
      "/images/100/metafields",
      payload.metafields,
    );

    expect(result.metafields).toEqual(payload.metafields);
  });

  it("moves images", async () => {
    const payload = {
      imageIds: [100],
      targetGalleryId: 20,
    };

    vi.mocked(httpClient.patch).mockResolvedValue({
      data: [
        {
          ...image,
          galleryId: 20,
        },
      ],
    });

    const result = await moveImages(payload);

    expect(httpClient.patch).toHaveBeenCalledWith("/images/move", payload);

    expect(result[0]?.galleryId).toBe(20);
  });

  it("copies images", async () => {
    const payload = {
      imageIds: [100],
      targetGalleryId: 20,
    };

    vi.mocked(httpClient.post).mockResolvedValue({
      data: [
        {
          ...image,
          id: 200,
          galleryId: 20,
        },
      ],
    });

    const result = await copyImages(payload);

    expect(httpClient.post).toHaveBeenCalledWith("/images/copy", payload);

    expect(result[0]?.id).toBe(200);
  });

  it("deletes images with query params serializer", async () => {
    const payload = {
      imageIds: [100, 200],
    };

    vi.mocked(httpClient.delete).mockResolvedValue({
      data: undefined,
    });

    await deleteImages(payload);

    expect(httpClient.delete).toHaveBeenCalledWith("/images", {
      params: payload,
      paramsSerializer: {
        indexes: null,
      },
    });
  });
});
