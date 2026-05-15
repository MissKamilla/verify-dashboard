import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import {
  galleryQueryKeys,
  useGalleryQuery,
} from "@/features/gallery/galleryQueries";
import { getGalleryPageState } from "@/features/gallery/getGalleryPageState";

export function GalleryDetailsPage() {
  const { galleryId } = useParams();

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
      <div className="rounded-[30px] bg-white p-[30px] shadow-card">
        <h1 className="text-[32px] font-bold leading-[150%] text-text-main">
          {gallery.title}
        </h1>

        <p className="mt-[8px] text-[18px] leading-[150%] text-text-secondary">
          {gallery.description || "No description yet..."}
        </p>

        <div className="mt-[32px] flex min-h-[260px] items-center justify-center rounded-[24px] border border-dashed border-border-default">
          <p className="text-[18px] leading-[150%] text-text-secondary">
            Upload images block will be here
          </p>
        </div>
      </div>
    </section>
  );
}
