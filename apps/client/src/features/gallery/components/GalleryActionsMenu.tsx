import { useState } from "react";
import dotsVerticalIconUrl from "@/assets/icons/dots-vertical.svg";
import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";

import { DropdownMenu, DropdownMenuItem } from "@/shared/ui/Dropdown";

import type { Gallery } from "@/features/gallery/types";

import { GalleryMobileActionsSheet } from "./GalleryMobileActionsSheet";

type GalleryActionsMenuProps = {
  gallery: Gallery;
  onDeleteClick: (gallery: Gallery) => void;
};

export function GalleryActionsMenu({
  gallery,
  onDeleteClick,
}: GalleryActionsMenuProps) {
  const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileActionsOpen(true)}
        className="flex h-6 w-6 cursor-pointer items-center justify-center sm:hidden"
        aria-label="Open gallery actions"
        aria-expanded={isMobileActionsOpen}
        aria-haspopup="dialog"
      >
        <img
          src={dotsVerticalIconUrl}
          alt=""
          className="h-6 w-6"
          aria-hidden="true"
        />
      </button>

      <DropdownMenu
        rootClassName="hidden sm:block"
        menuClassName="right-[26px] top-[34px] z-10 w-[132px] rounded-3xl"
        trigger={({ isOpen, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className="flex h-6 w-6 cursor-pointer items-center justify-center"
            aria-label="Open gallery actions"
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            <img
              src={dotsVerticalIconUrl}
              alt=""
              className="h-6 w-6"
              aria-hidden="true"
            />
          </button>
        )}
      >
        {({ close }) => (
          <>
            <DropdownMenuItem
              to={`/galleries/${gallery.id}/edit`}
              iconSrc={actionEditIconUrl}
              onClick={close}
            >
              Edit
            </DropdownMenuItem>

            {gallery.role === "owner" && (
              <DropdownMenuItem
                iconSrc={actionDeleteIconUrl}
                onClick={() => {
                  close();
                  onDeleteClick(gallery);
                }}
              >
                Delete
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenu>

      <GalleryMobileActionsSheet
        galleryId={gallery.id}
        isOpen={isMobileActionsOpen}
        canDelete={gallery.role === "owner"}
        onClose={() => setIsMobileActionsOpen(false)}
        onDeleteClick={() => onDeleteClick(gallery)}
      />
    </>
  );
}
