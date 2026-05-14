import galleryEmptyImageUrl from "@/assets/gallery-empty.svg";
import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";

import { Icon } from "@/shared/ui/Icon";

type GalleriesEmptyStateProps = {
  onCreateClick?: () => void;
};

export function GalleriesEmptyState({
  onCreateClick,
}: GalleriesEmptyStateProps) {
  return (
    <div className="flex min-h-[620px] flex-1 items-center justify-center rounded-[30px] bg-white shadow-card">
      <div className="flex w-full max-w-[434px] flex-col items-center text-center">
        <h2 className="text-[24px] font-bold leading-[150%] text-text-main">
          List Of Galleries Is Empty
        </h2>

        <p className="mt-[8px] text-[18px] font-normal leading-[150%] text-text-secondary">
          Company don’t have any galleries. Please, click on the "Create a new
          gallery".
        </p>

        <img
          src={galleryEmptyImageUrl}
          alt=""
          className="mt-[40px] h-[274px] w-[308px] object-contain"
        />

        <button
          type="button"
          onClick={onCreateClick}
          className="mt-[28px] flex cursor-pointer items-center gap-[10px] text-[16px] font-bold uppercase leading-[150%] text-brand"
        >
          <span>CREATE A NEW GALLERY</span>
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] text-brand"
          />
        </button>
      </div>
    </div>
  );
}
