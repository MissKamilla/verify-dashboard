import type { ReactNode } from "react";

import type { SelectedUploadImage } from "@/features/image/hooks/useImageUploadSelection";

import { ImageUploadFormGrid } from "./ImageUploadFormGrid";
import { ImageUploadPreviewPanel } from "./ImageUploadPreviewPanel";

type ImageUploadFormContentProps = {
  selectedImages: SelectedUploadImage[];
  previewDisabled: boolean;
  sideContent: ReactNode;
  actions?: ReactNode;
  onMetafieldChange: (
    imageId: string,
    field: "name" | "comment",
    value: string,
  ) => void;
};

export function ImageUploadFormContent({
  selectedImages,
  previewDisabled,
  sideContent,
  actions,
  onMetafieldChange,
}: ImageUploadFormContentProps) {
  return (
    <>
      <ImageUploadFormGrid>
        <div className="flex flex-col gap-[30px]">{sideContent}</div>

        <ImageUploadPreviewPanel
          selectedImages={selectedImages}
          disabled={previewDisabled}
          onMetafieldChange={onMetafieldChange}
        />
      </ImageUploadFormGrid>

      {actions && (
        <div className="mt-auto flex shrink-0 justify-center gap-[30px] pt-[30px] max-md:flex-col-reverse max-md:items-center max-md:gap-4 md:justify-end">
          {actions}
        </div>
      )}
    </>
  );
}
