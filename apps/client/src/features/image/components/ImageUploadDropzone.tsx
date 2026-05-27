import { useRef, type ChangeEvent, type DragEvent } from "react";

import galleryUploadPlaceholderIconUrl from "@/assets/icons/gallery-upload-placeholder.svg";
import uploadIconUrl from "@/assets/icons/upload.svg";

import { Icon } from "@/shared/ui/Icon";

import {
  ALLOWED_IMAGE_FORMATS_LABEL,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_LABEL,
} from "../constants";

type ImageUploadDropzoneProps = {
  onFilesSelect: (files: File[]) => void;
  disabled?: boolean;
  hasError?: boolean;
};

export function ImageUploadDropzone({
  onFilesSelect,
  disabled = false,
  hasError = false,
}: ImageUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  };

  const handleFilesSelect = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    onFilesSelect(Array.from(fileList));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFilesSelect(event.target.files);

    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    handleFilesSelect(event.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative flex h-[318px] w-full max-w-[311px] flex-col items-center rounded-[30px] p-[40px] text-center sm:h-[322px] sm:max-w-[330px] sm:p-9 ${
        hasError ? "bg-alert-error-bg" : "bg-image-preview"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 330 322"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect
          x="0.5"
          y="0.5"
          width="329"
          height="321"
          rx="30"
          fill="none"
          stroke={hasError ? "var(--color-error)" : "var(--color-brand)"}
          strokeWidth="1"
          strokeDasharray="8 8"
        />
      </svg>

      <Icon
        src={galleryUploadPlaceholderIconUrl}
        className="h-[92px] w-[92px] text-text-muted lg:h-16 lg:w-16"
      />

      <p className="mt-5 text-base font-bold leading-normal text-text-muted">
        <span className="hidden lg:inline">Drag and drop photo here</span>
        <span className="lg:hidden">Upload photo here</span>
      </p>

      <p className="mt-1.5 text-[10px] font-normal leading-normal text-text-muted lg:mt-2.5 lg:text-xs">
        {ALLOWED_IMAGE_FORMATS_LABEL} (max {MAX_IMAGE_SIZE_LABEL} / picture)
      </p>

      <div className="mt-5 hidden w-full items-center gap-4 lg:flex">
        <span className="h-px flex-1 bg-border-default" />
        <span className="text-base font-bold leading-normal text-text-muted">
          OR
        </span>
        <span className="h-px flex-1 bg-border-default" />
      </div>

      <button
        type="button"
        onClick={handleUploadClick}
        disabled={disabled}
        aria-disabled={disabled}
        className={`mt-6 flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-bold leading-none lg:mt-5 ${
          hasError
            ? "bg-border-default text-text-secondary hover:bg-border-default active:bg-border-default"
            : "bg-brand text-white hover:bg-avatar active:bg-brand-active"
        } disabled:cursor-not-allowed disabled:bg-border-default disabled:text-text-secondary disabled:hover:bg-border-default disabled:active:bg-border-default`}
      >
        <Icon src={uploadIconUrl} className="h-[19px] w-[19px]" />
        <span>Upload</span>
      </button>
    </div>
  );
}
