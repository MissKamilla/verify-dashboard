import { Link } from "react-router";

import type { Gallery, GalleryListItem } from "@/features/gallery/types";

import { GalleryActionsMenu } from "./GalleryActionsMenu";
import { GalleryCardPreview } from "./GalleryCardPreview";
import { GalleryRoleBadge } from "./GalleryRoleBadge";

type GalleryCardProps = {
  gallery: GalleryListItem;
  onDeleteClick: (gallery: Gallery) => void;
};

export function GalleryCard({ gallery, onDeleteClick }: GalleryCardProps) {
  const photosLabel = gallery.photosCount === 1 ? "photo" : "photos";
  return (
    <article className="relative min-w-0">
      <Link to={`/galleries/${gallery.id}`} className="block rounded-2xl">
        <GalleryCardPreview
          previewImages={gallery.previewImages}
          photosCount={gallery.photosCount}
        />

        <div className="mt-2.5 flex min-w-0 items-center gap-2">
          <h2 className="min-w-0 flex-1 truncate text-lg leading-normal text-text-main">
            <span className="font-bold">{gallery.title}</span>{" "}
            <span className="font-normal text-text-secondary">
              ({gallery.photosCount} {photosLabel})
            </span>
          </h2>

          <GalleryRoleBadge role={gallery.role} />
        </div>

        <p className="truncate text-sm font-normal leading-normal text-text-secondary">
          {gallery.description || "No description yet..."}
        </p>
      </Link>

      {gallery.role !== "viewer" && (
        <div className="absolute -right-2 -top-2">
          <GalleryActionsMenu gallery={gallery} onDeleteClick={onDeleteClick} />
        </div>
      )}
    </article>
  );
}
