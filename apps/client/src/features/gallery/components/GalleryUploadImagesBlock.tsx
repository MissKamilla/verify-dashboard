import galleryEmptyImageUrl from "@/assets/gallery-empty.svg";

export function GalleryUploadImagesBlock() {
  return (
    <div
      id="upload-images"
      className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-brand bg-brand-light px-6 py-10 text-center"
    >
      <img
        src={galleryEmptyImageUrl}
        alt=""
        className="mb-5 h-[120px] w-[136px] object-contain"
      />

      <p className="text-lg font-bold leading-normal text-text-main">
        Upload images
      </p>

      <p className="mt-2 max-w-[420px] text-base leading-normal text-text-secondary">
        Images for this gallery will be displayed here.
      </p>
    </div>
  );
}
