import { Console, Effect, FileSystem, Path } from "effect";
import { validateProjectName } from "./validation.js";
import { writeRootConfig, writeDomainPackage, type FrontendChoice } from "./config.js";

export { type FrontendChoice };

export interface ScaffoldOptions {
  readonly rawName: string;
  readonly targetDir: string;
  readonly frontend: FrontendChoice;
}

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

function runCommand(cmd: string, args: string[], cwd: string): Effect.Effect<void, Error> {
  return Effect.tryPromise({
    try: async () => {
      const proc = Bun.spawn([cmd, ...args], { cwd });
      await proc.exited;
      if (proc.exitCode !== 0) {
        const stderr = await new Response(proc.stderr).text();
        throw new Error(stderr);
      }
    },
    catch: (e) => new Error(`Command failed: ${cmd} ${args.join(" ")}\n${e}`)
  }).pipe(Effect.asVoid);
}

function logCommand(cmd: string, args: string[]): Effect.Effect<void> {
  return Console.log(`  $ ${cmd} ${args.join(" ")}`);
}

export function scaffold(
  options: ScaffoldOptions
): Effect.Effect<void, Error, FileSystem.FileSystem | Path.Path> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    yield* Console.log(`Scaffolding project: ${options.rawName}`);
    yield* Console.log("");

    const projectName = yield* validateProjectName(options.rawName);
    const scopeName = `@${projectName}`;

    const targetDir =
      options.targetDir === "."
        ? path.join(process.cwd(), projectName)
        : path.resolve(options.targetDir);

    yield* Console.log(`  Project: ${projectName}`);
    yield* Console.log(`  Scope: ${scopeName}`);
    yield* Console.log(`  Target: ${targetDir}`);
    yield* Console.log(`  Frontend: ${options.frontend}`);
    yield* Console.log("");

    yield* Console.log("Step 1: Validating target directory...");
    const dirStatus = yield* validateDirectory(fs, targetDir);
    if (dirStatus === "notEmpty") {
      return yield* Effect.fail(
        new Error(
          `Target directory "${targetDir}" is not empty. Use a new directory or run in an empty one.`
        )
      );
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
    yield* runCommand("git", ["init"], targetDir);
    yield* Console.log("  OK");
    yield* Console.log("");

    yield* Console.log("Step 5: Installing dependencies...");
    yield* logCommand("bun", ["install"]);
    yield* runCommand("bun", ["install"], targetDir);
    yield* Console.log("  OK");
    yield* Console.log("");

    yield* Console.log("Step 6: Creating initial commit...");
    yield* logCommand("git", ["add", "."]);
    yield* runCommand("git", ["add", "."], targetDir);
    yield* logCommand("git", ["commit", "-m", "Initial scaffold"]);
    yield* runCommand("git", ["commit", "-m", "Initial scaffold"], targetDir);
    yield* Console.log("  OK");
    yield* Console.log("");

    yield* Console.log(`Done! cd ${projectName} && bun dev`);
  });
}
