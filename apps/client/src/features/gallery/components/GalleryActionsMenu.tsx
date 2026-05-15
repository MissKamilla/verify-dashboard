import { useState } from "react";
import { Link } from "react-router";

import type { Gallery } from "@/features/gallery/types";

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
        className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[24px] leading-none text-text-secondary hover:bg-brand-light"
        aria-label="Open gallery actions"
        aria-expanded={isOpen}
      >
        ...
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[44px] z-10 flex w-[140px] flex-col rounded-[16px] border border-border-default bg-white py-[8px] shadow-card">
          <Link
            to={`/galleries/${gallery.id}/edit`}
            className="px-[16px] py-[10px] text-[14px] font-medium leading-[150%] text-text-main hover:bg-brand-light"
          >
            Edit
          </Link>

          <button
            type="button"
            onClick={handleDeleteClick}
            className="px-[16px] py-[10px] text-left text-[14px] font-medium leading-[150%] text-error hover:bg-brand-light"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
