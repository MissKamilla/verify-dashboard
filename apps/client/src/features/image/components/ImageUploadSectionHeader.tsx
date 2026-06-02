type ImageUploadSectionHeaderProps = {
  title?: string;
  description?: string;
};

export function ImageUploadSectionHeader({
  title = "Upload Photos",
  description = "You can upload one photo or a set of photos.",
}: ImageUploadSectionHeaderProps) {
  return (
    <>
      <h2 className="text-left text-2xl font-bold leading-normal text-text-main">
        {title}
      </h2>

      <p className="mt-2 text-left text-base leading-normal text-text-secondary">
        {description}
      </p>
    </>
  );
}
