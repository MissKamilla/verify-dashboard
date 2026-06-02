import { CreateGalleryForm } from "@/features/gallery/components/CreateGalleryForm";
import { GalleryWorkflowPageLayout } from "@/features/gallery/components/GalleryWorkflowPageLayout";

export function CreateGalleryPage() {
  return (
    <GalleryWorkflowPageLayout
      title="Create a new gallery"
      actionTo="/galleries"
      actionLabel="Go to gallery list"
    >
      <CreateGalleryForm />
    </GalleryWorkflowPageLayout>
  );
}
