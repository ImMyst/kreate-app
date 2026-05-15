import { describe, expect, it } from "@effect/vitest";
import { validateProjectName } from "./validation.js";
import { InvalidNameError } from "./errors.js";
import * as Effect from "effect/Effect";

describe("validateProjectName", () => {
  it.effect("accepts a valid lowercase name", () =>
    Effect.gen(function* () {
      const result = yield* validateProjectName("my-app");
      expect(result).toBe("my-app");
    })
  );

  it.effect("accepts a name with numbers", () =>
    Effect.gen(function* () {
      const result = yield* validateProjectName("app123");
      expect(result).toBe("app123");
    })
  );

  it.effect("accepts a single word name", () =>
    Effect.gen(function* () {
      const result = yield* validateProjectName("myapp");
      expect(result).toBe("myapp");
    })
  );

  it.effect("normalizes uppercase to lowercase", () =>
    Effect.gen(function* () {
      const result = yield* validateProjectName("My-App");
      expect(result).toBe("my-app");
    })
  );

  it.effect("normalizes spaces to hyphens", () =>
    Effect.gen(function* () {
      const result = yield* validateProjectName("my app");
      expect(result).toBe("my-app");
    })
  );

  it.effect("fails on name starting with hyphen", () =>
    Effect.gen(function* () {
      const error = yield* validateProjectName("-myapp").pipe(Effect.flip);
      expect(error).toBeInstanceOf(InvalidNameError);
      expect(error._tag).toBe("InvalidNameError");
    })
  );

  it.effect("fails on name ending with hyphen", () =>
    Effect.gen(function* () {
      const error = yield* validateProjectName("myapp-").pipe(Effect.flip);
      expect(error).toBeInstanceOf(InvalidNameError);
      expect(error._tag).toBe("InvalidNameError");
    })
  );

  it.effect("handles dot by deriving from cwd basename", () =>
    Effect.gen(function* () {
      const result = yield* validateProjectName(".");
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBe(result.toLowerCase());
    })
  );
});
