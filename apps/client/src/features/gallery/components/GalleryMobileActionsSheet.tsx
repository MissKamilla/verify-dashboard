import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";
import actionShareIconUrl from "@/assets/icons/action-share.svg";

import {
  MobileActionsSheet,
  type MobileActionsSheetAction,
} from "@/shared/ui/MobileActionsSheet";

type GalleryMobileActionsSheetProps = {
  galleryId: number;
  isOpen: boolean;
  canShare: boolean;
  canDelete: boolean;
  onClose: () => void;
  onShareClick: () => void;
  onDeleteClick: () => void;
};

export function GalleryMobileActionsSheet({
  galleryId,
  isOpen,
  canShare,
  canDelete,
  onClose,
  onShareClick,
  onDeleteClick,
}: GalleryMobileActionsSheetProps) {
  const actions: MobileActionsSheetAction[] = [];

  if (canShare) {
    actions.push({
      type: "button",
      label: "Share",
      iconSrc: actionShareIconUrl,
      onClick: onShareClick,
    });
  }

  actions.push({
    type: "link",
    label: "Edit",
    iconSrc: actionEditIconUrl,
    to: `/galleries/${galleryId}/edit`,
  });

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
