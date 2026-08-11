import { GalleryAccessRow } from "./GalleryAccessRow";
import { useGalleryAccessesQuery } from "@/features/gallery/galleryQueries";

import loadingIconUrl from "@/assets/icons/loading.svg";

type GalleryAccessListProps = {
  galleryId: number;
};

const TITLE_ID = "gallery-access-list-title";

export function GalleryAccessList({ galleryId }: GalleryAccessListProps) {
  const {
    data: accesses = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useGalleryAccessesQuery(galleryId);

  return (
    <section
      aria-labelledby={TITLE_ID}
      className="border-t border-border-default pt-5 md:flex md:min-h-0 md:flex-1 md:flex-col"
    >
      <div className="flex shrink-0 items-center justify-between gap-4">
        <h2
          id={TITLE_ID}
          className="text-lg font-bold leading-normal text-text-main"
        >
          People with access
        </h2>

        {!isPending && !isError && accesses.length > 0 && (
          <span className="shrink-0 text-sm text-text-secondary">
            {accesses.length}
          </span>
        )}
      </div>

      {isPending && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex min-h-[120px] items-center justify-center rounded-2xl border border-border-default"
        >
          <div className="flex items-center gap-3">
            <img
              src={loadingIconUrl}
              alt=""
              aria-hidden="true"
              className="h-6 w-6 animate-spin"
            />

            <p className="text-sm text-text-secondary">Loading users...</p>
          </div>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-border-default px-4 py-5 text-center"
        >
          <p className="text-base font-bold text-text-main">
            Couldn’t load users
          </p>

          <p className="mt-1 text-sm text-text-secondary">Please try again.</p>

          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="mt-4 min-h-10 cursor-pointer rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-avatar active:bg-brand-active disabled:cursor-not-allowed disabled:bg-border-default disabled:text-text-secondary"
          >
            {isFetching ? "Retrying..." : "Try again"}
          </button>
        </div>
      )}

      {!isPending && !isError && accesses.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-border-default px-4 py-6 text-center">
          <p className="text-base font-medium text-text-main">
            No shared access
          </p>

          <p className="mt-1 text-sm text-text-secondary">
            This gallery has not been shared with other users yet.
          </p>
        </div>
      )}

      {!isPending && !isError && accesses.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border-default md:flex md:min-h-0 md:flex-1 md:flex-col">
          <div className="hidden shrink-0 grid-cols-[1fr_1.4fr_140px_48px] gap-4 bg-gallery-preview px-4 py-3 text-xs font-bold text-text-secondary md:grid">
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span className="sr-only">Actions</span>
          </div>

          <div className="scrollbar-gallery-visible-desktop px-4 md:min-h-0 md:flex-1 md:overflow-y-auto md:px-0 md:pr-2">
            {accesses.map((access) => (
              <GalleryAccessRow
                key={`${access.status}-${access.id}`}
                access={access}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
