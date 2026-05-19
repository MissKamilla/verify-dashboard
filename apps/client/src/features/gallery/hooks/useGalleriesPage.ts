import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  galleryQueryKeys,
  useGalleriesQuery,
} from "@/features/gallery/galleryQueries";

import type {
  GalleriesListResponse,
  GallerySortBy,
  GallerySortOrder,
  GetGalleriesParams,
} from "@/features/gallery/types";

const GALLERIES_PAGE_LIMIT = 10;

const DEFAULT_SORT_BY: GallerySortBy = "createdAt";
const DEFAULT_SORT_ORDER: GallerySortOrder = "DESC";

export function useGalleriesPage() {
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<GallerySortBy>(DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] =
    useState<GallerySortOrder>(DEFAULT_SORT_ORDER);

  const normalizedSearch = searchValue.trim();

  const galleriesParams = useMemo<GetGalleriesParams>(
    () => ({
      page: currentPage,
      limit: GALLERIES_PAGE_LIMIT,
      sortBy,
      sortOrder,
      ...(normalizedSearch ? { search: normalizedSearch } : {}),
    }),
    [currentPage, normalizedSearch, sortBy, sortOrder],
  );

  const query = useGalleriesQuery(galleriesParams);

  const galleriesResponse: GalleriesListResponse | undefined = query.data;

  const galleries = galleriesResponse?.items ?? [];
  const totalGalleries = galleriesResponse?.total ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalGalleries / GALLERIES_PAGE_LIMIT),
  );

  const hasActiveFilters =
    Boolean(normalizedSearch) ||
    sortBy !== DEFAULT_SORT_BY ||
    sortOrder !== DEFAULT_SORT_ORDER;

  const handleRetry = () => {
    void queryClient.invalidateQueries({
      queryKey: galleryQueryKeys.list(galleriesParams),
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleSortByChange = (value: GallerySortBy) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (value: GallerySortOrder) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setSortBy(DEFAULT_SORT_BY);
    setSortOrder(DEFAULT_SORT_ORDER);
    setCurrentPage(1);
  };

  return {
    galleries,
    totalGalleries,
    totalPages,
    currentPage,
    pageLimit: GALLERIES_PAGE_LIMIT,

    searchValue,
    sortBy,
    sortOrder,
    hasActiveFilters,

    error: query.error,
    isPending: query.isPending,
    isError: query.isError,
    isFetching: query.isFetching,

    handleRetry,
    handlePageChange,
    handleSearchChange,
    handleSortByChange,
    handleSortOrderChange,
    handleClearFilters,
  };
}
