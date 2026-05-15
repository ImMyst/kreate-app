import { Context, Effect } from "effect";

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
