import { useEffect, useId } from "react";
import { Link } from "react-router";

import closeIconUrl from "@/assets/icons/close.svg";

import { useEscapeKey } from "@/shared/lib/useEscapeKey";
import { Icon } from "@/shared/ui/Icon";

type MobileActionsSheetBaseAction = {
  label: string;
  iconSrc: string;
};

type MobileActionsSheetButtonAction = MobileActionsSheetBaseAction & {
  type: "button";
  onClick: () => void;
};

type MobileActionsSheetLinkAction = MobileActionsSheetBaseAction & {
  type: "link";
  to: string;
};

export type MobileActionsSheetAction =
  | MobileActionsSheetButtonAction
  | MobileActionsSheetLinkAction;

type MobileActionsSheetProps = {
  isOpen: boolean;
  closeLabel: string;
  actions: MobileActionsSheetAction[];
  onClose: () => void;
};

const actionClassName =
  "flex h-9 w-full cursor-pointer items-center gap-3 text-left text-base font-medium leading-[22px] text-text-main";

export function MobileActionsSheet({
  isOpen,
  closeLabel,
  actions,
  onClose,
}: MobileActionsSheetProps) {
  const titleId = useId();

  useEscapeKey(onClose, isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const renderActionContent = (action: MobileActionsSheetAction) => (
    <>
      <Icon src={action.iconSrc} className="h-6 w-6" />
      <span>{action.label}</span>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/65 sm:hidden" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute bottom-0 left-0 w-full overflow-hidden rounded-t-[24px] border border-border-light bg-white shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-16 items-center justify-between bg-gallery-preview px-6">
          <h2
            id={titleId}
            className="text-base font-bold leading-normal text-text-main"
          >
            Actions
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 cursor-pointer items-center justify-center"
            aria-label={closeLabel}
          >
            <Icon src={closeIconUrl} className="h-4 w-4 text-text-main" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {actions.map((action) => {
            if (action.type === "link") {
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  onClick={onClose}
                  className={actionClassName}
                >
                  {renderActionContent(action)}
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  onClose();
                  action.onClick();
                }}
                className={actionClassName}
              >
                {renderActionContent(action)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
