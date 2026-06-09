import { isValidElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { PageError } from "@/shared/ui/PageError";
import { PageLoader } from "@/shared/ui/PageLoader";

import { getGalleryPageState } from "./getGalleryPageState";

describe("getGalleryPageState", () => {
  const onRetry = vi.fn();

  it("returns invalid gallery error", () => {
    const result = getGalleryPageState({
      isValidGalleryId: false,
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
      onRetry,
    });

    expect(isValidElement(result)).toBe(true);

    const element = result as ReactElement<{
      title: string;
      description: string;
    }>;

    expect(element.type).toBe(PageError);

    expect(element.props).toEqual({
      title: "Invalid Gallery",
      description: "This gallery id is incorrect.",
    });
  });

  it("returns loader while gallery is pending", () => {
    const result = getGalleryPageState({
      isValidGalleryId: true,
      isPending: true,
      isError: false,
      error: null,
      isFetching: false,
      onRetry,
    });

    const element = result as ReactElement<{
      text: string;
    }>;

    expect(element.type).toBe(PageLoader);

    expect(element.props).toEqual({
      text: "Loading gallery...",
    });
  });

  it("returns not found error for 404 response", () => {
    const result = getGalleryPageState({
      isValidGalleryId: true,
      isPending: false,
      isError: true,
      error: {
        isAxiosError: true,
        response: {
          status: 404,
        },
      },
      isFetching: false,
      onRetry,
    });

    const element = result as ReactElement<{
      title: string;
      description: string;
    }>;

    expect(element.type).toBe(PageError);

    expect(element.props).toEqual({
      title: "Gallery Not Found",
      description: "This gallery doesn’t exist or you don’t have access to it.",
    });
  });

  it("returns retryable error for other failures", () => {
    const result = getGalleryPageState({
      isValidGalleryId: true,
      isPending: false,
      isError: true,
      error: new Error("Unexpected error"),
      isFetching: true,
      onRetry,
    });

    const element = result as ReactElement<{
      title: string;
      description: string;
      onAction: () => void;
      isActionPending: boolean;
    }>;

    expect(element.type).toBe(PageError);

    expect(element.props).toEqual({
      title: "Couldn’t Load Gallery",
      description: "Please try again.",
      onAction: onRetry,
      isActionPending: true,
    });
  });

  it("returns null when gallery can be rendered", () => {
    expect(
      getGalleryPageState({
        isValidGalleryId: true,
        isPending: false,
        isError: false,
        error: null,
        isFetching: false,
        onRetry,
      }),
    ).toBeNull();
  });
});
