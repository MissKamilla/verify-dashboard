import { useCallback, useEffect, useRef, useState } from "react";

const MIN_SCROLL_THUMB_HEIGHT = 70;

type ScrollThumbState = {
  top: number;
  height: number;
  isVisible: boolean;
};

export function useGalleryScrollThumb(itemsCount: number) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [scrollThumb, setScrollThumb] = useState<ScrollThumbState>({
    top: 0,
    height: MIN_SCROLL_THUMB_HEIGHT,
    isVisible: false,
  });

  const updateScrollThumb = useCallback(() => {
    const scrollElement = scrollContainerRef.current;

    if (!scrollElement) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const hasScroll = scrollHeight > clientHeight;

    if (!hasScroll) {
      setScrollThumb((currentValue) => ({
        ...currentValue,
        isVisible: false,
      }));
      return;
    }

    const thumbHeight = Math.max(
      (clientHeight / scrollHeight) * clientHeight,
      MIN_SCROLL_THUMB_HEIGHT,
    );

    const maxThumbTop = clientHeight - thumbHeight;
    const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop;

    setScrollThumb({
      top: thumbTop,
      height: thumbHeight,
      isVisible: true,
    });
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(updateScrollThumb);

    window.addEventListener("resize", updateScrollThumb);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateScrollThumb);
    };
  }, [itemsCount, updateScrollThumb]);

  return {
    scrollContainerRef,
    scrollThumb,
    updateScrollThumb,
  };
}
