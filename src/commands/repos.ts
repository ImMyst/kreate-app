import { Command, Prompt } from "effect/unstable/cli";
import { addRepo, availableRepos, isInGitRepo, NotInGitRepoError } from "./vendoring.js";
import { Console, Effect, FileSystem, Path } from "effect";

export const reposCommand = Command.make("repos", {}, () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    yield* Console.log("Adding vendored repositories...");
    yield* Console.log("");

    const inGit = yield* isInGitRepo(fs, path);
    if (!inGit) {
      return yield* new NotInGitRepoError();
    }

    const selected = yield* Prompt.multiSelect({
      message: "Select repositories to add:",
      choices: availableRepos.map((repo) => ({ title: repo.name, value: repo }))
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
