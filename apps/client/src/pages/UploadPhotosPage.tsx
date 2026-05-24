import { useState, type FormEvent } from "react";
import { useOutletContext, useParams } from "react-router";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { ImageUploadDropzone } from "@/features/image/components/ImageUploadDropzone";
import { validateImageFiles } from "@/features/image/validateImageFiles";
import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";
import { useUploadGalleryImagesMutation } from "@/features/image/imageQueries";
import { GalleryStatusAlerts } from "@/features/gallery/components/GalleryStatusAlerts";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";

export function UploadPhotosPage() {
  const { galleryId } = useParams();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const uploadImagesMutation = useUploadGalleryImagesMutation();

  const numericGalleryId = Number(galleryId);
  const isValidGalleryId =
    Number.isInteger(numericGalleryId) && numericGalleryId > 0;

  const selectedFilesCount = selectedFiles.length;

  const handleFilesSelect = (files: File[]) => {
    const validationError = validateImageFiles(files);

    setFileError(validationError);

    if (validationError) {
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUploadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setApiError("");
    setSuccessMessage("");

    const validationError = validateImageFiles(selectedFiles);

    setFileError(validationError);

    if (validationError) {
      return;
    }

    uploadImagesMutation.mutate(
      {
        galleryId: numericGalleryId,
        files: selectedFiles,
      },
      {
        onSuccess: () => {
          setSelectedFiles([]);
          setFileError("");
          setSuccessMessage("Photos have been uploaded successfully.");
        },
        onError: (error) => {
          setApiError(getApiErrorMessage(error));
        },
      },
    );
  };

  const isSubmitDisabled =
    !selectedFiles.length || !!fileError || uploadImagesMutation.isPending;

  if (!isValidGalleryId) {
    return (
      <section className="flex min-h-[calc(100vh-60px)] flex-col">
        <div className="flex min-h-[420px] items-center justify-center rounded-[30px] bg-white px-6 text-center shadow-card">
          <div>
            <h1 className="text-2xl font-bold leading-normal text-text-main">
              Invalid gallery
            </h1>

            <GalleryBackLink
              to="/galleries"
              label="Back to galleries"
              variant="brand"
              className="mt-6"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-4 rounded-2xl bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-2xl font-bold leading-normal text-text-main md:text-[32px]">
          Upload photos
        </h1>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-6 w-6" />
        </button>
      </header>

      <div className="flex flex-1 flex-col rounded-[30px] bg-white px-5 py-10 shadow-card sm:p-[30px]">
        <GalleryStatusAlerts
          successMessage={successMessage}
          errorMessage={apiError}
          onCloseSuccess={() => setSuccessMessage("")}
          onCloseError={() => setApiError("")}
        />
        <div className="mx-auto flex w-full max-w-[950px] flex-1 flex-col">
          <h2 className="text-2xl font-bold leading-normal text-text-main">
            Edit And Upload Photos
          </h2>

          <p className="mt-2 text-base leading-normal text-text-secondary">
            You can edit and upload new photos.
          </p>

          <form onSubmit={handleUploadSubmit} noValidate className="mt-[30px]">
            <ImageUploadDropzone
              onFilesSelect={handleFilesSelect}
              disabled={uploadImagesMutation.isPending}
            />

            {fileError && (
              <p
                className="mt-3 text-sm leading-normal text-error"
                role="alert"
              >
                {fileError}
              </p>
            )}

            {selectedFilesCount > 0 && !fileError && (
              <p className="mt-3 text-sm leading-normal text-text-secondary">
                Selected photos: {selectedFilesCount}
              </p>
            )}

            <div className="mt-[30px] w-full max-w-[311px] sm:max-w-[330px]">
              <FormSubmitButton
                text="Upload photos"
                disabled={isSubmitDisabled}
              />
            </div>
          </form>
        </div>
      </div>

      <div className="mt-6 flex shrink-0 items-center justify-between">
        <GalleryBackLink to={`/galleries/${numericGalleryId}/edit`} />

        <CopyrightFooter />
      </div>
    </section>
  );
}
