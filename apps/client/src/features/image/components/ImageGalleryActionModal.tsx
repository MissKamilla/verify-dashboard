import { Dropdown } from "@/shared/ui/Dropdown";
import { Modal } from "@/shared/ui/Modal";

import type { Gallery } from "@/features/gallery/types";

type ImageGalleryAction = "move" | "copy";

type ImageGalleryActionModalProps = {
  isOpen: boolean;
  imageAction: ImageGalleryAction;
  galleries: Gallery[];
  currentGalleryId?: number;
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
  imageAction,
  galleries,
  currentGalleryId,
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

  const actionConfig = {
    move: {
      title: "Move photos",
      description: "Choose gallery where you want to move selected photos.",
      submitText: "Move",
    },
    copy: {
      title: "Copy photos",
      description: "Choose gallery where you want to copy selected photos.",
      submitText: "Copy",
    },
  }[imageAction];

  const { title, description, submitText } = actionConfig;

  const galleryOptions = galleries
    .filter((gallery) => gallery.id !== currentGalleryId)
    .map((gallery) => ({
      value: String(gallery.id),
      label: gallery.title,
    }));

  const hasGalleryOptions = galleryOptions.length > 0;
  const isConfirmDisabled =
    isLoading || isSubmitting || !selectedGalleryId || !hasGalleryOptions;

  return (
    <Modal
      isOpen={isOpen}
      titleId="image-gallery-action-title"
      descriptionId="image-gallery-action-description"
      isDismissDisabled={isSubmitting}
      onClose={onClose}
    >
      <h2
        id="image-gallery-action-title"
        className="text-center text-[28px] font-bold leading-normal text-text-main"
      >
        {title}
      </h2>

      <p
        id="image-gallery-action-description"
        className="mt-[18px] text-center text-lg font-normal leading-normal text-text-secondary"
      >
        {description}
      </p>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm leading-normal text-text-secondary">
            Loading galleries...
          </p>
        ) : hasGalleryOptions ? (
          <Dropdown
            value={selectedGalleryId}
            options={galleryOptions}
            ariaLabel="Select target gallery"
            placeholder="Select gallery"
            onChange={onGalleryChange}
          />
        ) : (
          <p className="text-sm leading-normal text-text-secondary">
            There are no galleries available.
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
    </Modal>
  );
}
