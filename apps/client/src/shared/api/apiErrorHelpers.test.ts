import { describe, expect, it } from "vitest";

import { getApiErrorMessage } from "./getApiErrorMessage";
import { isNotFoundError } from "./isNotFoundError";
import { isUnauthorizedError } from "./isUnauthorizedError";

const createAxiosError = ({
  status,
  message,
}: {
  status?: number;
  message?: unknown;
}) => ({
  isAxiosError: true,
  response: {
    status,
    data: {
      message,
    },
  },
});

describe("getApiErrorMessage", () => {
  it("returns fallback message for non-Axios error", () => {
    expect(getApiErrorMessage(new Error("Unexpected error"))).toBe(
      "Something went wrong",
    );
  });

  it("returns string message from API response", () => {
    expect(
      getApiErrorMessage(
        createAxiosError({
          message: "Gallery not found",
        }),
      ),
    ).toBe("Gallery not found");
  });

  it("joins validation messages from API response", () => {
    expect(
      getApiErrorMessage(
        createAxiosError({
          message: [
            "Title must be at least 2 characters",
            "Description is too long",
          ],
        }),
      ),
    ).toBe("Title must be at least 2 characters, Description is too long");
  });

  it("returns fallback message when API message has unsupported type", () => {
    expect(
      getApiErrorMessage(
        createAxiosError({
          message: {
            text: "Unexpected format",
          },
        }),
      ),
    ).toBe("Something went wrong");
  });
});

describe("isNotFoundError", () => {
  it("returns true for Axios error with status 404", () => {
    expect(
      isNotFoundError(
        createAxiosError({
          status: 404,
        }),
      ),
    ).toBe(true);
  });

  it("returns false for Axios error with another status", () => {
    expect(
      isNotFoundError(
        createAxiosError({
          status: 500,
        }),
      ),
    ).toBe(false);
  });

  it("returns false for non-Axios error", () => {
    expect(isNotFoundError(new Error("Unexpected error"))).toBe(false);
  });
});

describe("isUnauthorizedError", () => {
  it("returns true for Axios error with status 401", () => {
    expect(
      isUnauthorizedError(
        createAxiosError({
          status: 401,
        }),
      ),
    ).toBe(true);
  });

  it("returns false for Axios error with another status", () => {
    expect(
      isUnauthorizedError(
        createAxiosError({
          status: 403,
        }),
      ),
    ).toBe(false);
  });

  it("returns false for non-Axios error", () => {
    expect(isUnauthorizedError(new Error("Unexpected error"))).toBe(false);
  });
});
