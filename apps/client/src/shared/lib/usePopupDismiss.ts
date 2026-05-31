import { useEffect, type RefObject } from "react";

import { useEscapeKey } from "./useEscapeKey";

export const usePopupDismiss = <T extends HTMLElement>(
  popupRef: RefObject<T | null>,
  onClose: () => void,
  enabled = true,
) => {
  useEscapeKey(onClose, enabled, document);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (!popupRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [enabled, onClose, popupRef]);
};
