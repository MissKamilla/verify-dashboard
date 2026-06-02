import { useState } from "react";
import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionMoveIconUrl from "@/assets/icons/action-move.svg";
import actionCopyIconUrl from "@/assets/icons/action-copy.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";
import dotsVerticalIconUrl from "@/assets/icons/dots-vertical.svg";

import { DropdownMenu, DropdownMenuItem } from "@/shared/ui/Dropdown";

import { getImageSrc } from "@/features/image/getImageSrc";
import type { GalleryImage } from "@/features/image/types";

import { ImageMobileActionsSheet } from "./ImageMobileActionsSheet";

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
  const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);

  const imageName = image.metafields.name?.trim();
  const imageComment = image.metafields.comment?.trim();

  const imageAlt = imageName || "Gallery photo";

  return (
    <div className="relative w-full min-w-0">
      <div className="relative">
        <div className="flex aspect-square w-full min-w-[120px] items-center justify-center overflow-hidden rounded-2xl bg-gallery-preview">
          <img
            src={getImageSrc(image.path)}
            alt={imageAlt}
            className="h-full w-full object-cover"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsMobileActionsOpen(true)}
          className="absolute -right-2 -top-2 z-20 flex h-6 w-6 cursor-pointer items-center justify-center sm:hidden"
          aria-label="Open photo actions"
          aria-expanded={isMobileActionsOpen}
          aria-haspopup="dialog"
        >
          <img src={dotsVerticalIconUrl} alt="" className="h-6 w-6" />
        </button>

        <DropdownMenu
          rootClassName="absolute -right-2 -top-2 z-20 hidden sm:block"
          menuClassName="right-0 top-8 z-30 w-[132px] rounded-2xl"
          trigger={({ isOpen, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="flex h-6 w-6 cursor-pointer items-center justify-center"
              aria-label={isOpen ? "Close photo actions" : "Open photo actions"}
              aria-expanded={isOpen}
              aria-haspopup="menu"
            >
              <img src={dotsVerticalIconUrl} alt="" className="h-6 w-6" />
            </button>
          )}
        >
          {({ close }) => (
            <>
              <DropdownMenuItem
                iconSrc={actionEditIconUrl}
                onClick={() => {
                  close();
                  onEditClick(image);
                }}
              >
                Edit details
              </DropdownMenuItem>

              <DropdownMenuItem
                iconSrc={actionMoveIconUrl}
                onClick={() => {
                  close();
                  onMoveClick(image);
                }}
              >
                Move
              </DropdownMenuItem>

              <DropdownMenuItem
                iconSrc={actionCopyIconUrl}
                onClick={() => {
                  close();
                  onCopyClick(image);
                }}
              >
                Copy
              </DropdownMenuItem>

              <DropdownMenuItem
                iconSrc={actionDeleteIconUrl}
                onClick={() => {
                  close();
                  onDeleteClick(image);
                }}
              >
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenu>

        <ImageMobileActionsSheet
          isOpen={isMobileActionsOpen}
          onClose={() => setIsMobileActionsOpen(false)}
          onEditClick={() => onEditClick(image)}
          onMoveClick={() => onMoveClick(image)}
          onCopyClick={() => onCopyClick(image)}
          onDeleteClick={() => onDeleteClick(image)}
        />
      </div>

      {imageName && (
        <h3
          className="mt-2.5 h-6 truncate text-base font-bold leading-normal text-text-main"
          title={imageName}
        >
          {imageName}
        </h3>
      )}

      {imageComment && (
        <p
          className={`${imageName ? "" : "mt-2.5"} h-[21px] truncate text-sm leading-normal text-text-secondary`}
          title={imageComment}
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
