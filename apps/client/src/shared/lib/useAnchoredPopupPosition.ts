import {
  useCallback,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

export type AnchoredPopupAlign = "start" | "end";

type PopupPosition = {
  top: number;
  left: number;
};

type UseAnchoredPopupPositionParams<
  TAnchor extends HTMLElement,
  TPopup extends HTMLElement,
> = {
  anchorRef: RefObject<TAnchor | null>;
  popupRef: RefObject<TPopup | null>;
  enabled: boolean;
  align?: AnchoredPopupAlign;
  offset?: number;
  viewportPadding?: number;
};

export function useAnchoredPopupPosition<
  TAnchor extends HTMLElement,
  TPopup extends HTMLElement,
>({
  anchorRef,
  popupRef,
  enabled,
  align = "start",
  offset = 8,
  viewportPadding = 8,
}: UseAnchoredPopupPositionParams<TAnchor, TPopup>): CSSProperties {
  const [position, setPosition] = useState<PopupPosition | null>(null);

  const updatePosition = useCallback(() => {
    const anchorElement = anchorRef.current;
    const popupElement = popupRef.current;

    if (!anchorElement || !popupElement) {
      return;
    }

    const anchorRect = anchorElement.getBoundingClientRect();
    const popupRect = popupElement.getBoundingClientRect();

    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;

    const shouldOpenAbove =
      spaceBelow < popupRect.height + offset &&
      spaceAbove >= popupRect.height + offset;

    let top = shouldOpenAbove
      ? anchorRect.top - popupRect.height - offset
      : anchorRect.bottom + offset;

    let left =
      align === "end" ? anchorRect.right - popupRect.width : anchorRect.left;

    const maxTop = Math.max(
      viewportPadding,
      window.innerHeight - popupRect.height - viewportPadding,
    );

    const maxLeft = Math.max(
      viewportPadding,
      window.innerWidth - popupRect.width - viewportPadding,
    );

    top = Math.min(Math.max(top, viewportPadding), maxTop);
    left = Math.min(Math.max(left, viewportPadding), maxLeft);

    setPosition({ top, left });
  }, [align, anchorRef, offset, popupRef, viewportPadding]);

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    document.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("scroll", updatePosition, true);
    };
  }, [enabled, updatePosition]);

  return {
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    visibility: position ? "visible" : "hidden",
  };
}
