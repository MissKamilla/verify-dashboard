import type { FormEvent } from "react";

import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { PhotoPreviewPlaceholderGrid } from "@/shared/ui/PhotoPreviewPlaceholderGrid";
import { ScrollArea } from "@/shared/ui/ScrollArea";
import { StatusAlerts } from "@/shared/ui/StatusAlerts";

import { MAX_IMAGE_SIZE_LABEL, MAX_IMAGES_PER_GALLERY } from "../constants";
import { useUploadImages } from "../hooks/useUploadImages";
import { ImageUploadDropzone } from "./ImageUploadDropzone";
import { ImageUploadPreviewCard } from "./ImageUploadPreviewCard";
import { ImageUploadProgress } from "./ImageUploadProgress";

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
        <h2 className="text-2xl font-bold leading-normal text-text-main">
          Upload Photos
        </h2>

        <p className="mt-2 text-base leading-normal text-text-secondary">
          You can upload one photo or a set of photos.
        </p>

        <form
          onSubmit={handleUploadSubmit}
          noValidate
          className="mt-[30px] flex flex-col md:min-h-0 md:flex-1 md:overflow-hidden"
        >
          <div className="mx-auto grid w-full max-w-[330px] gap-[30px] md:mx-0 md:min-h-0 md:max-w-none md:flex-1 md:grid-cols-[330px_minmax(0,680px)] md:gap-[50px] md:overflow-hidden 2xl:grid-cols-[360px_minmax(0,780px)]">
            <div className="flex flex-col gap-[30px]">
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
            </div>
            {selectedImages.length === 0 ? (
              <PhotoPreviewPlaceholderGrid
                maxImages={MAX_IMAGES_PER_GALLERY}
                maxImageSizeLabel={MAX_IMAGE_SIZE_LABEL}
              />
            ) : (
              <ScrollArea
                itemsCount={selectedImages.length}
                trackBottomOffset={120}
                className="max-md:flex-none max-md:overflow-visible md:h-full md:w-full md:max-w-[680px] md:pr-8 md:pb-[120px] 2xl:max-w-[860px]"
                contentClassName="max-[899px]:h-auto max-[899px]:overflow-visible min-[900px]:pr-8 min-[900px]:pb-[120px]"
                thumbWrapperClassName="min-[900px]:block"
                bottomOverlayClassName="hidden h-[120px] bg-gradient-to-b from-white/0 to-white min-[900px]:block"
              >
                <div className="flex w-full flex-col gap-[30px]">
                  {selectedImages.map((image) => (
                    <ImageUploadPreviewCard
                      key={image.id}
                      id={image.id}
                      previewUrl={image.previewUrl}
                      name={image.metafields.name}
                      comment={image.metafields.comment}
                      disabled={isUploading}
                      onMetafieldChange={updateMetafield}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {selectedImages.length > 0 && (
            <div className="mt-auto flex shrink-0 justify-center gap-[30px] pt-[30px] md:justify-end">
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
            </div>
          )}
        </form>
      </div>
    </>
  );
}
