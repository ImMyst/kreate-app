import { describe, expect, it, layer } from "@effect/vitest";
import { ProcessRunnerTag, make as makeProcessRunner } from "../scaffold/process-runner.js";
import { isInGitRepo, addRepo, availableRepos, NotInGitRepoError } from "./vendoring.js";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";

describe("availableRepos", () => {
  it("has at least one repo", () => {
    expect(availableRepos.length).toBeGreaterThan(0);
  });

  it("each repo has name, url, and branch", () => {
    for (const repo of availableRepos) {
      expect(repo.name).toBeTruthy();
      expect(repo.url).toMatch(/^https:\/\//);
      expect(repo.branch).toBeTruthy();
    }
  });
});

describe("isInGitRepo", () => {
  const TestFsLayer = FileSystem.layerNoop({
    exists: (p) => Effect.succeed(p.endsWith(".git"))
  });

  layer(Layer.mergeAll(TestFsLayer, Path.layer))((it) => {
    it.effect("returns true when .git exists", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const result = yield* isInGitRepo(fs, path);
        expect(result).toBe(true);
      })
    );
  });

  const NoGitFsLayer = FileSystem.layerNoop({
    exists: () => Effect.succeed(false)
  });

  layer(Layer.mergeAll(NoGitFsLayer, Path.layer))((it) => {
    it.effect("returns false when .git does not exist", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const result = yield* isInGitRepo(fs, path);
        expect(result).toBe(false);
      })
    );
  });
});

describe("addRepo", () => {
  const TestFsLayer = FileSystem.layerNoop({
    exists: () => Effect.succeed(false),
    makeDirectory: () => Effect.void
  });

  const MockProcessRunnerLayer = Layer.succeed(ProcessRunnerTag)(
    makeProcessRunner(() => Effect.void)
  );

  layer(Layer.mergeAll(TestFsLayer, Path.layer, MockProcessRunnerLayer))((it) => {
    it.effect("calls git clone, add, subtree add, and rm for new repo", () =>
      Effect.gen(function* () {
        const calls: Array<{ cmd: string; args: ReadonlyArray<string> }> = [];
        const mockRunner = makeProcessRunner((cmd: string, args: ReadonlyArray<string>) =>
          Effect.sync(() => calls.push({ cmd, args }))
        );

        yield* addRepo(availableRepos[0]).pipe(Effect.provideService(ProcessRunnerTag, mockRunner));

        const cmds = calls.map((c) => c.cmd);
        expect(cmds).toContain("git");
        expect(cmds).toContain("rm");

        const cloneCall = calls.find((c) => c.args[0] === "clone");
        expect(cloneCall).toBeDefined();
        expect(cloneCall!.args).toContain("--depth");
        expect(cloneCall!.args).toContain("1");

        const subtreeCall = calls.find((c) => c.args[0] === "subtree");
        expect(subtreeCall).toBeDefined();
        expect(subtreeCall!.args).toContain("add");
        expect(subtreeCall!.args).toContain("--squash");
      })
    );

    it.effect("skips when repo already exists", () =>
      Effect.gen(function* () {
        const calls: Array<{ cmd: string }> = [];
        const mockRunner = makeProcessRunner((cmd: string) =>
          Effect.sync(() => calls.push({ cmd }))
        );

        const ExistsFsLayer = FileSystem.layerNoop({
          exists: () => Effect.succeed(true),
          makeDirectory: () => Effect.void
        });

        yield* addRepo(availableRepos[0]).pipe(
          Effect.provideService(ProcessRunnerTag, mockRunner),
          Effect.provide(ExistsFsLayer)
        );

        expect(calls.length).toBe(0);
      })
    );
  });
});

describe("NotInGitRepoError", () => {
  it("has correct tag", () => {
    const err = new NotInGitRepoError();
    expect(err._tag).toBe("NotInGitRepoError");
  });
});
