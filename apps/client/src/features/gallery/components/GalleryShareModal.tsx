import { GalleryAccessForm } from "@/features/gallery/components/GalleryAccessForm";
import { GalleryAccessList } from "@/features/gallery/components/GalleryAccessList";

import { Modal } from "@/shared/ui/Modal";

type GalleryShareModalProps = {
  isOpen: boolean;
  galleryId: number;
  galleryTitle: string;
  onClose: () => void;
};

const TITLE_ID = "gallery-share-modal-title";
const DESCRIPTION_ID = "gallery-share-modal-description";

export function GalleryShareModal({
  isOpen,
  galleryId,
  galleryTitle,
  onClose,
}: GalleryShareModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      titleId={TITLE_ID}
      descriptionId={DESCRIPTION_ID}
      onClose={onClose}
      maxWidthClassName="max-w-[760px]"
      contentClassName="flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden px-5 pb-5 pt-[46px] sm:px-8 sm:pb-8"
    >
      <header className="shrink-0 pr-8">
        <h2
          id={TITLE_ID}
          className="text-2xl font-bold leading-normal text-text-main"
        >
          Share gallery
        </h2>

        <p id={DESCRIPTION_ID} className="mt-1 text-sm text-text-secondary">
          Manage access to{" "}
          <span className="font-medium text-text-main">{galleryTitle}</span>.
        </p>
      </header>

      <div className="mt-6 min-h-0 overflow-y-auto bg-white px-0 pb-1">
        <div className="flex flex-col gap-6">
          <GalleryAccessForm galleryId={galleryId} />

          <GalleryAccessList galleryId={galleryId} />
        </div>
      </div>
    </Modal>
  );
}
