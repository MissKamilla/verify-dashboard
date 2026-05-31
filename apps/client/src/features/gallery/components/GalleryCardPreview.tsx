import galleryPlaceholderIconUrl from "@/assets/gallery-placeholder.svg";

import { getImageSrc } from "@/features/image/getImageSrc";
import type { GalleryListItem } from "@/features/gallery/types";

type GalleryCardPreviewProps = {
  previewImages: GalleryListItem["previewImages"];
  photosCount: number;
};

const MAX_VISIBLE_PREVIEW_IMAGES = 8;

export function GalleryCardPreview({
  previewImages,
  photosCount,
}: GalleryCardPreviewProps) {
  if (photosCount === 0 || previewImages.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gallery-preview">
        <img
          src={galleryPlaceholderIconUrl}
          alt=""
          className="h-[112px] w-[112px] object-contain"
        />
      </div>
    );
  }

  const visibleImages = previewImages.slice(0, MAX_VISIBLE_PREVIEW_IMAGES);
  const hasHiddenImages = photosCount > MAX_VISIBLE_PREVIEW_IMAGES;

  return (
    <div className="aspect-square w-full rounded-2xl bg-gallery-preview p-5">
      <div className="grid grid-cols-3 gap-2.5">
        {visibleImages.map((image) => (
          <img
            key={image.id}
            src={getImageSrc(image.path)}
            alt=""
            className="aspect-square w-full rounded-lg object-cover"
          />
        ))}

        {hasHiddenImages && (
          <span className="flex aspect-square w-full items-center justify-center text-sm font-bold leading-normal text-text-main">
            +more
          </span>
        )}
      </div>
    </div>
  );
}
