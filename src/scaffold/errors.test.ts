import { describe, expect, it } from "@effect/vitest";
import { InvalidNameError, DirectoryNotEmptyError } from "./errors.js";

describe("InvalidNameError", () => {
  it("has correct tag", () => {
    const err = new InvalidNameError({ name: "bad-name", reason: "test" });
    expect(err._tag).toBe("InvalidNameError");
  });

  it("carries name and reason", () => {
    const err = new InvalidNameError({ name: "MyApp", reason: "must be lowercase" });
    expect(err.name).toBe("MyApp");
    expect(err.reason).toBe("must be lowercase");
  });
});

describe("DirectoryNotEmptyError", () => {
  it("has correct tag", () => {
    const err = new DirectoryNotEmptyError({ path: "/some/path" });
    expect(err._tag).toBe("DirectoryNotEmptyError");
  });

  it("carries path", () => {
    const err = new DirectoryNotEmptyError({ path: "/tmp/project" });
    expect(err.path).toBe("/tmp/project");
  });
});
