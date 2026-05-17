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

const MOCK_PHOTOS_COUNT = 10;
const hasMockPhotos = MOCK_PHOTOS_COUNT > 0;

export function GalleryDetailsPage() {
  const { galleryId } = useParams();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const queryClient = useQueryClient();

  const numericGalleryId = Number(galleryId);
  const isValidGalleryId =
    Number.isInteger(numericGalleryId) && numericGalleryId > 0;

  const { scrollContainerRef, scrollThumb, updateScrollThumb } =
    useGalleryScrollThumb(MOCK_PHOTOS_COUNT, 70);

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
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-4 rounded-2xl bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[32px] font-bold leading-normal text-text-main">
          {gallery.title}
        </h1>

        <GalleryActionLink
          to={`/galleries/${numericGalleryId}/upload-photos`}
          label="Upload photos"
          className="hidden min-h-[50px] w-[180px] shrink-0 text-base leading-normal active:bg-brand-active lg:flex"
        />

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-6 w-6" />
        </button>
      </header>

      <GalleryActionLink
        to={`/galleries/${numericGalleryId}/upload-photos`}
        label="Upload photos"
        className="mb-[13px] flex min-h-[50px] w-full shrink-0 text-base leading-normal active:bg-brand-active lg:hidden"
      />

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[30px] bg-white shadow-card">
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollThumb}
          className="scrollbar-gallery h-full overflow-y-auto p-[30px]"
        >
          <div className="mx-auto w-full max-w-[320px] lg:max-w-[1099px]">
            <h2 className="px-2 text-2xl font-bold leading-normal text-text-main">
              {gallery.title}
            </h2>

            <p className="mt-3 px-2 text-base leading-normal text-text-secondary">
              {gallery.description || "No description yet..."}
            </p>
            {!hasMockPhotos ? (
              <GalleryDetailsEmptyState galleryId={numericGalleryId} />
            ) : (
              <>
                <div className="mt-[30px]">
                  <div className="grid grid-cols-[repeat(2,minmax(120px,1fr))] gap-x-5 gap-y-[30px] px-2 pt-2 lg:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
                    {Array.from({ length: MOCK_PHOTOS_COUNT }).map(
                      (_, index) => (
                        <GalleryDetailsPhotoCardPlaceholder key={index} />
                      ),
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="relative z-20 ml-[8px] mt-10 cursor-pointer text-base font-bold leading-normal text-brand hover:text-brand-active"
                >
                  Delete All ({MOCK_PHOTOS_COUNT})
                </button>
              </>
            )}
          </div>
        </div>

        {scrollThumb.isVisible && (
          <div className="pointer-events-none absolute top-[30px] right-2.5 bottom-[30px] z-20 hidden w-[3px] lg:block">
            <div
              className="w-full rounded-sm bg-text-muted"
              style={{
                height: `${scrollThumb.height}px`,
                transform: `translateY(${scrollThumb.top}px)`,
              }}
            />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-[70px] bg-gradient-to-b from-white/0 via-white/95 to-white lg:block" />
      </div>

      <div className="mt-6 shrink-0 lg:flex lg:items-center lg:justify-between">
        <GalleryBackLink to="/galleries" />

        <CopyrightFooter className="lg:!mt-0 lg:!pt-0" />
      </div>
    </section>
  );
}
