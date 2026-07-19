import { GalleryAccessRow } from "./GalleryAccessRow";
import { useGalleryAccessesQuery } from "@/features/gallery/galleryQueries";

import { PageError } from "@/shared/ui/PageError";
import { PageLoader } from "@/shared/ui/PageLoader";

type GalleryAccessListProps = {
  galleryId: number;
};

export function GalleryAccessList({ galleryId }: GalleryAccessListProps) {
  const {
    data: accesses = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useGalleryAccessesQuery(galleryId);

  if (isPending) {
    return <PageLoader text="Loading users..." />;
  }

  if (isError) {
    return (
      <PageError
        title="Couldn’t load users"
        description="Please try again."
        onAction={() => void refetch()}
        isActionPending={isFetching}
      />
    );
  }

  if (accesses.length === 0) {
    return (
      <section className="rounded-[30px] bg-white p-5 shadow-card md:p-[30px]">
        <h2 className="text-2xl font-bold text-text-main">No shared access</h2>

        <p className="mt-2 text-base text-text-secondary">
          This gallery has not been shared with other users yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[30px] bg-white p-[30px] shadow-card">
      <h2 className="text-2xl font-bold text-text-main">Users with access</h2>

      <div className="mt-6">
        <div className="hidden grid-cols-[1fr_1.4fr_140px_48px] gap-4 border-b border-border-default px-4 pb-3 text-sm font-bold text-text-secondary md:grid">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Action</span>
        </div>

        <div>
          {accesses.map((access) => (
            <GalleryAccessRow key={access.id} access={access} />
          ))}
        </div>
      </div>
    </section>
  );
}
