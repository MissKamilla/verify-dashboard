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
        <h2 className="text-2xl font-bold leading-normal text-text-main">
          Gallery Is Empty
        </h2>

        <p className="mt-2 text-lg font-normal leading-normal text-text-secondary">
          You don&apos;t have any uploaded photos. Please, click on the &quot;Go
          to upload photos&quot; and upload your photos.
        </p>

        <img
          src={galleryEmptyImageUrl}
          alt=""
          className="mt-10 h-[274px] w-[308px] object-contain"
        />

        <GalleryTextLink
          to={`/galleries/${galleryId}/upload-photos`}
          label="GO TO UPLOAD PHOTOS"
          className="mt-7 uppercase"
        />
      </div>
    </div>
  );
}
