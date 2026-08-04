import { useEffect, useId, useSyncExternalStore, type ReactNode } from "react";

import closeIconUrl from "@/assets/icons/close.svg";

import { useEscapeKey } from "@/shared/lib/useEscapeKey";
import { Icon } from "@/shared/ui/Icon";

type ModalProps = {
  isOpen: boolean;
  titleId: string;
  descriptionId?: string;
  isDismissDisabled?: boolean;
  contentClassName?: string;
  maxWidthClassName?: string;
  children: ReactNode;
  onClose: () => void;
};

const modalStack: string[] = [];
const modalStackSubscribers = new Set<() => void>();

const emitModalStackChange = () => {
  modalStackSubscribers.forEach((subscriber) => subscriber());
};

const subscribeToModalStack = (subscriber: () => void) => {
  modalStackSubscribers.add(subscriber);

  return () => {
    modalStackSubscribers.delete(subscriber);
  };
};

const getTopModalId = () => modalStack.at(-1) ?? null;

const registerModal = (modalId: string) => {
  modalStack.push(modalId);
  emitModalStackChange();
};

const unregisterModal = (modalId: string) => {
  const modalIndex = modalStack.lastIndexOf(modalId);

  if (modalIndex === -1) {
    return;
  }

  modalStack.splice(modalIndex, 1);
  emitModalStackChange();
};

export function Modal({
  isOpen,
  titleId,
  descriptionId,
  isDismissDisabled = false,
  contentClassName = "",
  maxWidthClassName = "max-w-[398px]",
  children,
  onClose,
}: ModalProps) {
  const modalId = useId();
  const topModalId = useSyncExternalStore(
    subscribeToModalStack,
    getTopModalId,
    getTopModalId,
  );
  const isTopModal = topModalId === modalId;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    registerModal(modalId);

    return () => {
      unregisterModal(modalId);
    };
  }, [isOpen, modalId]);

  useEscapeKey(onClose, isOpen && isTopModal && !isDismissDisabled);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = () => {
    if (isTopModal && !isDismissDisabled) {
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
        className={`relative w-full ${maxWidthClassName} rounded-2xl bg-white px-8 pb-8 pt-[46px] ${contentClassName}`}
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
