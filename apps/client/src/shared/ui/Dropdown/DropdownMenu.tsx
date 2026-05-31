import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { Icon } from "@/shared/ui/Icon";

type DropdownMenuRenderProps = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

type DropdownMenuProps = {
  trigger: (props: DropdownMenuRenderProps) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  menuClassName: string;
  rootClassName?: string;
};

type DropdownMenuItemProps = {
  children: ReactNode;
  iconSrc?: string;
  to?: string;
  isSelected?: boolean;
  className?: string;
  onClick?: () => void;
};

const menuItemBaseClassName =
  "flex h-[46px] w-full cursor-pointer items-center gap-2 px-4 text-left text-sm font-normal leading-normal text-text-main hover:bg-gallery-preview";

export function DropdownMenu({
  trigger,
  children,
  menuClassName,
  rootClassName = "relative",
}: DropdownMenuProps) {
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
          role="menu"
          className={`absolute overflow-hidden bg-white shadow-card ${menuClassName}`}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  iconSrc,
  to,
  isSelected = false,
  className = "",
  onClick,
}: DropdownMenuItemProps) {
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
      <Link to={to} onClick={onClick} role="menuitem" className={itemClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={itemClassName}
    >
      {content}
    </button>
  );
}
