import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";

import {
  MobileActionsSheet,
  type MobileActionsSheetAction,
} from "@/shared/ui/MobileActionsSheet";

type GalleryMobileActionsSheetProps = {
  galleryId: number;
  isOpen: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDeleteClick: () => void;
};

export function GalleryMobileActionsSheet({
  galleryId,
  isOpen,
  canDelete,
  onClose,
  onDeleteClick,
}: GalleryMobileActionsSheetProps) {
  const actions: MobileActionsSheetAction[] = [
    {
      type: "link",
      label: "Edit",
      iconSrc: actionEditIconUrl,
      to: `/galleries/${galleryId}/edit`,
    },
  ];

  if (canDelete) {
    actions.push({
      type: "button",
      label: "Delete",
      iconSrc: actionDeleteIconUrl,
      onClick: onDeleteClick,
    });
  }

  return (
    <MobileActionsSheet
      isOpen={isOpen}
      closeLabel="Close gallery actions"
      actions={actions}
      onClose={onClose}
    />
  );
}
