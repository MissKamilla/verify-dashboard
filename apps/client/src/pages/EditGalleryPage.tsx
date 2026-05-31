import { GalleryWorkflowPageLayout } from "@/features/gallery/components/GalleryWorkflowPageLayout";
import { EditGalleryForm } from "@/features/gallery/components/EditGalleryForm";
import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";
import { useGalleryRouteGallery } from "@/features/gallery/hooks/useGalleryRouteGallery";

export function EditGalleryPage() {
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
      title="Edit gallery"
      actionTo={`/galleries/${numericGalleryId}/upload-photos`}
      actionLabel="Upload photos"
      actionLinkClassName="w-[250px]"
      footerLeft={<GalleryBackLink to="/galleries" />}
    >
      <EditGalleryForm key={gallery.id} gallery={gallery} />
    </GalleryWorkflowPageLayout>
  );
}
