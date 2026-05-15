import { Console, Effect, FileSystem, Path } from "effect";
import { validateProjectName } from "./validation.js";
import { writeRootConfig, writeDomainPackage, type FrontendChoice } from "./config.js";
import { DirectoryNotEmptyError, InvalidNameError } from "./errors.js";
import { run as runProcess, ProcessRunner } from "./process-runner.js";

export { type FrontendChoice };

export interface ScaffoldOptions {
  readonly rawName: string;
  readonly targetDir: string;
  readonly frontend: FrontendChoice;
}

export function validateDirectory(
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

function logCommand(cmd: string, args: string[]): Effect.Effect<void> {
  return Console.log(`  $ ${cmd} ${args.join(" ")}`);
}

export function scaffold(
  options: ScaffoldOptions
): Effect.Effect<
  void,
  InvalidNameError | DirectoryNotEmptyError | Error,
  FileSystem.FileSystem | Path.Path | ProcessRunner
> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    yield* Console.log(`Scaffolding project: ${options.rawName}`);
    yield* Console.log("");

    const projectName = yield* validateProjectName(options.rawName);
    const scopeName = `@${projectName}`;

    const targetDir =
      options.targetDir === "." ? path.resolve(process.cwd()) : path.resolve(options.targetDir);

    yield* Console.log(`  Project: ${projectName}`);
    yield* Console.log(`  Scope: ${scopeName}`);
    yield* Console.log(`  Target: ${targetDir}`);
    yield* Console.log(`  Frontend: ${options.frontend}`);
    yield* Console.log("");

    yield* Console.log("Step 1: Validating target directory...");
    const dirStatus = yield* validateDirectory(fs, targetDir);
    if (dirStatus === "notEmpty") {
      return yield* Effect.fail(new DirectoryNotEmptyError({ path: targetDir }));
    }
    if (dirStatus === "nonexistent") {
      yield* fs.makeDirectory(targetDir, { recursive: true });
    }
    yield* Console.log("  OK");
    yield* Console.log("");

    yield* Console.log("Step 2: Writing root config...");
    yield* writeRootConfig(fs, path, targetDir, {
      projectName,
      scopeName,
      frontend: options.frontend
    });
    yield* Console.log("  OK");
    yield* Console.log("");

    yield* Console.log("Step 3: Creating domain package...");
    yield* writeDomainPackage(fs, path, targetDir, {
      projectName,
      scopeName,
      frontend: options.frontend
    });
    yield* Console.log("  OK");
    yield* Console.log("");

    yield* Console.log("Step 4: Initializing git...");
    yield* logCommand("git", ["init"]);
    yield* runProcess("git", ["init"], { cwd: targetDir });
    yield* Console.log("  OK");
    yield* Console.log("");

    yield* Console.log("Step 5: Installing dependencies...");
    yield* logCommand("bun", ["install"]);
    yield* runProcess("bun", ["install"], { cwd: targetDir });
    yield* Console.log("  OK");
    yield* Console.log("");

    yield* Console.log("Step 6: Creating initial commit...");
    yield* logCommand("git", ["add", "."]);
    yield* runProcess("git", ["add", "."], { cwd: targetDir });
    yield* logCommand("git", ["commit", "-m", "Initial scaffold"]);
    yield* runProcess("git", ["commit", "-m", "Initial scaffold"], { cwd: targetDir });
    yield* Console.log("  OK");
    yield* Console.log("");

    if (options.targetDir === ".") {
      yield* Console.log(`Done! Project scaffolded in current directory`);
    } else {
      yield* Console.log(`Done! cd ${projectName} && bun dev`);
    }
  });
}
