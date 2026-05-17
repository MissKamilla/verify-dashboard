import { useState } from "react";

import galleryPlaceholderIconUrl from "@/assets/gallery-placeholder.svg";
import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";
import dotsVerticalIconUrl from "@/assets/icons/dots-vertical.svg";

import { Icon } from "@/shared/ui/Icon";

type GalleryDetailsPhotoCardPlaceholderProps = {
  name?: string;
  description?: string;
};

export function GalleryDetailsPhotoCardPlaceholder({
  name = "No photo name",
  description,
}: GalleryDetailsPhotoCardPlaceholderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const descriptionText = description || "No description yet...";

  return (
    <div className="relative w-full min-w-0 max-w-[150px]">
      <div className="relative">
        <div className="flex aspect-square w-full min-w-[120px] max-w-[150px] items-center justify-center overflow-hidden rounded-[16px] bg-gallery-preview">
          <img
            src={galleryPlaceholderIconUrl}
            alt=""
            className="h-[64px] w-[64px] object-contain"
          />
        </div>

        <div className="absolute right-[-8px] top-[-8px] z-20">
          <button
            type="button"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center"
            aria-label="Open photo actions"
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
          >
            <img
              src={dotsVerticalIconUrl}
              alt=""
              className="h-[24px] w-[24px]"
            />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-[32px] z-30 w-[132px] overflow-hidden rounded-[16px] bg-white shadow-card">
              <button
                role="menuitem"
                type="button"
                className="flex h-[46px] w-full cursor-pointer items-center gap-[8px] px-[16px] text-left text-[14px] leading-[150%] text-text-main hover:bg-gallery-preview"
              >
                <Icon src={actionEditIconUrl} className="h-[16px] w-[16px]" />
                <span>Edit details</span>
              </button>

              <button
                role="menuitem"
                type="button"
                className="flex h-[46px] w-full cursor-pointer items-center gap-[8px] px-[16px] text-left text-[14px] leading-[150%] text-text-main hover:bg-gallery-preview"
              >
                <Icon src={actionDeleteIconUrl} className="h-[16px] w-[16px]" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="mt-[10px] h-[24px] truncate text-[16px] font-bold leading-[150%] text-text-main">
        {name}
      </h3>

      <p className="h-[21px] truncate text-[14px] leading-[150%] text-text-secondary">
        {descriptionText}
      </p>
    </div>
  );
}
