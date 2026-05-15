import { Command, Prompt } from "effect/unstable/cli";
import { Console, Effect, FileSystem, Path } from "effect";

interface RepoDefinition {
  readonly name: string;
  readonly url: string;
  readonly branch: string;
}

const repos: RepoDefinition[] = [
  { name: "effect-smol", url: "https://github.com/t3dotgg/effect-smol.git", branch: "main" },
  { name: "opencode", url: "https://github.com/sst/opencode.git", branch: "main" },
  { name: "t3code", url: "https://github.com/t3dotgg/t3code.git", branch: "main" }
];

function isInGitRepo(fs: FileSystem.FileSystem, path: Path.Path): Effect.Effect<boolean, Error> {
  return Effect.gen(function* () {
    const gitDir = path.join(process.cwd(), ".git");
    return yield* fs.exists(gitDir);
  });
}

function runCommand(cmd: string): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    yield* Console.log(`  $ ${cmd}`);
    yield* Effect.tryPromise({
      try: () => Bun.$`${cmd}`,
      catch: (e) => new Error(`Command failed: ${cmd}\n${e}`)
    });
  });
}

export const reposCommand = Command.make("repos", {}, () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    yield* Console.log("Adding vendored repositories...");
    yield* Console.log("");

    const inGit = yield* isInGitRepo(fs, path);
    if (!inGit) {
      return yield* Effect.fail(
        new Error("Not in a git repository. Run this command inside a git project.")
      );
    }

    const selected = yield* Prompt.multiSelect({
      message: "Select repositories to add:",
      choices: repos.map((r) => ({ title: r.name, value: r }))
    });

    if (selected.length === 0) {
      yield* Console.log("No repositories selected.");
      return;
    }

    yield* Console.log("");

    for (const repo of selected) {
      const localPath = `.repos/${repo.name}`;
      const exists = yield* fs.exists(localPath);

      if (exists) {
        yield* Console.log(`  Skipping ${repo.name} (already exists)`);
        continue;
      }

      yield* Console.log(`Adding ${repo.name}...`);

      yield* runCommand(
        `git clone --depth 1 --branch ${repo.branch} ${repo.url} .repos/${repo.name}`
      );

      yield* runCommand(`git add .repos/${repo.name}`);

      yield* runCommand(
        `git subtree add --prefix=.repos/${repo.name} .repos/${repo.name} ${repo.branch} --squash`
      );

      yield* runCommand(`rm -rf .repos/${repo.name}/.git`);

      yield* Console.log(`  ${repo.name} added`);
      yield* Console.log("");
    }

    yield* Console.log("Done!");
  })
).pipe(
  Command.withDescription("Add vendored repositories via git subtree"),
  Command.withShortDescription("Add vendored repos")
);
