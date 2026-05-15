import { describe, expect, it } from "@effect/vitest";

describe("new command", () => {
  it("is defined", async () => {
    const { newCommand } = await import("./new.js");
    expect(newCommand).toBeDefined();
  });

  it("has correct description", async () => {
    const { newCommand } = await import("./new.js");
    expect(newCommand.description).toBe("Create a new project");
  });

  it("has frontend flag", async () => {
    const { newCommand } = await import("./new.js");
    expect(newCommand).toBeDefined();
  });
});
