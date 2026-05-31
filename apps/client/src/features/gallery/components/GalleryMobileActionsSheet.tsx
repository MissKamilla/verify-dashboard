import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";

import { MobileActionsSheet } from "@/shared/ui/MobileActionsSheet";

type GalleryMobileActionsSheetProps = {
  galleryId: number;
  isOpen: boolean;
  onClose: () => void;
  onDeleteClick: () => void;
};

export function GalleryMobileActionsSheet({
  galleryId,
  isOpen,
  onClose,
  onDeleteClick,
}: GalleryMobileActionsSheetProps) {
  return (
    <MobileActionsSheet
      isOpen={isOpen}
      closeLabel="Close gallery actions"
      actions={[
        {
          type: "link",
          label: "Edit",
          iconSrc: actionEditIconUrl,
          to: `/galleries/${galleryId}/edit`,
        },
        {
          type: "button",
          label: "Delete",
          iconSrc: actionDeleteIconUrl,
          onClick: onDeleteClick,
        },
      ]}
      onClose={onClose}
    />
  );
}
