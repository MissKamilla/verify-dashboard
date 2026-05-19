import { PhotoPreviewCard } from "./PhotoPreviewCard";

const getPreviewCardVisibilityClassName = (index: number) => {
  if (index < 4) {
    return "";
  }

  if (index < 8) {
    return "hidden xl:flex";
  }

  return "hidden xl:flex 2xl:hidden";
};

export function GalleryPhotoPreviewPlaceholderGrid() {
  return (
    <div className="w-full max-w-[311px] self-start justify-self-center sm:max-w-[330px] min-[900px]:ml-auto min-[900px]:max-w-[372px] xl:max-w-[580px] 2xl:max-w-[780px]">
      <div className="grid w-full grid-cols-2 gap-3 min-[900px]:grid-cols-[repeat(2,minmax(115px,180px))] xl:grid-cols-[repeat(3,minmax(115px,180px))] xl:gap-5 2xl:grid-cols-[repeat(4,minmax(115px,180px))]">
        {Array.from({ length: 9 }).map((_, index) => (
          <PhotoPreviewCard
            key={index}
            className={getPreviewCardVisibilityClassName(index)}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-base font-normal leading-normal text-text-secondary lg:mt-[30px] lg:max-w-[464px] lg:text-left">
        Upload a maximum of <b>50 photos</b>, no more than <b>5MB</b> each.
      </p>
    </div>
  );
}
