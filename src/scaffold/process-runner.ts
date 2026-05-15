import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

export interface ProcessRunner {
  readonly run: (
    cmd: string,
    args: ReadonlyArray<string>,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<void, Error>;
}

export const ProcessRunnerTag = Context.Service<ProcessRunner>("kreate/ProcessRunner");

export const make = (run: ProcessRunner["run"]): ProcessRunner => ({ run });

export const run = (
  cmd: string,
  args: ReadonlyArray<string>,
  options?: { readonly cwd?: string }
): Effect.Effect<void, Error, ProcessRunner> =>
  Effect.flatMap(ProcessRunnerTag, (runner) => runner.run(cmd, args, options));
