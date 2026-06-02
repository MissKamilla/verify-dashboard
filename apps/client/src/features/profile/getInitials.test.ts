import { describe, expect, it } from "vitest";

import { getInitials } from "./getInitials";

describe("getInitials", () => {
  it("returns uppercase initials from first and last name", () => {
    expect(getInitials("John", "Doe")).toBe("JD");
  });

  it("removes spaces around names", () => {
    expect(getInitials("  John  ", "  Doe  ")).toBe("JD");
  });

  it("returns one initial when lastname is missing", () => {
    expect(getInitials("John", "")).toBe("J");
  });

  it("returns fallback initial when both names are missing", () => {
    expect(getInitials()).toBe("U");
  });
});
