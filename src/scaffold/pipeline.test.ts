import { describe, expect, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path, PlatformError } from "effect";

const TestFsLayer = FileSystem.layerNoop({
  exists: (path) => Effect.succeed(path === "/existing-empty" || path === "/existing-full"),
  readDirectory: (path) => {
    if (path === "/existing-empty") return Effect.succeed([".gitignore"]);
    if (path === "/existing-full") return Effect.succeed(["src", ".gitignore"]);
    return Effect.fail(
      PlatformError.systemError({
        _tag: "NotFound",
        module: "FileSystem",
        method: "readDirectory",
        pathOrDescriptor: path
      })
    );
  }
});

function validateDirectory(
  fs: FileSystem.FileSystem,
  dir: string
): Effect.Effect<"empty" | "nonexistent" | "notEmpty", Error> {
  return Effect.gen(function* () {
    const exists = yield* fs.exists(dir);
    if (!exists) return "nonexistent" as const;

    const entries = yield* fs.readDirectory(dir);
    const visible = entries.filter((e) => !e.startsWith("."));
    return visible.length === 0 ? ("empty" as const) : ("notEmpty" as const);
  });
}

describe("validateDirectory", () => {
  layer(Layer.mergeAll(TestFsLayer, Path.layer))((it) => {
    it.effect("returns nonexistent for non-existing directory", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const result = yield* validateDirectory(fs, "/nonexistent");
        expect(result).toBe("nonexistent");
      })
    );

    it.effect("returns empty for directory with only dotfiles", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const result = yield* validateDirectory(fs, "/existing-empty");
        expect(result).toBe("empty");
      })
    );

    it.effect("returns notEmpty for directory with visible files", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const result = yield* validateDirectory(fs, "/existing-full");
        expect(result).toBe("notEmpty");
      })
    );
  });
});
