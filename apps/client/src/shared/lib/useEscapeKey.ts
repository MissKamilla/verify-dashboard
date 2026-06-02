import { useEffect } from "react";

export const useEscapeKey = (
  onEscape: () => void,
  enabled = true,
  target: Document | Window = document,
) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        onEscape();
      }
    };

    target.addEventListener("keydown", handleKeyDown);

    return () => {
      target.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onEscape, target]);
};
