import { PhotoPreviewPlaceholderGrid } from "@/shared/ui/PhotoPreviewPlaceholderGrid";
import { ScrollArea } from "@/shared/ui/ScrollArea";

import { MAX_IMAGE_SIZE_LABEL, MAX_IMAGES_PER_GALLERY } from "../constants";
import type { SelectedUploadImage } from "../hooks/useImageUploadSelection";
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
      trackBottomOffset={120}
      bottomOverlayBottomOffset={119}
      className="max-md:flex-none max-md:overflow-visible md:h-full md:w-full md:max-w-[680px] md:pr-8 md:pb-[120px] 2xl:max-w-[860px]"
      contentClassName="max-md:h-auto max-md:overflow-visible md:pr-8 md:pb-[120px]"
      thumbWrapperClassName="md:block"
      bottomOverlayClassName="h-[120px] bg-gradient-to-b from-white/0 to-white"
    >
      <div className="flex w-full flex-col gap-[30px]">
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
