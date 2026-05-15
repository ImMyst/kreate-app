import * as Data from "effect/Data";
import { ProcessRunner, run as runProcess } from "../scaffold/process-runner.js";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";

export interface RepoDefinition {
  readonly name: string;
  readonly url: string;
  readonly branch: string;
}

export const availableRepos: RepoDefinition[] = [
  { name: "effect", url: "https://github.com/Effect-TS/effect-smol.git", branch: "main" },
  { name: "opencode", url: "https://github.com/anomalyco/opencode.git", branch: "main" },
  { name: "t3code", url: "https://github.com/pingdotgg/t3code.git", branch: "main" }
];

export class NotInGitRepoError extends Data.TaggedError("NotInGitRepoError")<{}> {}

export function isInGitRepo(
  fs: FileSystem.FileSystem,
  path: Path.Path
): Effect.Effect<boolean, Error> {
  return Effect.gen(function* () {
    const gitDir = path.join(process.cwd(), ".git");
    return yield* fs.exists(gitDir);
  });
}

export function addRepo(
  repo: RepoDefinition
): Effect.Effect<void, Error, FileSystem.FileSystem | ProcessRunner> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const localPath = `.repos/${repo.name}`;
    const exists = yield* fs.exists(localPath);

    if (exists) {
      yield* Console.log(`  Skipping ${repo.name} (already exists)`);
      return;
    }

    yield* Console.log(`Adding ${repo.name}...`);

    yield* runProcess("git", [
      "clone",
      "--depth",
      "1",
      "--branch",
      repo.branch,
      repo.url,
      localPath
    ]);

    yield* runProcess("git", ["add", localPath]);

    yield* runProcess("git", [
      "subtree",
      "add",
      `--prefix=${localPath}`,
      localPath,
      repo.branch,
      "--squash"
    ]);

    yield* runProcess("rm", ["-rf", `${localPath}/.git`]);

    yield* Console.log(`  ${repo.name} added`);
    yield* Console.log("");
  });
}
