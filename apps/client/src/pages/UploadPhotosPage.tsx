import { useOutletContext, useParams } from "react-router";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { ImageUploadForm } from "@/features/image/components/ImageUploadForm";
import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";

export function UploadPhotosPage() {
  const { galleryId } = useParams();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const numericGalleryId = Number(galleryId);
  const isValidGalleryId =
    Number.isInteger(numericGalleryId) && numericGalleryId > 0;

  if (!isValidGalleryId) {
    return (
      <section className="flex min-h-[calc(100vh-60px)] flex-col">
        <div className="flex min-h-[420px] items-center justify-center rounded-[30px] bg-white px-6 text-center shadow-card">
          <div>
            <h1 className="text-2xl font-bold leading-normal text-text-main">
              Invalid gallery
            </h1>

            <GalleryBackLink
              to="/galleries"
              label="Back to galleries"
              variant="brand"
              className="mt-6"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-4 rounded-2xl bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-2xl font-bold leading-normal text-text-main md:text-[32px]">
          Upload photos
        </h1>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-6 w-6" />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] bg-white px-5 py-10 shadow-card sm:p-[30px]">
        <ImageUploadForm galleryId={numericGalleryId} />
      </div>

      <div className="mt-6 flex shrink-0 items-center justify-between">
        <GalleryBackLink to={`/galleries/${numericGalleryId}/edit`} />

        <CopyrightFooter />
      </div>
    </section>
  );
}
