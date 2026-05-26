import { useRef, useState } from "react";

import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";
import dotsVerticalIconUrl from "@/assets/icons/dots-vertical.svg";

import { Icon } from "@/shared/ui/Icon";

import { getImageSrc } from "../getImageSrc";
import { usePopupDismiss } from "@/shared/lib/usePopupDismiss";

import type { GalleryImage } from "../types";

type ImageCardProps = {
  image: GalleryImage;
  onEditClick: (image: GalleryImage) => void;
  onDeleteClick: (image: GalleryImage) => void;
};

export function ImageCard({
  image,
  onEditClick,
  onDeleteClick,
}: ImageCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const imageName = image.metafields.name?.trim() || "Gallery photo";

  const descriptionText =
    image.metafields.comment?.trim() || "No description yet...";

  const closeMenu = () => setIsMenuOpen(false);

  const handleEditClick = () => {
    closeMenu();
    onEditClick(image);
  };

  const handleDeleteClick = () => {
    closeMenu();
    onDeleteClick(image);
  };

  usePopupDismiss(cardRef, closeMenu, isMenuOpen);

  return (
    <div ref={cardRef} className="relative w-full min-w-0 max-w-[150px]">
      <div className="relative">
        <div className="flex aspect-square w-full min-w-[120px] max-w-[150px] items-center justify-center overflow-hidden rounded-2xl bg-gallery-preview">
          <img
            src={getImageSrc(image.path)}
            alt={imageName}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="absolute -right-2 -top-2 z-20">
          <button
            type="button"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            className="flex h-6 w-6 cursor-pointer items-center justify-center"
            aria-label={
              isMenuOpen ? "Close photo actions" : "Open photo actions"
            }
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
          >
            <img src={dotsVerticalIconUrl} alt="" className="h-6 w-6" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-30 w-[132px] overflow-hidden rounded-2xl bg-white shadow-card">
              <button
                role="menuitem"
                type="button"
                onClick={handleEditClick}
                className="flex h-[46px] w-full cursor-pointer items-center gap-2 px-4 text-left text-sm leading-normal text-text-main hover:bg-gallery-preview"
              >
                <Icon src={actionEditIconUrl} className="h-4 w-4" />
                <span>Edit details</span>
              </button>

              <button
                role="menuitem"
                type="button"
                onClick={handleDeleteClick}
                className="flex h-[46px] w-full cursor-pointer items-center gap-2 px-4 text-left text-sm leading-normal text-text-main hover:bg-gallery-preview"
              >
                <Icon src={actionDeleteIconUrl} className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="mt-2.5 h-6 truncate text-base font-bold leading-normal text-text-main">
        {imageName}
      </h3>

      <p className="h-[21px] truncate text-sm leading-normal text-text-secondary">
        {descriptionText}
      </p>
    </div>
  );
}
