import type { FormEvent } from "react";

import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { StatusAlerts } from "@/shared/ui/StatusAlerts";

import { useUploadImages } from "@/features/image/hooks/useUploadImages";

import { ImageUploadDropzone } from "./ImageUploadDropzone";
import { ImageUploadFormContent } from "./ImageUploadFormContent";
import { ImageUploadProgress } from "./ImageUploadProgress";
import { ImageUploadSectionHeader } from "./ImageUploadSectionHeader";

type ImageUploadFormProps = {
  galleryId: number;
};

export function ImageUploadForm({ galleryId }: ImageUploadFormProps) {
  const {
    selectedImages,
    fileError,
    apiError,
    successMessage,
    warningMessage,
    uploadProgress,
    isUploading,
    isFilesSelectDisabled,
    isSubmitDisabled,
    selectFiles,
    updateMetafield,
    clearSelectedImages,
    uploadSelectedImages,
    closeWarning,
    closeSuccess,
    closeError,
  } = useUploadImages({ galleryId });

  const handleUploadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    uploadSelectedImages();
  };

  return (
    <>
      <StatusAlerts
        successMessage={successMessage}
        errorMessage={apiError}
        warningMessage={warningMessage}
        onCloseSuccess={closeSuccess}
        onCloseError={closeError}
        onCloseWarning={closeWarning}
      />

      <div className="scrollbar-gallery mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto md:min-h-0 md:overflow-hidden">
        <ImageUploadSectionHeader />

        <form
          onSubmit={handleUploadSubmit}
          noValidate
          className="mt-[30px] flex flex-col md:min-h-0 md:flex-1 md:overflow-hidden"
        >
          <ImageUploadFormContent
            selectedImages={selectedImages}
            previewDisabled={isUploading}
            onMetafieldChange={updateMetafield}
            sideContent={
              <>
                <ImageUploadDropzone
                  onFilesSelect={selectFiles}
                  disabled={isFilesSelectDisabled}
                  hasError={!!fileError}
                />

                {uploadProgress && (
                  <ImageUploadProgress
                    loadedBytes={uploadProgress.loadedBytes}
                    percent={uploadProgress.percent}
                    isCompleted={!!successMessage}
                  />
                )}
              </>
            }
            actions={
              selectedImages.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={clearSelectedImages}
                    disabled={isUploading}
                    className="h-[50px] w-full max-w-[160px] rounded-2xl text-sm font-bold leading-none text-brand disabled:cursor-not-allowed disabled:text-text-secondary"
                  >
                    Delete All
                  </button>

                  <div className="w-full max-w-[180px]">
                    <FormSubmitButton
                      text="Upload All"
                      disabled={isSubmitDisabled}
                    />
                  </div>
                </>
              ) : undefined
            }
          />
        </form>
      </div>
    </>
  );
}
