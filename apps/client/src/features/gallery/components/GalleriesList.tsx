import { useGalleryScrollThumb } from "@/features/gallery/hooks/useGalleryScrollThumb";
import type { Gallery } from "@/features/gallery/types";

import { GalleriesPagination } from "./GalleriesPagination";
import { GalleryCard } from "./GalleryCard";

type GalleriesListProps = {
  galleries: Gallery[];
  totalGalleries: number;
  currentPage: number;
  totalPages: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
  onDeleteClick: (gallery: Gallery) => void;
};

const MOCK_PHOTOS_COUNT = 16;

export function GalleriesList({
  galleries,
  totalGalleries,
  currentPage,
  totalPages,
  pageLimit,
  onPageChange,
  onDeleteClick,
}: GalleriesListProps) {
  const { scrollContainerRef, scrollThumb, updateScrollThumb } =
    useGalleryScrollThumb(galleries.length);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] bg-white shadow-card lg:block">
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollThumb}
        className="scrollbar-gallery min-h-0 flex-1 overflow-y-auto p-[30px] lg:absolute lg:inset-x-[30px] lg:top-[22px] lg:bottom-[92px] lg:h-auto lg:p-0 lg:pt-2 lg:pr-2"
      >
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 justify-center gap-x-5 gap-y-[30px] sm:grid-cols-[repeat(2,minmax(0,280px))] xl:grid-cols-[repeat(3,minmax(0,280px))] 2xl:grid-cols-[repeat(4,minmax(0,280px))]">
          {galleries.map((gallery) => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              photosCount={MOCK_PHOTOS_COUNT}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[92px] z-10 hidden h-[120px] bg-gradient-to-b from-white/0 to-white lg:block" />

      <GalleriesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        shownItemsCount={Math.min(currentPage * pageLimit, totalGalleries)}
        totalItems={totalGalleries}
        onPageChange={onPageChange}
      />

      {scrollThumb.isVisible && (
        <div className="pointer-events-none absolute right-2.5 top-[30px] bottom-[92px] z-20 hidden w-[3px] lg:block">
          <div
            className="w-full rounded-sm bg-text-muted"
            style={{
              height: `${scrollThumb.height}px`,
              transform: `translateY(${scrollThumb.top}px)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
