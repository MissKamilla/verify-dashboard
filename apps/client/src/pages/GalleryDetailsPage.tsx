import { Link, useOutletContext, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";
import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import {
  galleryQueryKeys,
  useGalleryQuery,
} from "@/features/gallery/galleryQueries";
import { getGalleryPageState } from "@/features/gallery/getGalleryPageState";
import { GalleryUploadImagesBlock } from "@/features/gallery/components/GalleryUploadImagesBlock";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";

export function GalleryDetailsPage() {
  const { galleryId } = useParams();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const queryClient = useQueryClient();

  const numericGalleryId = Number(galleryId);
  const isValidGalleryId =
    Number.isInteger(numericGalleryId) && numericGalleryId > 0;

  const {
    data: gallery,
    error,
    isPending,
    isError,
    isFetching,
  } = useGalleryQuery(numericGalleryId, isValidGalleryId);

  const handleRetry = () => {
    void queryClient.invalidateQueries({
      queryKey: galleryQueryKeys.detail(numericGalleryId),
    });
  };

  const galleryPageState = getGalleryPageState({
    isValidGalleryId,
    isPending,
    isError: isError || !gallery,
    error,
    isFetching,
    onRetry: handleRetry,
  });

  if (galleryPageState) {
    return galleryPageState;
  }

  if (!gallery) {
    return null;
  }

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col">
      <header className="mb-[13px] flex min-h-[94px] items-center justify-between gap-[16px] rounded-[16px] bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[32px] font-bold leading-[150%] text-text-main">
          {gallery.title}
        </h1>

        <a
          href="#upload-images"
          className="hidden h-[50px] w-[180px] cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[16px] font-bold leading-[150%] text-brand hover:bg-brand-light lg:flex"
        >
          <span>Upload photos</span>
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] text-brand"
          />
        </a>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-[24px] w-[24px]" />
        </button>
      </header>

      <div className="flex-1 rounded-[30px] bg-white p-[30px] shadow-card">
        <h2 className="text-[24px] font-bold leading-[150%] text-text-main">
          {gallery.title}
        </h2>

        <p className="mt-[12px] max-w-[760px] text-[16px] leading-[150%] text-text-secondary">
          {gallery.description || "No description yet..."}
        </p>

        <GalleryUploadImagesBlock />
      </div>

      <div className="mt-[24px] flex items-center justify-between">
        <Link
          to="/galleries"
          className="text-[16px] font-bold leading-[150%] text-text-main hover:text-brand"
        >
          ‹ Back
        </Link>
      </div>

      <CopyrightFooter />
    </section>
  );
}
