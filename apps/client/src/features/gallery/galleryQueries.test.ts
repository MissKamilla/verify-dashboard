import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CreateGalleryAccessPayload,
  CreateGalleryPayload,
  GetGalleriesParams,
  UpdateGalleryAccessPayload,
  UpdateGalleryPayload,
} from "./types";

const {
  useMutationMock,
  useQueryClientMock,
  useQueryMock,
  invalidateQueriesMock,
  removeQueriesMock,
  createGalleryMock,
  createGalleryAccessMock,
  deleteGalleryMock,
  deleteGalleryAccessMock,
  getGalleriesMock,
  getGalleryAccessesMock,
  getGalleryByIdMock,
  updateGalleryMock,
  updateGalleryAccessMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  useQueryMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  removeQueriesMock: vi.fn(),
  createGalleryMock: vi.fn(),
  createGalleryAccessMock: vi.fn(),
  deleteGalleryMock: vi.fn(),
  deleteGalleryAccessMock: vi.fn(),
  getGalleriesMock: vi.fn(),
  getGalleryAccessesMock: vi.fn(),
  getGalleryByIdMock: vi.fn(),
  updateGalleryMock: vi.fn(),
  updateGalleryAccessMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQuery: useQueryMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("./galleryApi", () => ({
  createGallery: createGalleryMock,
  createGalleryAccess: createGalleryAccessMock,
  deleteGallery: deleteGalleryMock,
  deleteGalleryAccess: deleteGalleryAccessMock,
  getGalleries: getGalleriesMock,
  getGalleryAccesses: getGalleryAccessesMock,
  getGalleryById: getGalleryByIdMock,
  updateGallery: updateGalleryMock,
  updateGalleryAccess: updateGalleryAccessMock,
}));

import {
  galleryQueryKeys,
  useAllGalleriesQuery,
  useCreateGalleryAccessMutation,
  useCreateGalleryMutation,
  useDeleteGalleryAccessMutation,
  useDeleteGalleryMutation,
  useGalleriesQuery,
  useGalleryAccessesQuery,
  useGalleryQuery,
  useUpdateGalleryAccessMutation,
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
    role: "owner" as const,
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

    expect(galleryQueryKeys.accessList(10)).toEqual([
      "gallery",
      "access",
      10,
    ]);
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

  it("configures gallery accesses query", async () => {
    const accessList = [
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

    getGalleryAccessesMock.mockResolvedValue(accessList);

    useGalleryAccessesQuery(10, false);

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      queryFn: () => Promise<unknown>;
      enabled: boolean;
      retry: boolean;
    };

    expect(options.queryKey).toEqual(galleryQueryKeys.accessList(10));
    expect(options.enabled).toBe(false);
    expect(options.retry).toBe(false);

    await expect(options.queryFn()).resolves.toEqual(accessList);

    expect(getGalleryAccessesMock).toHaveBeenCalledWith(10);
  });

  it("invalidates gallery access list after granting access", async () => {
    const variables: {
      galleryId: number;
      payload: CreateGalleryAccessPayload;
    } = {
      galleryId: 10,
      payload: {
        email: "alex@example.com",
        role: "editor",
      },
    };

    createGalleryAccessMock.mockResolvedValue({
      id: 1,
      galleryId: variables.galleryId,
      userId: 20,
      role: variables.payload.role,
      createdAt: "2026-06-09T10:00:00.000Z",
    });

    useCreateGalleryAccessMutation();

    const options = useMutationMock.mock.calls[0]?.[0] as MutationOptions<
      typeof variables
    >;

    await options.mutationFn(variables);

    options.onSuccess(undefined, variables);

    expect(createGalleryAccessMock).toHaveBeenCalledWith(
      variables.galleryId,
      variables.payload,
    );

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.accessList(variables.galleryId),
    });
  });

  it("invalidates gallery access list after updating access role", async () => {
    const variables: {
      galleryId: number;
      userId: number;
      payload: UpdateGalleryAccessPayload;
    } = {
      galleryId: 10,
      userId: 20,
      payload: {
        role: "viewer",
      },
    };

    updateGalleryAccessMock.mockResolvedValue({
      id: 1,
      galleryId: variables.galleryId,
      userId: variables.userId,
      role: variables.payload.role,
      createdAt: "2026-06-09T10:00:00.000Z",
    });

    useUpdateGalleryAccessMutation();

    const options = useMutationMock.mock.calls[0]?.[0] as MutationOptions<
      typeof variables
    >;

    await options.mutationFn(variables);

    options.onSuccess(undefined, variables);

    expect(updateGalleryAccessMock).toHaveBeenCalledWith(
      variables.galleryId,
      variables.userId,
      variables.payload,
    );

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.accessList(variables.galleryId),
    });
  });

  it("invalidates gallery access list after revoking access", async () => {
    const variables = {
      galleryId: 10,
      userId: 20,
    };

    deleteGalleryAccessMock.mockResolvedValue(undefined);

    useDeleteGalleryAccessMutation();

    const options = useMutationMock.mock.calls[0]?.[0] as MutationOptions<
      typeof variables
    >;

    await options.mutationFn(variables);

    options.onSuccess(undefined, variables);

    expect(deleteGalleryAccessMock).toHaveBeenCalledWith(
      variables.galleryId,
      variables.userId,
    );

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: galleryQueryKeys.accessList(variables.galleryId),
    });
  });
});
