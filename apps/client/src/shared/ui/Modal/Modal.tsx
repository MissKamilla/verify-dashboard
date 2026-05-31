import { useEffect, type ReactNode } from "react";

import closeIconUrl from "@/assets/icons/close.svg";

import { Icon } from "@/shared/ui/Icon";

type ModalProps = {
  isOpen: boolean;
  titleId: string;
  descriptionId?: string;
  isDismissDisabled?: boolean;
  contentClassName?: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({
  isOpen,
  titleId,
  descriptionId,
  isDismissDisabled = false,
  contentClassName = "",
  children,
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen || isDismissDisabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDismissDisabled, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = () => {
    if (!isDismissDisabled) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6"
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`relative w-full max-w-[398px] rounded-2xl bg-white px-8 pb-8 pt-[46px] ${contentClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isDismissDisabled}
          className="absolute right-6 top-6 flex h-5 w-5 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Close modal"
        >
          <Icon src={closeIconUrl} className="h-4 w-4 text-text-main" />
        </button>

        {children}
      </div>
    </div>
  );
}
