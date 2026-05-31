import { Modal } from "@/shared/ui/Modal";

type DiscardImageChangesModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function DiscardImageChangesModal({
  isOpen,
  onConfirm,
  onClose,
}: DiscardImageChangesModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      titleId="discard-image-changes-title"
      descriptionId="discard-image-changes-description"
      contentClassName="text-center"
      onClose={onClose}
    >
      <h2
        id="discard-image-changes-title"
        className="text-2xl font-bold leading-normal text-text-main"
      >
        Are you sure you want to leave?
      </h2>

      <p
        id="discard-image-changes-description"
        className="mt-4 text-base font-normal leading-normal text-text-secondary"
      >
        You have unsaved changes. If you leave the page now, unsaved changes
        will be lost.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="h-[50px] w-full rounded-2xl bg-brand text-base font-bold leading-none text-white hover:bg-avatar active:bg-brand-active"
        >
          Confirm
        </button>

        <button
          type="button"
          onClick={onClose}
          className="h-[50px] w-full rounded-2xl text-base font-bold leading-none text-text-main"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
