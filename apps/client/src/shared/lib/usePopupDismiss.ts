import { useEffect, type RefObject } from "react";

import { useEscapeKey } from "./useEscapeKey";

export const usePopupDismiss = <
  TPopup extends HTMLElement,
  TAdditionalPopup extends HTMLElement = HTMLElement,
>(
  popupRef: RefObject<TPopup | null>,
  onClose: () => void,
  enabled = true,
  additionalPopupRef?: RefObject<TAdditionalPopup | null>,
) => {
  useEscapeKey(onClose, enabled, document);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const eventTarget = event.target as Node;

      const isInsidePopup = popupRef.current?.contains(eventTarget);
      const isInsideAdditionalPopup =
        additionalPopupRef?.current?.contains(eventTarget);

      if (!isInsidePopup && !isInsideAdditionalPopup) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [additionalPopupRef, enabled, onClose, popupRef]);
};
