import { Form, Formik } from "formik";

import { ImageUploadFormGrid } from "@/features/image/components/ImageUploadFormGrid";
import { ImageUploadDropzone } from "@/features/image/components/ImageUploadDropzone";
import { ImageUploadProgress } from "@/features/image/components/ImageUploadProgress";
import { ImageUploadPreviewPanel } from "@/features/image/components/ImageUploadPreviewPanel";
import { ImageUploadSectionHeader } from "@/features/image/components/ImageUploadSectionHeader";
import { MAX_IMAGES_PER_GALLERY } from "@/features/image/constants";
import { useImageUploadSelection } from "@/features/image/hooks/useImageUploadSelection";
import { useImageUploadSelectionWithMessages } from "@/features/image/hooks/useImageUploadSelectionWithMessages";

import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { StatusAlerts } from "@/shared/ui/StatusAlerts";

import { useCreateGalleryWithImages } from "../hooks/useCreateGalleryWithImages";
import type { GalleryFormValues } from "../types";
import { validateGalleryForm } from "../validateGalleryForm";
import { GalleryFields } from "./GalleryFields";

const createGalleryInitialValues: GalleryFormValues = {
  title: "",
  description: "",
};

export function CreateGalleryForm() {
  const imageSelection = useImageUploadSelection({
    availableImagesCount: MAX_IMAGES_PER_GALLERY,
  });

  const { selectedImages, validateSelectedFiles, clearSelectedImages } =
    imageSelection;

  const {
    apiError,
    successMessage,
    warningMessage,
    uploadProgress,
    isSubmitting,
    submitCreateGallery,
    deleteSelectedImages,
    clearMessages,
    clearUploadProgress,
    closeSuccess,
    closeError,
    closeWarning: closeCreateGalleryWarning,
    setWarningMessage,
  } = useCreateGalleryWithImages({
    selectedImages,
    validateSelectedFiles,
    clearSelectedImages,
  });

  const {
    fileError,
    selectFiles,
    updateMetafield,
    closeWarning: closeImageSelectionWarning,
  } = useImageUploadSelectionWithMessages({
    imageSelection,
    clearMessages,
    clearWarning: closeCreateGalleryWarning,
    setWarningMessage,
    onSelectionChange: clearUploadProgress,
  });

  return (
    <>
      <StatusAlerts
        successMessage={successMessage}
        errorMessage={apiError}
        warningMessage={warningMessage}
        onCloseSuccess={closeSuccess}
        onCloseError={closeError}
        onCloseWarning={closeImageSelectionWarning}
      />

      <div className="scrollbar-gallery mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto md:min-h-0 md:overflow-hidden">
        <ImageUploadSectionHeader />

        <Formik<GalleryFormValues>
          initialValues={createGalleryInitialValues}
          validate={validateGalleryForm}
          validateOnMount
          onSubmit={(values, { resetForm }) =>
            submitCreateGallery({ values, resetForm })
          }
        >
          {({ values, isValid, dirty }) => {
            const isSubmitDisabled =
              !dirty || !values.title.trim() || !isValid || isSubmitting;

            return (
              <Form
                noValidate
                className="mt-[30px] flex flex-col md:min-h-0 md:flex-1 md:overflow-hidden"
              >
                <ImageUploadFormGrid>
                  <div className="flex flex-col gap-[30px]">
                    <ImageUploadDropzone
                      onFilesSelect={selectFiles}
                      disabled={isSubmitting}
                      hasError={!!fileError}
                    />

                    {uploadProgress && (
                      <ImageUploadProgress
                        loadedBytes={uploadProgress.loadedBytes}
                        percent={uploadProgress.percent}
                        isCompleted={!!successMessage}
                      />
                    )}

                    <GalleryFields
                      descriptionLabel={
                        <>
                          Description{" "}
                          <span className="text-text-secondary">
                            (optional)
                          </span>
                        </>
                      }
                    />
                  </div>

                  <ImageUploadPreviewPanel
                    selectedImages={selectedImages}
                    disabled={isSubmitting}
                    onMetafieldChange={updateMetafield}
                  />
                </ImageUploadFormGrid>

                <div className="mt-auto flex shrink-0 justify-center gap-[30px] pt-[30px] max-md:flex-col-reverse max-md:items-center max-md:gap-4 md:justify-end">
                  {selectedImages.length > 0 && (
                    <button
                      type="button"
                      onClick={deleteSelectedImages}
                      disabled={isSubmitting}
                      className="h-[50px] w-full max-w-[160px] rounded-2xl text-sm font-bold leading-none text-brand disabled:cursor-not-allowed disabled:text-text-secondary"
                    >
                      Delete All
                    </button>
                  )}

                  <div className="w-full max-w-[311px] sm:max-w-[330px] min-[900px]:max-w-[300px]">
                    <FormSubmitButton
                      text="Create a new gallery"
                      disabled={isSubmitDisabled}
                    />
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </>
  );
}
