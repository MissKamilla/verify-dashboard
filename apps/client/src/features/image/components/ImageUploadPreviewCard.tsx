import { ImageMetafieldsCard } from "./ImageMetafieldsCard";

type ImageUploadPreviewCardProps = {
  id: string;
  previewUrl: string;
  name: string;
  comment: string;
  disabled?: boolean;
  onMetafieldChange: (
    imageId: string,
    field: "name" | "comment",
    value: string,
  ) => void;
};

export function ImageUploadPreviewCard({
  id,
  previewUrl,
  name,
  comment,
  disabled = false,
  onMetafieldChange,
}: ImageUploadPreviewCardProps) {
  return (
    <ImageMetafieldsCard
      id={id}
      imageSrc={previewUrl}
      imageAlt={name.trim() || "Selected photo"}
      name={name}
      comment={comment}
      disabled={disabled}
      onMetafieldChange={onMetafieldChange}
    />
  );
}
