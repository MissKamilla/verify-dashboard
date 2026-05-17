import { useOutletContext, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import {
  galleryQueryKeys,
  useGalleryQuery,
} from "@/features/gallery/galleryQueries";
import { getGalleryPageState } from "@/features/gallery/getGalleryPageState";
import { GalleryDetailsPhotoCardPlaceholder } from "@/features/gallery/components/GalleryDetailsPhotoCardPlaceholder";
import { useGalleryScrollThumb } from "@/features/gallery/hooks/useGalleryScrollThumb";
import { GalleryDetailsEmptyState } from "@/features/gallery/components/GalleryDetailsEmptyState";
import { GalleryActionLink } from "@/features/gallery/components/GalleryActionLink";
import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";

const mockPhotosCount = 10;
const isGalleryEmpty = mockPhotosCount;

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
    <section className="flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-[16px] rounded-[16px] bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[32px] font-bold leading-[150%] text-text-main">
          {gallery.title}
        </h1>

        <GalleryActionLink
          to={`/galleries/${numericGalleryId}/upload-photos`}
          label="Upload photos"
          className="hidden min-h-[50px] w-[180px] shrink-0 text-[16px] leading-[150%] active:bg-brand-active lg:flex"
        />

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-[24px] w-[24px]" />
        </button>
      </header>

      <GalleryActionLink
        to={`/galleries/${numericGalleryId}/upload-photos`}
        label="Upload photos"
        className="mb-[13px] flex min-h-[50px] w-full shrink-0 text-[16px] leading-[150%] active:bg-brand-active lg:hidden"
      />

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[30px] bg-white shadow-card">
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollThumb}
          className="scrollbar-gallery h-full overflow-y-auto p-[30px]"
        >
          <div className="mx-auto w-full max-w-[320px] lg:max-w-[1099px]">
            <h2 className="px-[8px] text-[24px] font-bold leading-[150%] text-text-main">
              {gallery.title}
            </h2>

            <p className="mt-[12px] px-[8px] text-[16px] leading-[150%] text-text-secondary">
              {gallery.description || "No description yet..."}
            </p>
            {!isGalleryEmpty ? (
              <GalleryDetailsEmptyState galleryId={numericGalleryId} />
            ) : (
              <>
                <div className="mt-[30px]">
                  <div className="grid grid-cols-[repeat(2,minmax(120px,1fr))] gap-x-[20px] gap-y-[30px] px-[8px] pt-[8px] lg:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
                    {Array.from({ length: mockPhotosCount }).map((_, index) => (
                      <GalleryDetailsPhotoCardPlaceholder key={index} />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="relative z-20 ml-[8px] mt-[40px] cursor-pointer text-[16px] font-bold leading-[150%] text-brand hover:text-brand-active"
                >
                  Delete All ({mockPhotosCount})
                </button>
              </>
            )}
          </div>
        </div>

        {scrollThumb.isVisible && (
          <div className="pointer-events-none absolute top-[30px] right-[10px] bottom-[30px] z-20 hidden w-[3px] lg:block">
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

      <div className="mt-[24px] shrink-0 lg:flex lg:items-center lg:justify-between">
        <GalleryBackLink to="/galleries" />

        <CopyrightFooter className="lg:!mt-0 lg:!pt-0" />
      </div>
    </section>
  );
}
