import { beforeEach, describe, expect, it, vi } from "vitest";

import { galleryQueryKeys } from "@/features/gallery/galleryQueries";

import type {
  CopyImagesPayload,
  DeleteImagesPayload,
  MoveImagesPayload,
  UpdateImageMetafieldsPayload,
  UploadGalleryImagesPayload,
} from "./types";

const {
  useMutationMock,
  useQueryClientMock,
  useQueryMock,
  invalidateQueriesMock,
  copyImagesMock,
  deleteImagesMock,
  getGalleryImagesMock,
  moveImagesMock,
  updateImageMetafieldsMock,
  uploadGalleryImagesMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  useQueryMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  copyImagesMock: vi.fn(),
  deleteImagesMock: vi.fn(),
  getGalleryImagesMock: vi.fn(),
  moveImagesMock: vi.fn(),
  updateImageMetafieldsMock: vi.fn(),
  uploadGalleryImagesMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQuery: useQueryMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("./imageApi", () => ({
  copyImages: copyImagesMock,
  deleteImages: deleteImagesMock,
  getGalleryImages: getGalleryImagesMock,
  moveImages: moveImagesMock,
  updateImageMetafields: updateImageMetafieldsMock,
  uploadGalleryImages: uploadGalleryImagesMock,
}));

import {
  imageQueryKeys,
  useCopyImagesMutation,
  useDeleteImagesMutation,
  useGalleryImagesQuery,
  useMoveImagesMutation,
  useUpdateImageMetafieldsMutation,
  useUploadGalleryImagesMutation,
} from "./imageQueries";

type MutationOptions<TVariables> = {
  mutationFn: (variables: TVariables) => Promise<unknown>;
  onSuccess: (data: unknown, variables: TVariables) => void;
};

describe("imageQueries", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("builds image query keys", () => {
    expect(imageQueryKeys.galleryImages(10)).toEqual(["image", "gallery", 10]);

    expect(imageQueryKeys.galleryImagesList(10)).toEqual([
      "image",
      "gallery",
      10,
      "list",
    ]);

    expect(
      imageQueryKeys.galleryImagesList(10, {
        page: 2,
      }),
    ).toEqual([
      "image",
      "gallery",
      10,
      "list",
      {
        page: 2,
      },
    ]);
  });

  it("configures gallery images query", async () => {
    const params = {
      page: 2,
      limit: 5,
    };

    getGalleryImagesMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      limit: 5,
    });

    useGalleryImagesQuery(10, params, false);

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      queryFn: () => Promise<unknown>;
      enabled: boolean;
      retry: boolean;
    };

    expect(options.queryKey).toEqual(
      imageQueryKeys.galleryImagesList(10, params),
    );

    expect(options.enabled).toBe(false);

    expect(options.retry).toBe(false);

    await options.queryFn();

    expect(getGalleryImagesMock).toHaveBeenCalledWith(10, params);
  });

  it("invalidates image list and galleries after upload", async () => {
    const variables: UploadGalleryImagesPayload = {
      galleryId: 10,
      files: [],
    };

    uploadGalleryImagesMock.mockResolvedValue([]);

    useUploadGalleryImagesMutation();

    const options = useMutationMock.mock
      .calls[0]?.[0] as MutationOptions<UploadGalleryImagesPayload>;

    await options.mutationFn(variables);

    options.onSuccess(undefined, variables);

    expect(uploadGalleryImagesMock).toHaveBeenCalledWith(variables);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: imageQueryKeys.galleryImages(10),
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.lists(),
    });
  });

  it("invalidates image list after metafields update", async () => {
    const payload: UpdateImageMetafieldsPayload = {
      imageId: 100,
      metafields: {
        name: "Lake",
      },
    };

    updateImageMetafieldsMock.mockResolvedValue({});

    useUpdateImageMetafieldsMutation(10);

    const options = useMutationMock.mock
      .calls[0]?.[0] as MutationOptions<UpdateImageMetafieldsPayload>;

    await options.mutationFn(payload);

    options.onSuccess(undefined, payload);

    expect(updateImageMetafieldsMock).toHaveBeenCalledWith(payload);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: imageQueryKeys.galleryImages(10),
    });
  });

  it("invalidates source, target and galleries after move", async () => {
    const payload: MoveImagesPayload = {
      imageIds: [100],
      targetGalleryId: 20,
    };

    moveImagesMock.mockResolvedValue([]);

    useMoveImagesMutation(10);

    const options = useMutationMock.mock
      .calls[0]?.[0] as MutationOptions<MoveImagesPayload>;

    await options.mutationFn(payload);

    options.onSuccess(undefined, payload);

    expect(moveImagesMock).toHaveBeenCalledWith(payload);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: imageQueryKeys.galleryImages(10),
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: imageQueryKeys.galleryImages(20),
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.lists(),
    });
  });

  it("invalidates source, target and galleries after copy", async () => {
    const payload: CopyImagesPayload = {
      imageIds: [100],
      targetGalleryId: 20,
    };

    copyImagesMock.mockResolvedValue([]);

    useCopyImagesMutation(10);

    const options = useMutationMock.mock
      .calls[0]?.[0] as MutationOptions<CopyImagesPayload>;

    await options.mutationFn(payload);

    options.onSuccess(undefined, payload);

    expect(copyImagesMock).toHaveBeenCalledWith(payload);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: imageQueryKeys.galleryImages(10),
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: imageQueryKeys.galleryImages(20),
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.lists(),
    });
  });

  it("invalidates image list and galleries after delete", async () => {
    const payload: DeleteImagesPayload = {
      imageIds: [100],
    };

    deleteImagesMock.mockResolvedValue(undefined);

    useDeleteImagesMutation(10);

    const options = useMutationMock.mock
      .calls[0]?.[0] as MutationOptions<DeleteImagesPayload>;

    await options.mutationFn(payload);

    options.onSuccess(undefined, payload);

    expect(deleteImagesMock).toHaveBeenCalledWith(payload);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: imageQueryKeys.galleryImages(10),
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.lists(),
    });
  });
});
