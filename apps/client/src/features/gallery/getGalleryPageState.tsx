import type { ReactNode } from "react";

import { isNotFoundError } from "@/shared/api/isNotFoundError";
import { PageError } from "@/shared/ui/PageError";
import { PageLoader } from "@/shared/ui/PageLoader";

type GetGalleryPageStateParams = {
  isValidGalleryId: boolean;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  onRetry: () => void;
};

export function getGalleryPageState({
  isValidGalleryId,
  isPending,
  isError,
  error,
  isFetching,
  onRetry,
}: GetGalleryPageStateParams): ReactNode | null {
  if (!isValidGalleryId) {
    return (
      <PageError
        title="Invalid Gallery"
        description="This gallery id is incorrect."
      />
    );
  }

  if (isPending) {
    return <PageLoader text="Loading gallery..." />;
  }

  if (isError && isNotFoundError(error)) {
    return (
      <PageError
        title="Gallery Not Found"
        description="This gallery doesn’t exist or you don’t have access to it."
      />
    );
  }

  if (isError) {
    return (
      <PageError
        title="Couldn’t Load Gallery"
        description="Please try again."
        onAction={onRetry}
        isActionPending={isFetching}
      />
    );
  }

  return null;
}
