import { useOutletContext } from "react-router";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { GalleriesContent } from "@/features/gallery/components/GalleriesContent";
import { GalleryActionLink } from "@/features/gallery/components/GalleryActionLink";
import { GalleriesFilters } from "@/features/gallery/components/GalleriesFilters";
import { useGalleriesPage } from "@/features/gallery/hooks/useGalleriesPage";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";

export function GalleriesPage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const {
    galleries,
    totalGalleries,
    totalPages,
    currentPage,
    pageLimit,

    searchValue,
    sortBy,
    sortOrder,
    hasActiveFilters,

    error,
    isPending,
    isError,
    isFetching,

    handleRetry,
    handlePageChange,
    handleSearchChange,
    handleSortByChange,
    handleSortOrderChange,
    handleClearFilters,
  } = useGalleriesPage();

  return (
    <section className="flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden">
      <header className="mb-6 shrink-0 px-[30px] lg:mb-[19px] lg:h-[94px]">
        <div className="flex items-center justify-between lg:h-full">
          <h1 className="text-2xl font-bold leading-normal text-text-main lg:text-[32px]">
            List of galleries
          </h1>

          <GalleryActionLink
            to="/galleries/create"
            label="Create a new gallery"
            className="group hidden min-h-[50px] w-[250px] shrink-0 text-sm leading-none active:bg-brand-active lg:flex"
          />

          <button
            type="button"
            onClick={openMobileSidebar}
            className="flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
            aria-label="Open menu"
          >
            <Icon src={burgerIconUrl} className="h-6 w-6" />
          </button>
        </div>

        <GalleryActionLink
          to="/galleries/create"
          label="Create a new gallery"
          className="group mt-5 flex min-h-[50px] w-full shrink-0 text-sm leading-none active:bg-brand-active lg:hidden"
        />
      </header>

      <GalleriesFilters
        searchValue={searchValue}
        sortBy={sortBy}
        sortOrder={sortOrder}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={handleSearchChange}
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
        onClearFilters={handleClearFilters}
      />

      <GalleriesContent
        galleries={galleries}
        isPending={isPending}
        isError={isError}
        error={error}
        isFetching={isFetching}
        currentPage={currentPage}
        totalGalleries={totalGalleries}
        totalPages={totalPages}
        pageLimit={pageLimit}
        onPageChange={handlePageChange}
        onRetry={handleRetry}
      />

      <CopyrightFooter />
    </section>
  );
}
