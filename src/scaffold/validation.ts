import * as Effect from "effect/Effect";
import { InvalidNameError } from "./errors.js";

const npmNameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export function validateProjectName(raw: string): Effect.Effect<string, InvalidNameError> {
  const normalized = (raw === "."
    ? (process.cwd().split("/").pop() || process.cwd())
    : raw
  ).toLowerCase().replace(/\s+/g, "-");

  if (!npmNameRegex.test(normalized)) {
    return Effect.fail(
      new InvalidNameError({
        name: normalized,
        reason: "Must be lowercase, no spaces, hyphens allowed."
      })
    );
  }
  return Effect.succeed(normalized);
}
