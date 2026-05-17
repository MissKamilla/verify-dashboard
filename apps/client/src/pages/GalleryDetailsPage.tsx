import { Link, useOutletContext, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";
import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import {
  galleryQueryKeys,
  useGalleryQuery,
} from "@/features/gallery/galleryQueries";
import { getGalleryPageState } from "@/features/gallery/getGalleryPageState";
import { GalleryDetailsPhotoCardPlaceholder } from "@/features/gallery/components/GalleryDetailsPhotoCardPlaceholder";
import { useGalleryScrollThumb } from "@/features/gallery/hooks/useGalleryScrollThumb";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";

const mockPhotosCount = 16;

export function GalleryDetailsPage() {
  const { galleryId } = useParams();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const queryClient = useQueryClient();

  const numericGalleryId = Number(galleryId);
  const isValidGalleryId =
    Number.isInteger(numericGalleryId) && numericGalleryId > 0;

  const { scrollContainerRef, scrollThumb, updateScrollThumb } =
    useGalleryScrollThumb(mockPhotosCount, 70);

  const {
    data: gallery,
    error,
    isPending,
    isError,
    isFetching,
  } = useGalleryQuery(numericGalleryId, isValidGalleryId);

  const handleRetry = () => {
    void queryClient.invalidateQueries({
      queryKey: galleryQueryKeys.detail(numericGalleryId),
    });
  };

  const galleryPageState = getGalleryPageState({
    isValidGalleryId,
    isPending,
    isError: isError || !gallery,
    error,
    isFetching,
    onRetry: handleRetry,
  });

  if (galleryPageState) {
    return galleryPageState;
  }

  if (!gallery) {
    return null;
  }

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col lg:h-[calc(100vh-60px)] lg:min-h-0 lg:overflow-hidden">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-[16px] rounded-[16px] bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[32px] font-bold leading-[150%] text-text-main">
          {gallery.title}
        </h1>

        <a
          href="#upload-images"
          className="hidden h-[50px] w-[180px] cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[16px] font-bold leading-[150%] text-brand hover:bg-brand-light lg:flex"
        >
          <span>Upload photos</span>
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] text-brand"
          />
        </a>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-[24px] w-[24px]" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col rounded-[30px] bg-white p-[30px] shadow-card lg:overflow-hidden">
        <div className="mx-auto flex min-h-0 w-full max-w-[320px] flex-1 flex-col lg:max-w-[1099px]">
          <h2 className="shrink-0 px-[8px] text-[24px] font-bold leading-[150%] text-text-main">
            {gallery.title}
          </h2>

          <p className="mt-[12px] shrink-0 px-[8px] text-[16px] leading-[150%] text-text-secondary">
            {gallery.description || "No description yet..."}
          </p>

          <div className="relative mt-[30px] min-h-0 flex-1 overflow-hidden lg:pr-[18px]">
            <div
              ref={scrollContainerRef}
              onScroll={updateScrollThumb}
              className="scrollbar-gallery overflow-x-hidden pb-[70px] lg:h-full lg:overflow-y-auto"
            >
              <div className="grid grid-cols-[repeat(2,minmax(120px,1fr))] gap-x-[20px] gap-y-[30px] px-[8px] pt-[8px] lg:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
                {Array.from({ length: mockPhotosCount }).map((_, index) => (
                  <GalleryDetailsPhotoCardPlaceholder key={index} />
                ))}
              </div>
            </div>

            {scrollThumb.isVisible && (
              <div className="pointer-events-none absolute bottom-[70px] right-0 top-0 z-20 hidden w-[3px] lg:block">
                <div
                  className="w-full rounded-[2px] bg-text-muted"
                  style={{
                    height: `${scrollThumb.height}px`,
                    transform: `translateY(${scrollThumb.top}px)`,
                  }}
                />
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-[70px] bg-gradient-to-b from-white/0 via-white/95 to-white lg:block" />
          </div>

          <button
            type="button"
            className="z-20 ml-[8px] mt-[20px] shrink-0 cursor-pointer self-start text-[16px] font-bold leading-[150%] text-brand hover:text-brand-active"
          >
            Delete All ({mockPhotosCount})
          </button>
        </div>
      </div>

      <div className="mt-[24px] shrink-0 lg:flex lg:items-center lg:justify-between">
        <Link
          to="/galleries"
          className="inline-flex items-center gap-[8px] text-[16px] font-bold leading-[150%] text-text-main hover:text-brand"
        >
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] rotate-180 text-current"
          />
          <span>Back</span>
        </Link>

        <CopyrightFooter className="lg:!mt-0 lg:!pt-0" />
      </div>
    </section>
  );
}
