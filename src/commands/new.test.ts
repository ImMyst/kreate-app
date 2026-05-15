import { describe, expect, it } from "@effect/vitest";

describe("new command", () => {
  it("is defined", async () => {
    const { newCommand } = await import("./new.js");
    expect(newCommand).toBeDefined();
  });
});
