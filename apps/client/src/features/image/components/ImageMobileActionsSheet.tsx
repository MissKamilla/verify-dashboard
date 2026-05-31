import actionCopyIconUrl from "@/assets/icons/action-copy.svg";
import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";
import actionMoveIconUrl from "@/assets/icons/action-move.svg";

import { MobileActionsSheet } from "@/shared/ui/MobileActionsSheet";

type ImageMobileActionsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onEditClick: () => void;
  onMoveClick: () => void;
  onCopyClick: () => void;
  onDeleteClick: () => void;
};

export function ImageMobileActionsSheet({
  isOpen,
  onClose,
  onEditClick,
  onMoveClick,
  onCopyClick,
  onDeleteClick,
}: ImageMobileActionsSheetProps) {
  return (
    <MobileActionsSheet
      isOpen={isOpen}
      closeLabel="Close photo actions"
      actions={[
        {
          type: "button",
          label: "Edit details",
          iconSrc: actionEditIconUrl,
          onClick: onEditClick,
        },
        {
          type: "button",
          label: "Move",
          iconSrc: actionMoveIconUrl,
          onClick: onMoveClick,
        },
        {
          type: "button",
          label: "Copy",
          iconSrc: actionCopyIconUrl,
          onClick: onCopyClick,
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
