import galleryEmptyImageUrl from "@/assets/gallery-empty.svg";

import { GalleryTextLink } from "./GalleryTextLink";

type GalleryDetailsEmptyStateProps = {
  galleryId: number;
  canUpload: boolean;
};

export function GalleryDetailsEmptyState({
  galleryId,
  canUpload,
}: GalleryDetailsEmptyStateProps) {
  return (
    <div className="flex min-h-[620px] flex-1 items-center justify-center">
      <div className="flex w-full max-w-[460px] flex-col items-center text-center">
        <h2 className="text-2xl font-bold leading-normal text-text-main">
          Gallery Is Empty
        </h2>

        <p className="mt-2 text-lg font-normal leading-normal text-text-secondary">
          {canUpload
            ? 'You don\'t have any uploaded photos. Please, click on the "Go to upload photos" and upload your photos.'
            : "There are no photos in this gallery yet."}
        </p>

        <img
          src={galleryEmptyImageUrl}
          alt=""
          className="mt-10 h-[274px] w-[308px] object-contain"
        />

        {canUpload && (
          <GalleryTextLink
            to={`/galleries/${galleryId}/upload-photos`}
            label="GO TO UPLOAD PHOTOS"
            className="mt-7 uppercase"
          />
        )}
      </div>
    </div>
  );
}
