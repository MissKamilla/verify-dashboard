import { Link } from "react-router";

import galleryEmptyImageUrl from "@/assets/gallery-empty.svg";

import type { Gallery } from "@/features/gallery/types";

import { GalleryActionsMenu } from "./GalleryActionsMenu";

type GalleriesGridProps = {
  galleries: Gallery[];
  onDeleteClick: (gallery: Gallery) => void;
};

export function GalleriesList({
  galleries,
  onDeleteClick,
}: GalleriesGridProps) {
  return (
    <div className="min-h-[620px] flex-1 rounded-[30px] bg-white p-[30px] shadow-card">
      <div className="grid gap-[24px] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {galleries.map((gallery) => (
          <article key={gallery.id} className="min-w-0">
            <Link
              to={`/galleries/${gallery.id}`}
              className="block rounded-[16px] focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <div className="flex h-[250px] items-center justify-center rounded-[16px] bg-avatar/20">
                <img
                  src={galleryEmptyImageUrl}
                  alt=""
                  className="h-[120px] w-[136px] object-contain"
                />
              </div>

              <h2 className="mt-[12px] truncate text-[18px] font-bold leading-[150%] text-text-main">
                {gallery.title}
              </h2>

              <p className="truncate text-[14px] font-normal leading-[150%] text-text-secondary">
                {gallery.description || "No description yet..."}
              </p>
            </Link>

            <div className="mt-[10px] flex justify-end">
              <GalleryActionsMenu
                gallery={gallery}
                onDeleteClick={onDeleteClick}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
