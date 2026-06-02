import { Modal } from "@/shared/ui/Modal";

type DeleteImagesModalProps = {
  isOpen: boolean;
  imagesCount: number;
  isDeleting: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteImagesModal({
  isOpen,
  imagesCount,
  isDeleting,
  error,
  onConfirm,
  onClose,
}: DeleteImagesModalProps) {
  if (!isOpen) {
    return null;
  }

  const photosText = imagesCount === 1 ? "photo" : "photos";

  return (
    <Modal
      isOpen={isOpen}
      titleId="delete-images-title"
      descriptionId="delete-images-description"
      isDismissDisabled={isDeleting}
      contentClassName="text-center"
      onClose={onClose}
    >
      <h2
        id="delete-images-title"
        className="text-[28px] font-bold leading-normal text-text-main"
      >
        Delete {photosText}
      </h2>

      <p
        id="delete-images-description"
        className="mt-[18px] text-lg font-normal leading-normal text-text-secondary"
      >
        Are you sure you want to delete {photosText} from the gallery?
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
    </Modal>
  );
}
