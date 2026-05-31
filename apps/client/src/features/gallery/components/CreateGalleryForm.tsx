import { Form, Formik } from "formik";

import { ImageUploadDropzone } from "@/features/image/components/ImageUploadDropzone";
import { ImageUploadFormContent } from "@/features/image/components/ImageUploadFormContent";
import { ImageUploadProgress } from "@/features/image/components/ImageUploadProgress";
import { ImageUploadSectionHeader } from "@/features/image/components/ImageUploadSectionHeader";
import { MAX_IMAGES_PER_GALLERY } from "@/features/image/constants";
import { useImageUploadSelection } from "@/features/image/hooks/useImageUploadSelection";
import { useImageUploadSelectionWithMessages } from "@/features/image/hooks/useImageUploadSelectionWithMessages";

import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { StatusAlerts } from "@/shared/ui/StatusAlerts";

import { useCreateGalleryWithImages } from "@/features/gallery/hooks/useCreateGalleryWithImages";
import type { GalleryFormValues } from "@/features/gallery/types";
import { validateGalleryForm } from "@/features/gallery/validateGalleryForm";
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
                <ImageUploadFormContent
                  selectedImages={selectedImages}
                  previewDisabled={isSubmitting}
                  onMetafieldChange={updateMetafield}
                  sideContent={
                    <>
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
                    </>
                  }
                  actions={
                    <>
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
                    </>
                  }
                />
              </Form>
            );
          }}
        </Formik>
      </div>
    </>
  );
}
