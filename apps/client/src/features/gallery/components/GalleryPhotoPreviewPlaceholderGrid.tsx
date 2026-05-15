export function GalleryPhotoPreviewPlaceholderGrid() {
  return (
    <div className="hidden grid-cols-4 gap-[20px] self-start xl:grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex h-[140px] items-center justify-center rounded-[16px] border border-border-default text-[14px] font-bold leading-[150%] text-border-default"
        >
          Photo preview
        </div>
      ))}

      <p className="col-span-4 text-[16px] leading-[150%] text-text-secondary">
        Upload a maximum of <b>50 photos</b>, no more than <b>5MB</b> each.
      </p>
    </div>
  );
}
