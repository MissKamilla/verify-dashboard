import { useState } from "react";
import { useOutletContext } from "react-router";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { useAllGalleriesQuery } from "@/features/gallery/galleryQueries";
import { GalleryDetailsEmptyState } from "@/features/gallery/components/GalleryDetailsEmptyState";
import { GalleryActionLink } from "@/features/gallery/components/GalleryActionLink";
import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";
import { useGalleryRouteGallery } from "@/features/gallery/hooks/useGalleryRouteGallery";
import { ScrollArea } from "@/shared/ui/ScrollArea";
import { DeleteImagesModal } from "@/features/image/components/DeleteImagesModal";
import { useDeleteImages } from "@/features/image/hooks/useDeleteImages";
import { useGalleryImagesQuery } from "@/features/image/imageQueries";
import { ImageCard } from "@/features/image/components/ImageCard";
import { ImageGalleryActionModal } from "@/features/image/components/ImageGalleryActionModal";
import { EditImageDetailsModal } from "@/features/image/components/EditImageDetailsModal";
import type { GetImagesParams } from "@/features/image/types";
import { useUpdateImages } from "@/features/image/hooks/useUpdateImages";
import { useImageGalleryAction } from "@/features/image/hooks/useImageGalleryAction";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";
import { SuccessModal } from "@/shared/ui/SuccessModal";

const GALLERY_IMAGES_QUERY_PARAMS = {
  page: 1,
  limit: 50,
} satisfies GetImagesParams;

export function GalleryDetailsPage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const [successModalDescription, setSuccessModalDescription] = useState<
    string | null
  >(null);

  const { gallery, numericGalleryId, isValidGalleryId, galleryPageState } =
    useGalleryRouteGallery();

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
  } = useImageGalleryAction({
    galleryId: numericGalleryId,
    onActionSuccess: (action) => {
      setSuccessModalDescription(
        action === "move"
          ? "Photos have been successfully moved to another gallery."
          : "Photos have been successfully copied to another gallery.",
      );
    },
  });

  const { data: galleries = [], isPending: areGalleriesPending } =
    useAllGalleriesQuery(
      {
        sortBy: "title",
        sortOrder: "ASC",
      },
      isImageGalleryActionModalOpen,
    );

  const {
    imageToEdit,
    editImageError,
    isSaving,
    openEditImageModal,
    closeEditImageModal,
    saveImageDetails,
  } = useUpdateImages({
    galleryId: numericGalleryId,
    onUpdateSuccess: () =>
      setSuccessModalDescription("The changes were successfully saved."),
  });

  const {
    imageIdsToDelete,
    isDeleteImagesModalOpen,
    deleteError,
    isDeleting,
    openDeleteImageModal,
    openDeleteAllImagesModal,
    closeDeleteImagesModal,
    confirmDeleteImages,
  } = useDeleteImages({
    galleryId: numericGalleryId,
    onDeleteSuccess: () =>
      setSuccessModalDescription(
        "Photos have been successfully deleted from the gallery.",
      ),
  });

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

  if (galleryPageState) {
    return galleryPageState;
  }

  if (!gallery) {
    return null;
  }

  const canManageGallery = gallery.role !== "viewer";

  const editableGalleries = galleries.filter((item) => item.role !== "viewer");

  return (
    <section className="flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-4 rounded-2xl bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[32px] font-bold leading-normal text-text-main">
          Gallery
        </h1>

        {canManageGallery && (
          <GalleryActionLink
            to={`/galleries/${numericGalleryId}/upload-photos`}
            label="Upload photos"
            className="hidden min-h-[50px] w-[180px] shrink-0 text-base leading-normal active:bg-brand-active lg:flex"
          />
        )}
        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-6 w-6" />
        </button>
      </header>
      {canManageGallery && (
        <GalleryActionLink
          to={`/galleries/${numericGalleryId}/upload-photos`}
          label="Upload photos"
          className="mb-[13px] flex min-h-[50px] w-full shrink-0 text-base leading-normal active:bg-brand-active lg:hidden"
        />
      )}
      <ScrollArea
        itemsCount={imagesCount}
        trackBottomOffset={70}
        className="rounded-[30px] bg-white shadow-card"
        contentClassName="p-[30px]"
      >
        <div className="w-full">
          <h2 className="text-2xl font-bold leading-normal text-text-main">
            {gallery.title}
          </h2>

          <p className="mt-3 text-base leading-normal text-text-secondary">
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
            <GalleryDetailsEmptyState
              galleryId={numericGalleryId}
              canUpload={canManageGallery}
            />
          ) : (
            <>
              <div className="mt-[30px]">
                <div
                  className="grid gap-5 pt-2"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(max(120px, calc((100% - 120px) / 7)), 1fr))",
                  }}
                >
                  {images.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      canManage={canManageGallery}
                      onEditClick={openEditImageModal}
                      onMoveClick={openMoveImageModal}
                      onCopyClick={openCopyImageModal}
                      onDeleteClick={openDeleteImageModal}
                    />
                  ))}
                </div>
              </div>

              {canManageGallery && (
                <button
                  type="button"
                  onClick={() =>
                    openDeleteAllImagesModal(images.map((image) => image.id))
                  }
                  disabled={isDeleting}
                  className="relative z-20 mt-10 cursor-pointer text-base font-bold leading-normal text-brand hover:text-brand-active"
                >
                  Delete All ({imagesCount})
                </button>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      <div className="mt-6 shrink-0 lg:flex lg:items-center lg:justify-between">
        <GalleryBackLink to="/galleries" />

        <CopyrightFooter className="lg:!mt-0 lg:!pt-0" />
      </div>
      {imageToEdit && (
        <EditImageDetailsModal
          key={imageToEdit.id}
          image={imageToEdit}
          isSaving={isSaving}
          error={editImageError}
          onSave={saveImageDetails}
          onClose={closeEditImageModal}
        />
      )}

      {activeImageGalleryAction && (
        <ImageGalleryActionModal
          isOpen={isImageGalleryActionModalOpen}
          imageAction={activeImageGalleryAction}
          galleries={editableGalleries}
          currentGalleryId={numericGalleryId}
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

      <SuccessModal
        isOpen={Boolean(successModalDescription)}
        title="Success"
        description={successModalDescription ?? ""}
        onClose={() => setSuccessModalDescription(null)}
      />
    </section>
  );
}
