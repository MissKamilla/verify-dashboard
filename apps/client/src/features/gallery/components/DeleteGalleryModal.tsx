import closeIconUrl from "@/assets/icons/close.svg";

import { Icon } from "@/shared/ui/Icon";

type DeleteGalleryModalProps = {
  isOpen: boolean;
  galleryTitle: string;
  isDeleting: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteGalleryModal({
  isOpen,
  galleryTitle,
  isDeleting,
  error,
  onConfirm,
  onClose,
}: DeleteGalleryModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-gallery-title"
        className="relative w-full max-w-[438px] rounded-2xl bg-white px-8 pb-8 pt-[46px] text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-6 top-6 flex h-6 w-6 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Close modal"
        >
          <Icon src={closeIconUrl} className="h-4 w-4 text-text-main" />
        </button>

        <h2
          id="delete-gallery-title"
          className="text-[28px] font-bold leading-normal text-text-main"
        >
          Delete gallery
        </h2>

        <p className="mt-[18px] text-lg font-normal leading-normal text-text-secondary">
          Are you sure you want to delete gallery{" "}
          <span className="font-bold text-text-main">{galleryTitle}</span>?
        </p>

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
            disabled={isDeleting}
            className="h-[50px] w-full rounded-2xl bg-error text-base font-bold leading-none text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-[50px] w-full rounded-2xl text-base font-bold leading-none text-text-main disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
