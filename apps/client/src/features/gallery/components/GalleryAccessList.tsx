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
      <section className="rounded-[30px] bg-white p-[30px] text-center shadow-card">
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
        <div className="hidden grid-cols-[1fr_1.4fr_120px] gap-4 border-b border-border-default px-4 pb-3 text-sm font-bold text-text-secondary md:grid">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
        </div>

        <div>
          {accesses.map((access) => {
            const fullName =
              `${access.user.firstname} ${access.user.lastname}`.trim();

            return (
              <div
                key={access.id}
                className="grid gap-2 border-b border-border-default px-4 py-4 last:border-b-0 md:grid-cols-[1fr_1.4fr_120px] md:items-center md:gap-4"
              >
                <div>
                  <span className="text-xs font-bold text-text-secondary md:hidden">
                    User
                  </span>

                  <p className="text-sm text-text-main">{fullName}</p>
                </div>

                <div>
                  <span className="text-xs font-bold text-text-secondary md:hidden">
                    Email
                  </span>

                  <p className="break-all text-sm text-text-main">
                    {access.user.email}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-text-secondary md:hidden">
                    Role
                  </span>

                  <p className="text-sm capitalize text-text-main">
                    {access.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
