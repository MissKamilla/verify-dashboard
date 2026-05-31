import { useRef, useState } from "react";

import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionMoveIconUrl from "@/assets/icons/action-move.svg";
import actionCopyIconUrl from "@/assets/icons/action-copy.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";
import dotsVerticalIconUrl from "@/assets/icons/dots-vertical.svg";

import { Icon } from "@/shared/ui/Icon";

import { getImageSrc } from "../getImageSrc";
import { usePopupDismiss } from "@/shared/lib/usePopupDismiss";

import type { GalleryImage } from "../types";

type ImageCardProps = {
  image: GalleryImage;
  onEditClick: (image: GalleryImage) => void;
  onMoveClick: (image: GalleryImage) => void;
  onCopyClick: (image: GalleryImage) => void;
  onDeleteClick: (image: GalleryImage) => void;
};

export function ImageCard({
  image,
  onEditClick,
  onMoveClick,
  onCopyClick,
  onDeleteClick,
}: ImageCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const imageName = image.metafields.name?.trim();
  const imageComment = image.metafields.comment?.trim();

  const imageAlt = imageName || "Gallery photo";

  const closeMenu = () => setIsMenuOpen(false);

  const handleEditClick = () => {
    closeMenu();
    onEditClick(image);
  };

  const handleMoveClick = () => {
    closeMenu();
    onMoveClick(image);
  };

  const handleCopyClick = () => {
    closeMenu();
    onCopyClick(image);
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
            alt={imageAlt}
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
                onClick={handleMoveClick}
                className="flex h-[46px] w-full cursor-pointer items-center gap-2 px-4 text-left text-sm leading-normal text-text-main hover:bg-gallery-preview"
              >
                <Icon src={actionMoveIconUrl} className="h-4 w-4" />
                <span>Move</span>
              </button>

              <button
                role="menuitem"
                type="button"
                onClick={handleCopyClick}
                className="flex h-[46px] w-full cursor-pointer items-center gap-2 px-4 text-left text-sm leading-normal text-text-main hover:bg-gallery-preview"
              >
                <Icon src={actionCopyIconUrl} className="h-4 w-4" />
                <span>Copy</span>
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

      {imageName && (
        <h3 className="mt-2.5 h-6 truncate text-base font-bold leading-normal text-text-main">
          {imageName}
        </h3>
      )}

      {imageComment && (
        <p
          className={`${imageName ? "" : "mt-2.5"} h-[21px] truncate text-sm leading-normal text-text-secondary`}
        >
          {imageComment}
        </p>
      )}

      {!imageName && !imageComment && (
        <p className="mt-2.5 h-[21px] truncate text-sm leading-normal text-text-secondary">
          No description yet...
        </p>
      )}
    </div>
  );
}
