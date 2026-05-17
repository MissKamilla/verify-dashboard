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
  totalGalleries: number;
  currentPage: number;
  totalPages: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  onRetry: () => void;
};

export function GalleriesContent({
  galleries,
  totalGalleries,
  currentPage,
  totalPages,
  pageLimit,
  onPageChange,
  isPending,
  isError,
  error,
  isFetching,
  onRetry,
}: GalleriesContentProps) {
  const galleryDelete = useGalleryDelete({
    onDeleteSuccess: () => {
      if (galleries.length === 1 && currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    },
  });

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
          totalGalleries={totalGalleries}
          currentPage={currentPage}
          totalPages={totalPages}
          pageLimit={pageLimit}
          onPageChange={onPageChange}
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
