import { useParams } from "react-router";

import { ImageUploadForm } from "@/features/image/components/ImageUploadForm";
import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";
import { GalleryWorkflowPageLayout } from "@/features/gallery/components/GalleryWorkflowPageLayout";

export function UploadPhotosPage() {
  const { galleryId } = useParams();

  const numericGalleryId = Number(galleryId);
  const isValidGalleryId =
    Number.isInteger(numericGalleryId) && numericGalleryId > 0;

  if (!isValidGalleryId) {
    return (
      <section className="flex min-h-[calc(100vh-60px)] flex-col">
        <div className="flex min-h-[420px] items-center justify-center rounded-[30px] bg-white px-6 text-center shadow-card">
          <div>
            <h1 className="text-2xl font-bold leading-normal text-text-main">
              Invalid gallery
            </h1>

            <GalleryBackLink
              to="/galleries"
              label="Back to galleries"
              variant="brand"
              className="mt-6"
            />
          </div>
        </div>
      </section>
    );
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
