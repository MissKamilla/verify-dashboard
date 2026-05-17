import { Link } from "react-router";

import galleryPlaceholderIconUrl from "@/assets/gallery-placeholder.svg";

import { useGalleryScrollThumb } from "@/features/gallery/hooks/useGalleryScrollThumb";
import type { Gallery } from "@/features/gallery/types";

import { GalleryActionsMenu } from "./GalleryActionsMenu";

type GalleriesGridProps = {
  galleries: Gallery[];
  onDeleteClick: (gallery: Gallery) => void;
};
const MOCK_PHOTOS_COUNT = 16;

export function GalleriesList({
  galleries,
  onDeleteClick,
}: GalleriesGridProps) {
  const { scrollContainerRef, scrollThumb, updateScrollThumb } =
    useGalleryScrollThumb(galleries.length);

  return (
    <div className="relative min-h-0 flex-1 rounded-[30px] bg-white shadow-card lg:overflow-hidden">
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollThumb}
        className="scrollbar-gallery h-full overflow-y-auto p-[30px] lg:absolute lg:top-[22px] lg:right-[30px] lg:bottom-[30px] lg:left-[30px] lg:h-auto lg:p-0 lg:pt-2 lg:pr-[8px] lg:pb-[72px]"
      >
        <div className="mx-auto grid w-full max-w-[1180px] justify-center grid-cols-1 gap-x-5 gap-y-[30px] sm:grid-cols-[repeat(2,minmax(0,280px))] xl:grid-cols-[repeat(3,minmax(0,280px))] 2xl:grid-cols-[repeat(4,minmax(0,280px))]">
          {galleries.map((gallery) => (
            <article key={gallery.id} className="relative min-w-0">
              <Link
                to={`/galleries/${gallery.id}`}
                className="block rounded-2xl "
              >
                <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gallery-preview">
                  <img
                    src={galleryPlaceholderIconUrl}
                    alt=""
                    className="h-[112px] w-[112px] object-contain"
                  />
                </div>

                <h2 className="mt-2.5 truncate text-lg leading-normal text-text-main">
                  <span className="font-bold">{gallery.title}</span>{" "}
                  <span className="font-normal text-text-secondary">
                    ({MOCK_PHOTOS_COUNT} photos)
                  </span>
                </h2>

                <p className="truncate text-sm font-normal leading-normal text-text-secondary">
                  {gallery.description || "No description yet..."}
                </p>
              </Link>

              <div className="absolute -right-2 -top-2">
                <GalleryActionsMenu
                  gallery={gallery}
                  onDeleteClick={onDeleteClick}
                />
              </div>
            </article>
          ))}
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-[156px] bg-gradient-to-b from-white/0 to-white lg:block" />
    </div>
  );
}
