import { Link, useOutletContext } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import burgerIconUrl from "@/assets/icons/burger.svg";
import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";
import { GalleriesContent } from "@/features/gallery/components/GalleriesContent";

import {
  galleryQueryKeys,
  useGalleriesQuery,
} from "@/features/gallery/galleryQueries";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";

const DEFAULT_GALLERIES_PARAMS = {
  page: 1,
  limit: 10,
};

export function GalleriesPage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const queryClient = useQueryClient();

  const {
    data: galleriesResponse,
    error,
    isPending,
    isError,
    isFetching,
  } = useGalleriesQuery(DEFAULT_GALLERIES_PARAMS);

  const handleRetry = () => {
    void queryClient.invalidateQueries({
      queryKey: galleryQueryKeys.list(DEFAULT_GALLERIES_PARAMS),
    });
  };

  const galleries = galleriesResponse?.items ?? [];

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col">
      <header className="mb-[13px] flex h-[94px] items-center justify-between rounded-[16px] bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[32px] font-bold leading-[150%] text-text-main">
          List of galleries
        </h1>

        <Link
          to="/galleries/create"
          className="hidden h-[50px] w-[250px] cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[16px] font-bold leading-[150%] text-brand lg:flex"
        >
          <span>Create a new gallery</span>
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] text-brand"
          />
        </Link>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-[24px] w-[24px]" />
        </button>
      </header>

      <GalleriesContent
        galleries={galleries}
        isPending={isPending}
        isError={isError}
        error={error}
        isFetching={isFetching}
        onRetry={handleRetry}
      />

      <CopyrightFooter />
    </section>
  );
}
