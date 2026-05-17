import galleryEmptyImageUrl from "@/assets/gallery-empty.svg";

import { GalleryTextLink } from "./GalleryTextLink";

type GalleryDetailsEmptyStateProps = {
  galleryId: number;
};

export function GalleryDetailsEmptyState({
  galleryId,
}: GalleryDetailsEmptyStateProps) {
  return (
    <div className="flex min-h-[620px] flex-1 items-center justify-center">
      <div className="flex w-full max-w-[460px] flex-col items-center text-center">
        <h2 className="text-[24px] font-bold leading-[150%] text-text-main">
          Gallery Is Empty
        </h2>

        <p className="mt-[8px] text-[18px] font-normal leading-[150%] text-text-secondary">
          You don&apos;t have any uploaded photos. Please, click on the &quot;Go
          to upload photos&quot; and upload your photos.
        </p>

        <img
          src={galleryEmptyImageUrl}
          alt=""
          className="mt-[40px] h-[274px] w-[308px] object-contain"
        />

        <GalleryTextLink
          to={`/galleries/${galleryId}/upload-photos`}
          label="GO TO UPLOAD PHOTOS"
          className="mt-[28px] uppercase"
        />
      </div>
    </div>
  );
}
