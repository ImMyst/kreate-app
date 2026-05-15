import { Command, Prompt } from "effect/unstable/cli";
import { Console, Effect, FileSystem, Path } from "effect";
import { addRepo, availableRepos, isInGitRepo, NotInGitRepoError } from "./vendoring.js";

export const reposCommand = Command.make("repos", {}, () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    yield* Console.log("Adding vendored repositories...");
    yield* Console.log("");

    const inGit = yield* isInGitRepo(fs, path);
    if (!inGit) {
      return yield* Effect.fail(new NotInGitRepoError());
    }

    const selected = yield* Prompt.multiSelect({
      message: "Select repositories to add:",
      choices: availableRepos.map((r) => ({ title: r.name, value: r }))
    });

    if (selected.length === 0) {
      yield* Console.log("No repositories selected.");
      return;
    }

    yield* Console.log("");

    for (const repo of selected) {
      yield* addRepo(repo);
    }

    yield* Console.log("Done!");
  })
).pipe(
  Command.withDescription("Add vendored repositories via git subtree"),
  Command.withShortDescription("Add vendored repos")
);
