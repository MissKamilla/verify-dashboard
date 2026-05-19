import galleryEmptyImageUrl from "@/assets/gallery-empty.svg";

import { GalleryTextLink } from "./GalleryTextLink";

export function GalleriesEmptyState() {
  return (
    <div className="flex min-h-[620px] flex-1 items-center justify-center rounded-[30px] bg-white shadow-card">
      <div className="flex w-full max-w-[434px] flex-col items-center text-center">
        <h2 className="text-2xl font-bold leading-normal text-text-main">
          List Of Galleries Is Empty
        </h2>

        <p className="mt-2 text-lg font-normal leading-normal text-text-secondary">
          Company don’t have any galleries. Please, click on the "Create a new
          gallery".
        </p>

        <img
          src={galleryEmptyImageUrl}
          alt=""
          className="mt-10 h-[274px] w-[308px] object-contain"
        />

        <GalleryTextLink
          to="/galleries/create"
          label="CREATE A NEW GALLERY"
          className="mt-7 uppercase"
        />
      </div>
    </div>
  );
}
