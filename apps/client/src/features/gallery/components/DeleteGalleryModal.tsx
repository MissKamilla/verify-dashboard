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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-[24px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-gallery-title"
        className="relative w-full max-w-[438px] rounded-[16px] bg-white px-[32px] pb-[32px] pt-[46px] text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-[24px] top-[24px] flex h-[24px] w-[24px] cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Close modal"
        >
          <Icon
            src={closeIconUrl}
            className="h-[16px] w-[16px] text-text-main"
          />
        </button>

        <h2
          id="delete-gallery-title"
          className="text-[28px] font-bold leading-[150%] text-text-main"
        >
          Delete gallery
        </h2>

        <p className="mt-[18px] text-[18px] font-normal leading-[150%] text-text-secondary">
          Are you sure you want to delete gallery{" "}
          <span className="font-bold text-text-main">{galleryTitle}</span>?
        </p>

        {error && (
          <p
            role="alert"
            aria-live="polite"
            className="mt-[16px] text-[12px] font-normal leading-[24px] text-error"
          >
            {error}
          </p>
        )}

        <div className="mt-[28px] flex flex-col gap-[12px]">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-[50px] w-full rounded-[16px] bg-error text-[16px] font-bold leading-none text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-[50px] w-full rounded-[16px] text-[16px] font-bold leading-none text-text-main disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
