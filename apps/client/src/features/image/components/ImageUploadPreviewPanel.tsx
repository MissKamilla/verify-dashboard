import { PhotoPreviewPlaceholderGrid } from "@/shared/ui/PhotoPreviewPlaceholderGrid";
import { ScrollArea } from "@/shared/ui/ScrollArea";

import {
  IMAGE_PREVIEW_BOTTOM_FADE_OFFSET,
  MAX_IMAGE_SIZE_LABEL,
  MAX_IMAGES_PER_GALLERY,
} from "@/features/image/constants";
import type { SelectedUploadImage } from "@/features/image/hooks/useImageUploadSelection";
import { ImageUploadPreviewCard } from "./ImageUploadPreviewCard";

type ImageUploadPreviewPanelProps = {
  selectedImages: SelectedUploadImage[];
  disabled: boolean;
  onMetafieldChange: (
    imageId: string,
    field: "name" | "comment",
    value: string,
  ) => void;
};

export function ImageUploadPreviewPanel({
  selectedImages,
  disabled,
  onMetafieldChange,
}: ImageUploadPreviewPanelProps) {
  if (selectedImages.length === 0) {
    return (
      <PhotoPreviewPlaceholderGrid
        maxImages={MAX_IMAGES_PER_GALLERY}
        maxImageSizeLabel={MAX_IMAGE_SIZE_LABEL}
      />
    );
  }

  return (
    <ScrollArea
      itemsCount={selectedImages.length}
      trackBottomOffset={IMAGE_PREVIEW_BOTTOM_FADE_OFFSET}
      className="max-md:flex-none max-md:overflow-visible md:h-full md:w-full md:max-w-[680px] md:pr-8 2xl:max-w-[860px]"
      contentClassName="max-md:h-auto max-md:overflow-visible md:pr-8"
      thumbWrapperClassName="md:block"
      bottomOverlayClassName="h-[79px] bg-gradient-to-b from-white/0 via-white/80 to-white"
    >
      <div
        className="flex w-full flex-col gap-[30px]"
        style={{ paddingBottom: IMAGE_PREVIEW_BOTTOM_FADE_OFFSET }}
      >
        {selectedImages.map((image) => (
          <ImageUploadPreviewCard
            key={image.id}
            id={image.id}
            previewUrl={image.previewUrl}
            name={image.metafields.name}
            comment={image.metafields.comment}
            disabled={disabled}
            onMetafieldChange={onMetafieldChange}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
