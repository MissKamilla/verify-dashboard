import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";

import {
  useAnchoredPopupPosition,
  type AnchoredPopupAlign,
} from "@/shared/lib/useAnchoredPopupPosition";

import { usePopupDismiss } from "@/shared/lib/usePopupDismiss";
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
  renderInPortal?: boolean;
  portalAlign?: AnchoredPopupAlign;
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
  renderInPortal = false,
  portalAlign = "start",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const portalStyle = useAnchoredPopupPosition({
    anchorRef: rootRef,
    popupRef: menuRef,
    enabled: isOpen && renderInPortal,
    align: portalAlign,
  });

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((currentValue) => !currentValue);

  usePopupDismiss(rootRef, close, isOpen, menuRef);

  const menu = isOpen ? (
    <div
      ref={menuRef}
      role="menu"
      style={renderInPortal ? portalStyle : undefined}
      className={`${
        renderInPortal ? "fixed" : "absolute"
      } overflow-hidden bg-white shadow-card ${menuClassName}`}
    >
      {children({ close })}
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={rootClassName}>
      {trigger({ isOpen, toggle, close })}

      {renderInPortal && menu ? createPortal(menu, document.body) : menu}
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
