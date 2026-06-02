import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";
import { GalleryWorkflowPageLayout } from "@/features/gallery/components/GalleryWorkflowPageLayout";
import { useGalleryRouteGallery } from "@/features/gallery/hooks/useGalleryRouteGallery";
import { ImageUploadForm } from "@/features/image/components/ImageUploadForm";

export function UploadPhotosPage() {
  const { gallery, numericGalleryId, galleryPageState } =
    useGalleryRouteGallery();

  if (galleryPageState) {
    return galleryPageState;
  }

  if (!gallery) {
    return null;
  }

  return (
    <GalleryWorkflowPageLayout
      title="Gallery"
      actionTo={`/galleries/${numericGalleryId}`}
      actionLabel="Go to my gallery"
      actionLinkClassName="w-[250px]"
      footerLeft={
        <GalleryBackLink to={`/galleries/${numericGalleryId}/edit`} />
      }
    >
      <ImageUploadForm galleryId={numericGalleryId} />
    </GalleryWorkflowPageLayout>
  );
}
