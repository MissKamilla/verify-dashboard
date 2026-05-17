import { useOutletContext, useParams } from "react-router";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { GalleryUploadDropzonePlaceholder } from "@/features/gallery/components/GalleryUploadDropzonePlaceholder";
import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";

{
  /* This page is a temporary placeholder. Upload photos functionality and final layout will be implemented later. */
}
export function UploadPhotosPage() {
  const { galleryId } = useParams();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const numericGalleryId = Number(galleryId);
  const isValidGalleryId =
    Number.isInteger(numericGalleryId) && numericGalleryId > 0;

  if (!isValidGalleryId) {
    return (
      <section className="flex min-h-[calc(100vh-60px)] flex-col">
        <div className="flex min-h-[420px] items-center justify-center rounded-[30px] bg-white px-[24px] text-center shadow-card">
          <div>
            <h1 className="text-[24px] font-bold leading-[150%] text-text-main">
              Invalid gallery
            </h1>

            <GalleryBackLink
              to="/galleries"
              label="Back to galleries"
              variant="brand"
              className="mt-[24px]"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-[16px] rounded-[16px] bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[24px] font-bold leading-[150%] text-text-main md:text-[32px]">
          Upload photos
        </h1>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-[24px] w-[24px]" />
        </button>
      </header>

      <div className="flex flex-1 flex-col rounded-[30px] bg-white px-[20px] py-[40px] shadow-card sm:p-[30px]">
        <div className="mx-auto flex w-full max-w-[950px] flex-1 flex-col">
          <h2 className="text-[24px] font-bold leading-[150%] text-text-main">
            Edit And Upload Photos
          </h2>

          <p className="mt-[8px] text-[16px] leading-[150%] text-text-secondary">
            You can edit and upload new photos.
          </p>

          <div className="mt-[30px]">
            <GalleryUploadDropzonePlaceholder />
          </div>
        </div>
      </div>

      <div className="mt-[24px] flex shrink-0 items-center justify-between">
        <GalleryBackLink to={`/galleries/${numericGalleryId}/edit`} />

        <CopyrightFooter />
      </div>
    </section>
  );
}
