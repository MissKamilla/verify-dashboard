export function GalleryUploadDropzonePlaceholder() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border border-dashed border-brand bg-brand-light px-[24px] py-[32px] text-center">
      <p className="text-[18px] font-bold leading-[150%] text-text-muted">
        Drag and drop photo here
      </p>

      <p className="mt-[10px] text-[14px] leading-[150%] text-text-muted">
        JPEG, PNG (max 5MB / picture)
      </p>

      <div className="my-[22px] flex w-full items-center gap-[14px]">
        <span className="h-px flex-1 bg-border-default" />
        <span className="text-[16px] font-bold leading-[150%] text-text-muted">
          OR
        </span>
        <span className="h-px flex-1 bg-border-default" />
      </div>

      <button
        type="button"
        className="h-[50px] w-full max-w-[260px] rounded-[16px] bg-brand text-[16px] font-bold leading-[150%] text-white hover:bg-avatar active:bg-brand-active"
      >
        Upload
      </button>
    </div>
  );
}
