import type { Gallery } from "@/features/gallery/types";

import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";
import { PageError } from "@/shared/ui/PageError";
import { PageLoader } from "@/shared/ui/PageLoader";

import { GalleriesEmptyState } from "./GalleriesEmptyState";
import { GalleriesList } from "./GalleriesList";

type GalleriesContentProps = {
  galleries: Gallery[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  onRetry: () => void;
};

export function GalleriesContent({
  galleries,
  isPending,
  isError,
  error,
  isFetching,
  onRetry,
}: GalleriesContentProps) {
  if (isPending || (isError && isUnauthorizedError(error))) {
    return <PageLoader text="Loading galleries..." />;
  }

  if (isError) {
    return (
      <PageError
        title="Couldn’t Load Galleries"
        description="Please try again."
        onAction={onRetry}
        isActionPending={isFetching}
      />
    );
  }

  if (galleries.length === 0) {
    return <GalleriesEmptyState />;
  }

  return <GalleriesList galleries={galleries} />;
}
