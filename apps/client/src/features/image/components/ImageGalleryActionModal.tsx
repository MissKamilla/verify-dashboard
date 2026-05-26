import closeIconUrl from "@/assets/icons/close.svg";

import { GalleryDropdown } from "@/features/gallery/components/GalleryDropdown";

import { Icon } from "@/shared/ui/Icon";

import type { Gallery } from "@/features/gallery/types";

type ImageGalleryAction = "move" | "copy";

type ImageGalleryActionModalProps = {
  isOpen: boolean;
  action: ImageGalleryAction;
  galleries: Gallery[];
  selectedGalleryId: string;
  isLoading: boolean;
  isSubmitting: boolean;
  error?: string;
  onGalleryChange: (galleryId: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function ImageGalleryActionModal({
  isOpen,
  action,
  galleries,
  selectedGalleryId,
  isLoading,
  isSubmitting,
  error,
  onGalleryChange,
  onConfirm,
  onClose,
}: ImageGalleryActionModalProps) {
  if (!isOpen) {
    return null;
  }

  const isMoveAction = action === "move";

  const title = isMoveAction ? "Move photos" : "Copy photos";
  const description = isMoveAction
    ? "Choose gallery where you want to move selected photos."
    : "Choose gallery where you want to copy selected photos.";
  const submitText = isMoveAction ? "Move" : "Copy";

  const galleryOptions = galleries.map((gallery) => ({
    value: String(gallery.id),
    label: gallery.title,
  }));

  const hasGalleryOptions = galleryOptions.length > 0;
  const isConfirmDisabled =
    isLoading || isSubmitting || !selectedGalleryId || !hasGalleryOptions;

  const handleOverlayClick = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6"
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-gallery-action-title"
        className="relative w-full max-w-[438px] rounded-2xl bg-white px-8 pb-8 pt-[46px]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-6 top-6 flex h-6 w-6 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Close modal"
        >
          <Icon src={closeIconUrl} className="h-4 w-4 text-text-main" />
        </button>

        <h2
          id="image-gallery-action-title"
          className="text-center text-[28px] font-bold leading-normal text-text-main"
        >
          {title}
        </h2>

        <p className="mt-[18px] text-center text-lg font-normal leading-normal text-text-secondary">
          {description}
        </p>

        <div className="mt-6">
          {isLoading ? (
            <p className="text-sm leading-normal text-text-secondary">
              Loading galleries...
            </p>
          ) : hasGalleryOptions ? (
            <GalleryDropdown
              value={selectedGalleryId}
              options={galleryOptions}
              ariaLabel="Select target gallery"
              onChange={onGalleryChange}
            />
          ) : (
            <p className="text-sm leading-normal text-text-secondary">
              There are no other galleries available.
            </p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            aria-live="polite"
            className="mt-4 text-xs font-normal leading-6 text-error"
          >
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className="h-[50px] w-full rounded-2xl bg-brand text-base font-bold leading-none text-white hover:bg-avatar active:bg-brand-active disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitText}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-[50px] w-full rounded-2xl text-base font-bold leading-none text-text-main disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
