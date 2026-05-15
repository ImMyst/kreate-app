import { describe, expect, layer } from "@effect/vitest";
import { ProcessRunnerTag, make as makeProcessRunner } from "./process-runner.js";
import { validateDirectory } from "./pipeline.js";
import * as PlatformError from "effect/PlatformError";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";

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

const _TestProcessRunnerLayer = Layer.succeed(ProcessRunnerTag)(
  makeProcessRunner(() => Effect.void)
);

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

describe("scaffold process calls", () => {
  const ScaffoldFsLayer = FileSystem.layerNoop({
    exists: () => Effect.succeed(true),
    readDirectory: () => Effect.succeed([]),
    makeDirectory: () => Effect.void,
    writeFileString: () => Effect.void,
    chmod: () => Effect.void
  });

  layer(Layer.mergeAll(ScaffoldFsLayer, Path.layer))((it) => {
    it.effect("runs git init, bun install, git add, git commit", () =>
      Effect.gen(function* () {
        const calls: Array<{ cmd: string; args: ReadonlyArray<string>; cwd?: string }> = [];
        const mockRunner = makeProcessRunner(
          (cmd: string, args: ReadonlyArray<string>, options?: { cwd?: string }) =>
            Effect.sync(() => {
              calls.push({ cmd, args, cwd: options?.cwd });
            })
        );

        const { scaffold } = yield* Effect.promise(() => import("./pipeline.js"));
        yield* scaffold({
          rawName: "test-app",
          targetDir: "/tmp/test-app",
          frontend: "none"
        }).pipe(Effect.provideService(ProcessRunnerTag, mockRunner));

        const cmds = calls.map((c) => `${c.cmd} ${c.args.join(" ")}`);
        expect(cmds).toContain("git init");
        expect(cmds).toContain("bun install");
        expect(cmds).toContain("git add .");
        expect(cmds).toContain("git commit -m Initial scaffold");
      })
    );

    it.effect("uses current directory when targetDir is '.'", () =>
      Effect.gen(function* () {
        const calls: Array<{ cmd: string; args: ReadonlyArray<string>; cwd?: string }> = [];
        const mockRunner = makeProcessRunner(
          (cmd: string, args: ReadonlyArray<string>, options?: { cwd?: string }) =>
            Effect.sync(() => {
              calls.push({ cmd, args, cwd: options?.cwd });
            })
        );

        const { scaffold } = yield* Effect.promise(() => import("./pipeline.js"));
        yield* scaffold({
          rawName: ".",
          targetDir: ".",
          frontend: "none"
        }).pipe(Effect.provideService(ProcessRunnerTag, mockRunner));

        const cwd = calls[0]?.cwd;
        expect(cwd).toBe(process.cwd());
      })
    );
  });
});
