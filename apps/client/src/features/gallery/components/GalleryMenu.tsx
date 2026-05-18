import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { Icon } from "@/shared/ui/Icon";

type GalleryMenuRenderProps = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

type GalleryMenuProps = {
  trigger: (props: GalleryMenuRenderProps) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  menuClassName: string;
  rootClassName?: string;
};

type GalleryMenuItemProps = {
  children: ReactNode;
  iconSrc?: string;
  to?: string;
  isSelected?: boolean;
  className?: string;
  onClick?: () => void;
};

const menuItemBaseClassName =
  "flex h-[46px] w-full cursor-pointer items-center gap-2 px-4 text-left text-sm font-normal leading-normal text-text-main hover:bg-gallery-preview";

export function GalleryMenu({
  trigger,
  children,
  menuClassName,
  rootClassName = "relative",
}: GalleryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((currentValue) => !currentValue);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleEscapePress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscapePress);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscapePress);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={rootClassName}>
      {trigger({ isOpen, toggle, close })}

      {isOpen && (
        <div
          className={`absolute overflow-hidden bg-white shadow-card ${menuClassName}`}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}

export function GalleryMenuItem({
  children,
  iconSrc,
  to,
  isSelected = false,
  className = "",
  onClick,
}: GalleryMenuItemProps) {
  const itemClassName = `${menuItemBaseClassName} ${
    isSelected ? "bg-gallery-preview font-bold" : ""
  } ${className}`;

  const content = (
    <>
      {iconSrc && <Icon src={iconSrc} className="h-4 w-4 shrink-0" />}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={itemClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={itemClassName}>
      {content}
    </button>
  );
}
