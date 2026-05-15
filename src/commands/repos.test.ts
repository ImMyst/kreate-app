import { describe, expect, it } from "@effect/vitest";

describe("repos command", () => {
  it("is defined", async () => {
    const { reposCommand } = await import("./repos.js");
    expect(reposCommand).toBeDefined();
  });
});
