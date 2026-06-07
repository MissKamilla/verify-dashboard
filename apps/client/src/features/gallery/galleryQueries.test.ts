import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CreateGalleryPayload,
  GetGalleriesParams,
  UpdateGalleryPayload,
} from "./types";

const {
  useMutationMock,
  useQueryClientMock,
  useQueryMock,
  invalidateQueriesMock,
  removeQueriesMock,
  createGalleryMock,
  deleteGalleryMock,
  getGalleriesMock,
  getGalleryByIdMock,
  updateGalleryMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  useQueryMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  removeQueriesMock: vi.fn(),
  createGalleryMock: vi.fn(),
  deleteGalleryMock: vi.fn(),
  getGalleriesMock: vi.fn(),
  getGalleryByIdMock: vi.fn(),
  updateGalleryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQuery: useQueryMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("./galleryApi", () => ({
  createGallery: createGalleryMock,
  deleteGallery: deleteGalleryMock,
  getGalleries: getGalleriesMock,
  getGalleryById: getGalleryByIdMock,
  updateGallery: updateGalleryMock,
}));

import {
  galleryQueryKeys,
  useAllGalleriesQuery,
  useCreateGalleryMutation,
  useDeleteGalleryMutation,
  useGalleriesQuery,
  useGalleryQuery,
  useUpdateGalleryMutation,
} from "./galleryQueries";

type MutationOptions<TVariables> = {
  mutationFn: (variables: TVariables) => Promise<unknown>;
  onSuccess: (data: unknown, variables: TVariables) => void;
};

describe("galleryQueries", () => {
  const gallery = {
    id: 10,
    title: "Nature",
    description: "Summer photos",
    userId: 1,
    createdAt: "2026-06-08T10:00:00.000Z",
    photosCount: 0,
    previewImages: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
      removeQueries: removeQueriesMock,
    });
  });

  it("builds gallery query keys", () => {
    expect(galleryQueryKeys.lists()).toEqual(["gallery", "list"]);

    expect(
      galleryQueryKeys.list({
        page: 2,
      }),
    ).toEqual([
      "gallery",
      "list",
      {
        page: 2,
      },
    ]);

    expect(galleryQueryKeys.allList()).toEqual(["gallery", "list", "all"]);

    expect(galleryQueryKeys.detail(10)).toEqual(["gallery", "detail", 10]);
  });

  it("configures galleries query", async () => {
    const params: GetGalleriesParams = {
      page: 2,
    };

    getGalleriesMock.mockResolvedValue({
      items: [gallery],
      total: 1,
      page: 2,
      limit: 10,
    });

    useGalleriesQuery(params, false);

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      queryFn: () => Promise<unknown>;
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(galleryQueryKeys.list(params));

    expect(options.enabled).toBe(false);

    await options.queryFn();

    expect(getGalleriesMock).toHaveBeenCalledWith(params);
  });

  it("loads all gallery pages", async () => {
    const secondGallery = {
      ...gallery,
      id: 20,
      title: "Travel",
    };

    getGalleriesMock
      .mockResolvedValueOnce({
        items: [gallery],
        total: 2,
        page: 1,
        limit: 50,
      })
      .mockResolvedValueOnce({
        items: [secondGallery],
        total: 2,
        page: 2,
        limit: 50,
      });

    useAllGalleriesQuery(
      {
        search: "photo",
      },
      false,
    );

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
      enabled: boolean;
    };

    await expect(options.queryFn()).resolves.toEqual([gallery, secondGallery]);

    expect(options.enabled).toBe(false);

    expect(getGalleriesMock).toHaveBeenNthCalledWith(1, {
      search: "photo",
      page: 1,
      limit: 50,
    });

    expect(getGalleriesMock).toHaveBeenNthCalledWith(2, {
      search: "photo",
      page: 2,
      limit: 50,
    });
  });

  it("configures gallery details query", async () => {
    getGalleryByIdMock.mockResolvedValue(gallery);

    useGalleryQuery(10, false);

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      queryFn: () => Promise<unknown>;
      enabled: boolean;
      retry: boolean;
    };

    expect(options.queryKey).toEqual(galleryQueryKeys.detail(10));

    expect(options.enabled).toBe(false);

    expect(options.retry).toBe(false);

    await options.queryFn();

    expect(getGalleryByIdMock).toHaveBeenCalledWith(10);
  });

  it("invalidates galleries list after create", async () => {
    const payload: CreateGalleryPayload = {
      title: "Nature",
    };

    createGalleryMock.mockResolvedValue(gallery);

    useCreateGalleryMutation();

    const options = useMutationMock.mock
      .calls[0]?.[0] as MutationOptions<CreateGalleryPayload>;

    await options.mutationFn(payload);

    options.onSuccess(undefined, payload);

    expect(createGalleryMock).toHaveBeenCalledWith(payload);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.lists(),
    });
  });

  it("invalidates list and details after update", async () => {
    const variables: {
      id: number;
      payload: UpdateGalleryPayload;
    } = {
      id: 10,
      payload: {
        title: "Travel",
      },
    };

    updateGalleryMock.mockResolvedValue({
      ...gallery,
      title: "Travel",
    });

    useUpdateGalleryMutation();

    const options = useMutationMock.mock.calls[0]?.[0] as MutationOptions<
      typeof variables
    >;

    await options.mutationFn(variables);

    options.onSuccess(undefined, variables);

    expect(updateGalleryMock).toHaveBeenCalledWith(
      variables.id,
      variables.payload,
    );

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.lists(),
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.detail(10),
    });
  });

  it("invalidates list and removes details query after delete", async () => {
    deleteGalleryMock.mockResolvedValue(undefined);

    useDeleteGalleryMutation();

    const options = useMutationMock.mock
      .calls[0]?.[0] as MutationOptions<number>;

    await options.mutationFn(10);

    options.onSuccess(undefined, 10);

    expect(deleteGalleryMock).toHaveBeenCalledWith(10);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.lists(),
    });

    expect(removeQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.detail(10),
    });
  });
});
