import { ScrollArea } from "@/shared/ui/ScrollArea";
import type { Gallery, GalleryListItem } from "@/features/gallery/types";

import { GalleriesPagination } from "./GalleriesPagination";
import { GalleryCard } from "./GalleryCard";

type GalleriesListProps = {
  galleries: GalleryListItem[];
  totalGalleries: number;
  currentPage: number;
  totalPages: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
  onShareClick: (gallery: Gallery) => void;
  onDeleteClick: (gallery: Gallery) => void;
};

export function GalleriesList({
  galleries,
  totalGalleries,
  currentPage,
  totalPages,
  pageLimit,
  onPageChange,
  onShareClick,
  onDeleteClick,
}: GalleriesListProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] bg-white shadow-card lg:block">
      <ScrollArea
        itemsCount={galleries.length}
        trackBottomOffset={120}
        className="lg:absolute lg:inset-x-[30px] lg:top-[22px] lg:bottom-[92px] lg:h-auto lg:p-0 lg:pt-2 lg:pr-4"
        contentClassName="scrollbar-gallery min-h-0 flex-1 overflow-y-auto p-[30px] lg:p-0 lg:pt-2 lg:pr-4"
        thumbWrapperClassName="pointer-events-none absolute right-2 top-[30px] bottom-[92px] z-20 hidden w-[3px] lg:block"
        bottomOverlayClassName="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-[120px] bg-gradient-to-b from-white/0 to-white lg:block"
      >
        <div
          className="grid w-full gap-x-5 gap-y-[30px] pb-[70px]"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(max(235px, calc((100% - 80px) / 5)), 1fr))",
          }}
        >
          {galleries.map((gallery) => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              onShareClick={onShareClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      </ScrollArea>

      <GalleriesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        shownItemsCount={Math.min(currentPage * pageLimit, totalGalleries)}
        totalItems={totalGalleries}
        onPageChange={onPageChange}
      />
    </div>
  );
}
