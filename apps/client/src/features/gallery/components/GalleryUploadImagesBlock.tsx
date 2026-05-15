import galleryEmptyImageUrl from "@/assets/gallery-empty.svg";

export function GalleryUploadImagesBlock() {
  return (
    <div
      id="upload-images"
      className="mt-[32px] flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-brand bg-brand-light px-[24px] py-[40px] text-center"
    >
      <img
        src={galleryEmptyImageUrl}
        alt=""
        className="mb-[20px] h-[120px] w-[136px] object-contain"
      />

      <p className="text-[18px] font-bold leading-[150%] text-text-main">
        Upload images
      </p>

      <p className="mt-[8px] max-w-[420px] text-[16px] leading-[150%] text-text-secondary">
        Images for this gallery will be displayed here.
      </p>
    </div>
  );
}
