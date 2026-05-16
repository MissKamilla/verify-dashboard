import galleryUploadPlaceholderIconUrl from "@/assets/icons/gallery-upload-placeholder.svg";
import uploadIconUrl from "@/assets/icons/upload.svg";

import { Icon } from "@/shared/ui/Icon";

export function GalleryUploadDropzonePlaceholder() {
  return (
    <div className="relative flex h-[318px] w-full max-w-[311px] flex-col items-center rounded-[30px] bg-[#F6FFF7] p-[40px] text-center sm:h-[322px] sm:max-w-[330px] sm:p-[36px]">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 330 322"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect
          x="0.5"
          y="0.5"
          width="329"
          height="321"
          rx="30"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="1"
          strokeDasharray="8 8"
        />
      </svg>

      <Icon
        src={galleryUploadPlaceholderIconUrl}
        className="h-[92px] w-[92px] text-text-muted lg:h-[64px] lg:w-[64px]"
      />

      <p className="mt-[20px] text-[16px] font-bold leading-[150%] text-text-muted">
        <span className="hidden lg:inline">Drag and drop photo here</span>
        <span className="lg:hidden">Upload photo here</span>
      </p>

      <p className="mt-[6px] text-[10px] font-normal leading-[150%] text-text-muted lg:mt-[10px] lg:text-[12px]">
        JPEG, PNG (max 5MB / picture)
      </p>

      <div className="mt-[20px] hidden w-full items-center gap-[16px] lg:flex">
        <span className="h-px flex-1 bg-border-default" />
        <span className="text-[16px] font-bold leading-[150%] text-text-muted">
          OR
        </span>
        <span className="h-px flex-1 bg-border-default" />
      </div>

      <button
        type="button"
        className="mt-[24px] flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-[8px] rounded-[16px] bg-brand text-[14px] font-bold leading-none text-white hover:bg-avatar active:bg-brand-active lg:mt-[20px]"
      >
        <Icon src={uploadIconUrl} className="h-[19px] w-[19px]" />
        <span>Upload</span>
      </button>
    </div>
  );
}
