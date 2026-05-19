import dotsVerticalIconUrl from "@/assets/icons/dots-vertical.svg";
import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import actionEditIconUrl from "@/assets/icons/action-edit.svg";

import type { Gallery } from "@/features/gallery/types";
import { GalleryMenu, GalleryMenuItem } from "./GalleryMenu";

type GalleryActionsMenuProps = {
  gallery: Gallery;
  onDeleteClick: (gallery: Gallery) => void;
};

export function GalleryActionsMenu({
  gallery,
  onDeleteClick,
}: GalleryActionsMenuProps) {
  return (
    <GalleryMenu
      menuClassName="right-[26px] top-[34px] z-10 h-[92px] w-[132px] rounded-3xl"
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
          <GalleryMenuItem
            to={`/galleries/${gallery.id}/edit`}
            iconSrc={actionEditIconUrl}
            onClick={close}
          >
            Edit
          </GalleryMenuItem>

          <GalleryMenuItem
            iconSrc={actionDeleteIconUrl}
            onClick={() => {
              close();
              onDeleteClick(gallery);
            }}
          >
            Delete
          </GalleryMenuItem>
        </>
      )}
    </GalleryMenu>
  );
}
