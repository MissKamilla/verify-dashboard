import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import {
  galleryQueryKeys,
  useGalleryQuery,
} from "@/features/gallery/galleryQueries";
import { getGalleryPageState } from "@/features/gallery/getGalleryPageState";
import { GalleryWorkflowPageLayout } from "@/features/gallery/components/GalleryWorkflowPageLayout";
import { EditGalleryForm } from "@/features/gallery/components/EditGalleryForm";
import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";

export function EditGalleryPage() {
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
    <GalleryWorkflowPageLayout
      title="Edit gallery"
      actionTo={`/galleries/${numericGalleryId}/upload-photos`}
      actionLabel="Upload photos"
      actionLinkClassName="w-[250px]"
      footerLeft={<GalleryBackLink to="/galleries" />}
    >
      <EditGalleryForm key={gallery.id} gallery={gallery} />
    </GalleryWorkflowPageLayout>
  );
}
