import closeIconUrl from "@/assets/icons/close.svg";
import galleryPlaceholderUrl from "@/assets/gallery-placeholder.svg";

import { Icon } from "@/shared/ui/Icon";

export function GalleryEditPhotoCardPlaceholder() {
  return (
    <div className="grid w-full gap-[16px] min-[1360px]:grid-cols-[210px_300px] min-[1360px]:gap-[20px] min-[1536px]:grid-cols-[232px_328px]">
      <div className="relative w-full max-w-[311px] min-[1360px]:max-w-[210px] min-[1536px]:max-w-[232px]">
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[16px] bg-gallery-preview">
          <img
            src={galleryPlaceholderUrl}
            alt=""
            className="h-full w-full object-contain p-[28px]"
          />
        </div>

        <button
          type="button"
          className="absolute right-[-8px] top-[-8px] z-10 flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full bg-page-bg"
          aria-label="Remove photo"
        >
          <Icon src={closeIconUrl} className="h-[12px] w-[12px]" />
        </button>
      </div>

      <div className="flex w-full max-w-[311px] flex-col gap-[16px] min-[1360px]:max-w-[300px] min-[1536px]:max-w-[328px]">
        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-medium leading-none text-text-main">
            Name
          </span>
          <input
            type="text"
            placeholder="Name"
            readOnly
            className="h-[50px] w-full rounded-[16px] border border-border-default px-[18px] text-[14px] font-normal text-text-main outline-none placeholder:text-text-muted"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-medium leading-none text-text-main">
            Comment
          </span>

          <textarea
            placeholder="Comment"
            readOnly
            className="h-[114px] w-full resize-none rounded-[16px] border border-border-default px-[18px] py-[16px] text-[14px] font-normal leading-[150%] text-text-main outline-none placeholder:text-text-muted min-[1360px]:h-[104px] min-[1536px]:h-[114px]"
          />
        </label>
      </div>
    </div>
  );
}
