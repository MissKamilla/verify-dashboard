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
    <section className="flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden">
      <header className="mb-[24px] shrink-0 px-[30px] lg:mb-[19px] lg:h-[94px]">
        <div className="flex items-center justify-between lg:h-full">
          <h1 className="text-[24px] font-bold leading-[150%] text-text-main lg:text-[32px]">
            List of galleries
          </h1>

          <Link
            to="/galleries/create"
            className="group hidden h-[50px] w-[250px] cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[14px] font-bold leading-none text-brand transition-colors hover:border-avatar hover:bg-avatar hover:text-white lg:flex"
          >
            <span>Create a new gallery</span>
            <Icon
              src={arrowRightIconUrl}
              className="h-[12px] w-[15px] text-current"
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
        </div>

        <Link
          to="/galleries/create"
          className="group mt-[20px] flex h-[50px] w-full cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[14px] font-bold leading-none text-brand transition-colors hover:border-avatar hover:bg-avatar hover:text-white lg:hidden"
        >
          <span>Create a new gallery</span>
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] text-current"
          />
        </Link>
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
