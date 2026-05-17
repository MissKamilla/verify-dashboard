import { Link } from "react-router";

import galleryPlaceholderIconUrl from "@/assets/gallery-placeholder.svg";

import type { Gallery } from "@/features/gallery/types";

import { GalleryActionsMenu } from "./GalleryActionsMenu";

type GalleryCardProps = {
  gallery: Gallery;
  photosCount: number;
  onDeleteClick: (gallery: Gallery) => void;
};

export function GalleryCard({
  gallery,
  photosCount,
  onDeleteClick,
}: GalleryCardProps) {
  return (
    <article className="relative min-w-0">
      <Link to={`/galleries/${gallery.id}`} className="block rounded-2xl">
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
            ({photosCount} photos)
          </span>
        </h2>

        <p className="truncate text-sm font-normal leading-normal text-text-secondary">
          {gallery.description || "No description yet..."}
        </p>
      </Link>

      <div className="absolute -right-2 -top-2">
        <GalleryActionsMenu gallery={gallery} onDeleteClick={onDeleteClick} />
      </div>
    </article>
  );
}
