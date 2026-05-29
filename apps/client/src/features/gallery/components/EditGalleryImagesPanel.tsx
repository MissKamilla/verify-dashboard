import { ImageMetafieldsCard } from "@/features/image/components/ImageMetafieldsCard";
import { getImageSrc } from "@/features/image/getImageSrc";
import type { GalleryImage, ImageMetafields } from "@/features/image/types";
import { ScrollArea } from "@/shared/ui/ScrollArea";

type EditGalleryImagesPanelProps = {
  images: GalleryImage[];
  areImagesPending: boolean;
  areImagesError: boolean;
  disabled: boolean;
  getImageMetafields: (
    imageId: number,
    fallback: ImageMetafields,
  ) => ImageMetafields;
  onMetafieldChange: (
    imageId: string,
    field: "name" | "comment",
    value: string,
  ) => void;
  onRemoveClick: (image: GalleryImage) => void;
};

export function EditGalleryImagesPanel({
  images,
  areImagesPending,
  areImagesError,
  disabled,
  getImageMetafields,
  onMetafieldChange,
  onRemoveClick,
}: EditGalleryImagesPanelProps) {
  return (
    <ScrollArea
      itemsCount={images.length}
      trackBottomOffset={120}
      bottomOverlayBottomOffset={119}
      className="max-md:flex-none max-md:overflow-visible md:h-full md:w-full md:max-w-[680px] md:pr-8 md:pb-[120px] 2xl:max-w-[860px]"
      contentClassName="max-md:h-auto max-md:overflow-visible pt-3 md:pr-8 md:pb-[140px]"
      thumbWrapperClassName="md:block"
      bottomOverlayClassName="h-[120px] bg-gradient-to-b from-white/0 to-white"
    >
      {areImagesPending ? (
        <p className="text-base leading-normal text-text-secondary">
          Loading photos...
        </p>
      ) : areImagesError ? (
        <p className="text-base leading-normal text-error" role="alert">
          Failed to load photos. Please try again.
        </p>
      ) : images.length === 0 ? (
        <p className="text-base leading-normal text-text-secondary">
          No photos yet. You can upload photos to this gallery.
        </p>
      ) : (
        <div className="flex w-full flex-col gap-[30px]">
          {images.map((image) => {
            const metafields = getImageMetafields(image.id, image.metafields);

            return (
              <ImageMetafieldsCard
                key={image.id}
                id={String(image.id)}
                imageSrc={getImageSrc(image.path)}
                imageAlt={
                  metafields.name?.trim() ||
                  image.originalFilename ||
                  "Gallery photo"
                }
                name={metafields.name ?? ""}
                comment={metafields.comment ?? ""}
                disabled={disabled}
                onMetafieldChange={onMetafieldChange}
                onRemoveClick={() => onRemoveClick(image)}
              />
            );
          })}
        </div>
      )}
    </ScrollArea>
  );
}
