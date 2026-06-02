import { useMemo, useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";

import { GalleryFields } from "@/features/gallery/components/GalleryFields";
import { useUpdateGalleryMutation } from "@/features/gallery/galleryQueries";
import { useEditedImageMetafields } from "@/features/gallery/hooks/useEditedImageMetafields";
import { validateGalleryForm } from "@/features/gallery/validateGalleryForm";
import {
  useGalleryImagesQuery,
  useUpdateImageMetafieldsMutation,
} from "@/features/image/imageQueries";
import { useDeleteImages } from "@/features/image/hooks/useDeleteImages";
import { DeleteImagesModal } from "@/features/image/components/DeleteImagesModal";
import { validateImageMetafields } from "@/features/image/validateImageMetafields";
import { MAX_IMAGES_PER_GALLERY } from "@/features/image/constants";
import { ImageUploadSectionHeader } from "@/features/image/components/ImageUploadSectionHeader";
import { ImageUploadFormGrid } from "@/features/image/components/ImageUploadFormGrid";
import type { GalleryFormValues, Gallery } from "@/features/gallery/types";
import type { GetImagesParams, GalleryImage } from "@/features/image/types";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { StatusAlerts } from "@/shared/ui/StatusAlerts";

import { EditGalleryImagesPanel } from "@/features/gallery/components/EditGalleryImagesPanel";

type EditGalleryFormProps = {
  gallery: Gallery;
};

const EMPTY_IMAGES: GalleryImage[] = [];

const GALLERY_IMAGES_QUERY_PARAMS = {
  page: 1,
  limit: MAX_IMAGES_PER_GALLERY,
} satisfies GetImagesParams;

export function EditGalleryForm({ gallery }: EditGalleryFormProps) {
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  const updateGalleryMutation = useUpdateGalleryMutation();
  const updateImageMetafieldsMutation = useUpdateImageMetafieldsMutation(
    gallery.id,
  );

  const {
    data: imagesData,
    isPending: areImagesPending,
    isError: areImagesError,
  } = useGalleryImagesQuery(gallery.id, GALLERY_IMAGES_QUERY_PARAMS);

  const images = imagesData?.items ?? EMPTY_IMAGES;

  const {
    changedImageMetafields,
    getImageMetafields,
    removeEditedImageMetafields,
    resetEditedImageMetafields,
    updateImageMetafield,
  } = useEditedImageMetafields(images);

  const {
    imageIdsToDelete,
    isDeleteImagesModalOpen,
    deleteError,
    isDeleting,
    openDeleteImageModal,
    closeDeleteImagesModal,
    confirmDeleteImages,
  } = useDeleteImages({
    galleryId: gallery.id,
    onDeleteSuccess: removeEditedImageMetafields,
  });

  const initialValues = useMemo<GalleryFormValues>(
    () => ({
      title: gallery.title,
      description: gallery.description ?? "",
    }),
    [gallery.description, gallery.title],
  );

  const handleSubmit = async (
    values: GalleryFormValues,
    { resetForm }: FormikHelpers<GalleryFormValues>,
  ) => {
    setApiError("");
    setSuccessMessage("");
    setWarningMessage("");

    const updatedGalleryValues = {
      title: values.title.trim(),
      description: values.description.trim(),
    };

    const imageMetafieldsValidationError = validateImageMetafields(
      changedImageMetafields.map(({ metafields }) => metafields),
    );

    if (imageMetafieldsValidationError) {
      setWarningMessage(imageMetafieldsValidationError);
      return;
    }

    const hasGalleryChanges =
      updatedGalleryValues.title !== initialValues.title.trim() ||
      updatedGalleryValues.description !== initialValues.description.trim();

    if (!hasGalleryChanges && changedImageMetafields.length === 0) {
      return;
    }

    try {
      const saveRequests: Promise<unknown>[] = [];

      if (hasGalleryChanges) {
        saveRequests.push(
          updateGalleryMutation.mutateAsync({
            id: gallery.id,
            payload: updatedGalleryValues,
          }),
        );
      }

      saveRequests.push(
        ...changedImageMetafields.map((payload) =>
          updateImageMetafieldsMutation.mutateAsync(payload),
        ),
      );

      await Promise.all(saveRequests);

      resetForm({ values: updatedGalleryValues });
      resetEditedImageMetafields();
      setSuccessMessage("Gallery changes have been saved.");
    } catch (error) {
      setApiError(
        `Some changes could not be saved. ${getApiErrorMessage(error)}`,
      );
    }
  };

  return (
    <>
      <StatusAlerts
        successMessage={successMessage}
        errorMessage={apiError}
        warningMessage={warningMessage}
        onCloseSuccess={() => setSuccessMessage("")}
        onCloseError={() => setApiError("")}
        onCloseWarning={() => setWarningMessage("")}
      />

      <div className="scrollbar-gallery mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto md:min-h-0 md:overflow-hidden">
        <ImageUploadSectionHeader
          title="Edit Description"
          description="You can edit description for your gallery."
        />

        <Formik<GalleryFormValues>
          initialValues={initialValues}
          enableReinitialize
          validate={validateGalleryForm}
          validateOnMount
          onSubmit={handleSubmit}
        >
          {({ values, isValid, dirty, isSubmitting }) => {
            const hasChangedImageMetafields = changedImageMetafields.length > 0;

            const isSaving =
              updateGalleryMutation.isPending ||
              updateImageMetafieldsMutation.isPending ||
              isDeleting ||
              isSubmitting;

            const isSubmitDisabled =
              (!dirty && !hasChangedImageMetafields) ||
              !values.title.trim() ||
              !isValid ||
              isSaving;

            return (
              <Form
                noValidate
                className="mt-[30px] flex flex-col md:min-h-0 md:flex-1 md:overflow-hidden"
              >
                <ImageUploadFormGrid>
                  <div className="shrink-0">
                    <GalleryFields />
                  </div>

                  <EditGalleryImagesPanel
                    images={images}
                    areImagesPending={areImagesPending}
                    areImagesError={areImagesError}
                    disabled={
                      isDeleting || updateImageMetafieldsMutation.isPending
                    }
                    getImageMetafields={getImageMetafields}
                    onMetafieldChange={updateImageMetafield}
                    onRemoveClick={openDeleteImageModal}
                  />
                </ImageUploadFormGrid>

                <div className="mt-auto flex shrink-0 justify-center gap-[30px] pt-[30px] md:justify-end">
                  <div className="w-full max-w-[311px] sm:max-w-[330px] md:max-w-[220px]">
                    <FormSubmitButton
                      text="Save changes"
                      disabled={isSubmitDisabled}
                    />
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>

      <DeleteImagesModal
        isOpen={isDeleteImagesModalOpen}
        imagesCount={imageIdsToDelete.length}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={confirmDeleteImages}
        onClose={closeDeleteImagesModal}
      />
    </>
  );
}
