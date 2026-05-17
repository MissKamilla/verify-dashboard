import closeIconUrl from "@/assets/icons/close.svg";
import galleryPlaceholderUrl from "@/assets/gallery-placeholder.svg";

import { Icon } from "@/shared/ui/Icon";

export function GalleryEditPhotoCardPlaceholder() {
  return (
    <div className="grid w-full gap-4 min-[1360px]:grid-cols-[210px_300px] min-[1360px]:gap-5 min-[1536px]:grid-cols-[232px_328px]">
      <div className="relative w-full max-w-[311px] min-[1360px]:max-w-[210px] min-[1536px]:max-w-[232px]">
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-gallery-preview">
          <img
            src={galleryPlaceholderUrl}
            alt=""
            className="h-full w-full object-contain p-7"
          />
        </div>

        <button
          type="button"
          className="absolute -right-2 -top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-page-bg"
          aria-label="Remove photo"
        >
          <Icon src={closeIconUrl} className="h-3 w-3" />
        </button>
      </div>

      <div className="flex w-full max-w-[311px] flex-col gap-4 min-[1360px]:max-w-[300px] min-[1536px]:max-w-[328px]">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium leading-none text-text-main">
            Name
          </span>
          <input
            type="text"
            placeholder="Name"
            readOnly
            className="h-[50px] w-full rounded-2xl border border-border-default px-[18px] text-sm font-normal text-text-main outline-none placeholder:text-text-muted"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium leading-none text-text-main">
            Comment
          </span>

          <textarea
            placeholder="Comment"
            readOnly
            className="h-[114px] w-full resize-none rounded-2xl border border-border-default px-[18px] py-4 text-sm font-normal leading-normal text-text-main outline-none placeholder:text-text-muted min-[1360px]:h-[104px] min-[1536px]:h-[114px]"
          />
        </label>
      </div>
    </div>
  );
}
