import type { Gallery } from "@/features/gallery/types";
import { useGalleryDelete } from "@/features/gallery/useGalleryDelete";

import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";
import { PageError } from "@/shared/ui/PageError";
import { PageLoader } from "@/shared/ui/PageLoader";

import { GalleriesEmptyState } from "./GalleriesEmptyState";
import { GalleriesList } from "./GalleriesList";
import { GalleryDeleteDialogs } from "./GalleryDeleteDialogs";

type GalleriesContentProps = {
  galleries: Gallery[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  onRetry: () => void;
};

export function GalleriesContent({
  galleries,
  isPending,
  isError,
  error,
  isFetching,
  onRetry,
}: GalleriesContentProps) {
  const galleryDelete = useGalleryDelete();

  if (isPending || (isError && isUnauthorizedError(error))) {
    return <PageLoader text="Loading galleries..." />;
  }

  if (isError) {
    return (
      <PageError
        title="Couldn’t Load Galleries"
        description="Please try again."
        onAction={onRetry}
        isActionPending={isFetching}
      />
    );
  }

  return (
    <>
      {galleries.length === 0 ? (
        <GalleriesEmptyState />
      ) : (
        <GalleriesList
          galleries={galleries}
          onDeleteClick={galleryDelete.openDeleteModal}
        />
      )}

      <GalleryDeleteDialogs
        galleryToDelete={galleryDelete.galleryToDelete}
        deleteError={galleryDelete.deleteError}
        isDeleting={galleryDelete.isDeleting}
        isSuccessModalOpen={galleryDelete.isSuccessModalOpen}
        onConfirmDelete={galleryDelete.confirmDelete}
        onCloseDeleteModal={galleryDelete.closeDeleteModal}
        onCloseSuccessModal={galleryDelete.closeSuccessModal}
      />
    </>
  );
}
