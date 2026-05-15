import { Effect, Result } from "effect";

const npmNameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export function validateProjectName(raw: string): Effect.Effect<string, Error> {
  if (raw === ".") {
    return Effect.sync(() => {
      const cwd = process.cwd();
      const basename = cwd.split("/").pop() || cwd;
      const normalized = basename.toLowerCase().replace(/\s+/g, "-");
      if (!npmNameRegex.test(normalized)) {
        return Result.fail(
          new Error(
            `Invalid project name "${normalized}". Must be lowercase, no spaces, hyphens allowed.`
          )
        );
      }
      return Result.succeed(normalized);
    }).pipe(
      Effect.flatMap((result) =>
        Result.isFailure(result) ? Effect.fail(result.failure) : Effect.succeed(result.success)
      )
    );
  }

  const normalized = raw.toLowerCase().replace(/\s+/g, "-");
  if (!npmNameRegex.test(normalized)) {
    return Effect.fail(
      new Error(
        `Invalid project name "${normalized}". Must be lowercase, no spaces, hyphens allowed.`
      )
    );
  }
  return Effect.succeed(normalized);
}
