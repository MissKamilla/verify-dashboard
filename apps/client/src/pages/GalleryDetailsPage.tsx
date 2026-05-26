import { useOutletContext, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import {
  galleryQueryKeys,
  useGalleryQuery,
} from "@/features/gallery/galleryQueries";
import { getGalleryPageState } from "@/features/gallery/getGalleryPageState";
import { GalleryDetailsEmptyState } from "@/features/gallery/components/GalleryDetailsEmptyState";
import { GalleryActionLink } from "@/features/gallery/components/GalleryActionLink";
import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";
import { ScrollArea } from "@/shared/ui/ScrollArea";
import { DeleteImagesModal } from "@/features/image/components/DeleteImagesModal";
import { useDeleteImages } from "@/features/image/hooks/useDeleteImages";
import { useGalleryImagesQuery } from "@/features/image/imageQueries";
import { ImageCard } from "@/features/image/components/ImageCard";
import { ImageGalleryActionModal } from "@/features/image/components/ImageGalleryActionModal";
import { useGalleriesQuery } from "@/features/gallery/galleryQueries";
import type { GetImagesParams } from "@/features/image/types";
import { useUpdateImages } from "@/features/image/hooks/useUpdateImages";
import { useImageGalleryAction } from "@/features/image/hooks/useImageGalleryAction";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";
import { EditImageDetailsModal } from "@/features/image/components/EditImageDetailsModal";

const GALLERY_IMAGES_QUERY_PARAMS = {
  page: 1,
  limit: 50,
} satisfies GetImagesParams;

export function GalleryDetailsPage() {
  const { galleryId } = useParams();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const queryClient = useQueryClient();

  const numericGalleryId = Number(galleryId);
  const isValidGalleryId =
    Number.isInteger(numericGalleryId) && numericGalleryId > 0;

  const {
    activeImageGalleryAction,
    isImageGalleryActionModalOpen,
    selectedTargetGalleryId,
    imageGalleryActionError,
    isImageGalleryActionSubmitting,
    setSelectedTargetGalleryId,
    openMoveImageModal,
    openCopyImageModal,
    closeImageGalleryActionModal,
    confirmImageGalleryAction,
  } = useImageGalleryAction({ galleryId: numericGalleryId });

  const { data: galleriesData, isPending: areGalleriesPending } =
    useGalleriesQuery(
      {
        page: 1,
        limit: 50,
      },
      isImageGalleryActionModalOpen,
    );

  const targetGalleries = (galleriesData?.items ?? []).filter(
    (targetGallery) => targetGallery.id !== numericGalleryId,
  );

  const {
    imageToEdit,
    editImageError,
    isSaving,
    openEditImageModal,
    closeEditImageModal,
    saveImageDetails,
  } = useUpdateImages({ galleryId: numericGalleryId });

  const {
    imageIdsToDelete,
    isDeleteImagesModalOpen,
    deleteError,
    isDeleting,
    openDeleteImageModal,
    openDeleteAllImagesModal,
    closeDeleteImagesModal,
    confirmDeleteImages,
  } = useDeleteImages({ galleryId: numericGalleryId });

  const {
    data: gallery,
    error,
    isPending,
    isError,
    isFetching,
  } = useGalleryQuery(numericGalleryId, isValidGalleryId);

  const {
    data: imagesData,
    isPending: areImagesPending,
    isError: areImagesError,
  } = useGalleryImagesQuery(
    numericGalleryId,
    GALLERY_IMAGES_QUERY_PARAMS,
    isValidGalleryId,
  );

  const images = imagesData?.items ?? [];
  const imagesCount = imagesData?.total ?? images.length;
  const hasImages = images.length > 0;

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
    <section className="flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-4 rounded-2xl bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[32px] font-bold leading-normal text-text-main">
          {gallery.title}
        </h1>

        <GalleryActionLink
          to={`/galleries/${numericGalleryId}/upload-photos`}
          label="Upload photos"
          className="hidden min-h-[50px] w-[180px] shrink-0 text-base leading-normal active:bg-brand-active lg:flex"
        />

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-6 w-6" />
        </button>
      </header>
      <GalleryActionLink
        to={`/galleries/${numericGalleryId}/upload-photos`}
        label="Upload photos"
        className="mb-[13px] flex min-h-[50px] w-full shrink-0 text-base leading-normal active:bg-brand-active lg:hidden"
      />
      <ScrollArea
        itemsCount={imagesCount}
        trackBottomOffset={70}
        className="rounded-[30px] bg-white shadow-card"
        contentClassName="p-[30px]"
      >
        <div className="mx-auto w-full max-w-[320px] lg:max-w-[1099px]">
          <h2 className="px-2 text-2xl font-bold leading-normal text-text-main">
            {gallery.title}
          </h2>

          <p className="mt-3 px-2 text-base leading-normal text-text-secondary">
            {gallery.description || "No description yet..."}
          </p>

          {areImagesPending ? (
            <p className="mt-[30px] px-2 text-base text-text-secondary">
              Loading photos...
            </p>
          ) : areImagesError ? (
            <p className="mt-[30px] px-2 text-base text-error" role="alert">
              Failed to load photos. Please try again.
            </p>
          ) : !hasImages ? (
            <GalleryDetailsEmptyState galleryId={numericGalleryId} />
          ) : (
            <>
              <div className="mt-[30px]">
                <div className="grid grid-cols-[repeat(2,minmax(120px,1fr))] gap-x-5 gap-y-[30px] px-2 pt-2 lg:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
                  {images.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      onEditClick={openEditImageModal}
                      onMoveClick={openMoveImageModal}
                      onCopyClick={openCopyImageModal}
                      onDeleteClick={openDeleteImageModal}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  openDeleteAllImagesModal(images.map((image) => image.id))
                }
                disabled={isDeleting}
                className="relative z-20 ml-[8px] mt-10 cursor-pointer text-base font-bold leading-normal text-brand hover:text-brand-active"
              >
                Delete All ({imagesCount})
              </button>
            </>
          )}
        </div>
      </ScrollArea>
      <div className="mt-6 shrink-0 lg:flex lg:items-center lg:justify-between">
        <GalleryBackLink to="/galleries" />

        <CopyrightFooter className="lg:!mt-0 lg:!pt-0" />
      </div>
      <EditImageDetailsModal
        isOpen={Boolean(imageToEdit)}
        image={imageToEdit}
        isSaving={isSaving}
        error={editImageError}
        onSave={saveImageDetails}
        onClose={closeEditImageModal}
      />

      {activeImageGalleryAction && (
        <ImageGalleryActionModal
          isOpen={isImageGalleryActionModalOpen}
          action={activeImageGalleryAction}
          galleries={targetGalleries}
          selectedGalleryId={selectedTargetGalleryId}
          isLoading={areGalleriesPending}
          isSubmitting={isImageGalleryActionSubmitting}
          error={imageGalleryActionError}
          onGalleryChange={setSelectedTargetGalleryId}
          onConfirm={confirmImageGalleryAction}
          onClose={closeImageGalleryActionModal}
        />
      )}

      <DeleteImagesModal
        isOpen={isDeleteImagesModalOpen}
        imagesCount={imageIdsToDelete.length}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={confirmDeleteImages}
        onClose={closeDeleteImagesModal}
      />
    </section>
  );
}
