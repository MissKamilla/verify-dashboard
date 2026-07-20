import { Modal } from "@/shared/ui/Modal";

type RevokeGalleryAccessModalProps = {
  isOpen: boolean;
  userEmail: string;
  isRevoking: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function RevokeGalleryAccessModal({
  isOpen,
  userEmail,
  isRevoking,
  error,
  onConfirm,
  onClose,
}: RevokeGalleryAccessModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      titleId="revoke-gallery-access-title"
      descriptionId="revoke-gallery-access-description"
      isDismissDisabled={isRevoking}
      contentClassName="text-center"
      onClose={onClose}
    >
      <h2
        id="revoke-gallery-access-title"
        className="text-[28px] font-bold leading-normal text-text-main"
      >
        Revoke access
      </h2>

      <p
        id="revoke-gallery-access-description"
        className="mt-[18px] text-lg font-normal leading-normal text-text-secondary"
      >
        Are you sure you want to revoke gallery access for{" "}
        <span className="font-bold text-text-main">{userEmail}</span>?
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
          disabled={isRevoking}
          className="h-[50px] w-full rounded-2xl bg-error text-base font-bold leading-none text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Revoke
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={isRevoking}
          className="h-[50px] w-full rounded-2xl text-base font-bold leading-none text-text-main disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
