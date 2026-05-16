import { useState } from "react";
import { Link } from "react-router";

import dotsVerticalIconUrl from "@/assets/icons/dots-vertical.svg";
import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";

import type { Gallery } from "@/features/gallery/types";
import { Icon } from "@/shared/ui/Icon";

type GalleryActionsMenuProps = {
  gallery: Gallery;
  onDeleteClick: (gallery: Gallery) => void;
};

export function GalleryActionsMenu({
  gallery,
  onDeleteClick,
}: GalleryActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleMenu = () => {
    setIsOpen((currentValue) => !currentValue);
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    onDeleteClick(gallery);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggleMenu}
        className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center"
        aria-label="Open gallery actions"
        aria-expanded={isOpen}
      >
        <img
          src={dotsVerticalIconUrl}
          alt=""
          className="h-[24px] w-[24px]"
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute right-[26px] top-[34px] z-10 h-[92px] w-[132px] overflow-hidden rounded-[24px] bg-white shadow-card">
          <Link
            to={`/galleries/${gallery.id}/edit`}
            className="flex h-[46px] w-full items-center gap-[8px] px-[16px] text-[14px] font-normal leading-[150%] text-text-main hover:bg-gallery-preview"
          >
            <Icon
              src={actionEditIconUrl}
              className="h-[16px] w-[16px] shrink-0"
            />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex h-[46px] w-full cursor-pointer items-center gap-[8px] px-[16px] text-left text-[14px] font-normal leading-[150%] text-text-main hover:bg-gallery-preview"
          >
            <Icon
              src={actionDeleteIconUrl}
              className="h-[16px] w-[16px] shrink-0"
            />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
