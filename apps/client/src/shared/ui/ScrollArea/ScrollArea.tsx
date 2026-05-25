import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type ScrollThumb = {
  top: number;
  height: number;
  isVisible: boolean;
};

type ScrollAreaProps = {
  itemsCount?: number;
  trackBottomOffset?: number;
  onScroll?: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  thumbWrapperClassName?: string;
  bottomOverlayClassName?: string;
};

const MIN_SCROLL_THUMB_HEIGHT = 70;

export function ScrollArea({
  itemsCount = 0,
  trackBottomOffset = 0,
  onScroll,
  children,
  className = "",
  contentClassName = "",
  thumbWrapperClassName = "bottom-[30px]",

  bottomOverlayClassName = "h-[70px] via-white/95",
}: ScrollAreaProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollThumb, setScrollThumb] = useState<ScrollThumb>({
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

    const trackHeight = Math.max(
      clientHeight - trackBottomOffset,
      MIN_SCROLL_THUMB_HEIGHT,
    );

    if (!hasScroll) {
      setScrollThumb((currentValue) => ({
        ...currentValue,
        isVisible: false,
      }));
      return;
    }

    const thumbHeight = Math.max(
      (clientHeight / scrollHeight) * trackHeight,
      MIN_SCROLL_THUMB_HEIGHT,
    );

    const maxThumbTop = trackHeight - thumbHeight;
    const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop;

    setScrollThumb({
      top: thumbTop,
      height: thumbHeight,
      isVisible: true,
    });
  }, [trackBottomOffset]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(updateScrollThumb);

    window.addEventListener("resize", updateScrollThumb);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateScrollThumb);
    };
  }, [itemsCount, updateScrollThumb]);

  const handleScroll = () => {
    updateScrollThumb();
    onScroll?.();
  };

  return (
    <div className={`relative min-h-0 flex-1 overflow-hidden ${className}`}>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`scrollbar-gallery h-full overflow-y-auto ${contentClassName}`}
      >
        {children}
      </div>

      {scrollThumb.isVisible && (
        <div
          className={`pointer-events-none absolute top-[30px] right-2.5 bottom-[30px] z-20 hidden w-[3px] lg:block ${thumbWrapperClassName}`}
        >
          <div
            className="w-full rounded-sm bg-text-muted"
            style={{
              height: `${scrollThumb.height}px`,
              transform: `translateY(${scrollThumb.top}px)`,
            }}
          />
        </div>
      )}

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-b from-white/0 to-white ${scrollThumb.isVisible ? "block" : "hidden"} ${bottomOverlayClassName}`}
      />
    </div>
  );
}
