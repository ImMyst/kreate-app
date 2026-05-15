import * as Effect from "effect/Effect";
import { ProcessRunnerTag, make } from "./process-runner.js";
import * as Layer from "effect/Layer";
import { CommandError } from "./errors.js";

function spawn(cmd: string, args: ReadonlyArray<string>, cwd?: string): Effect.Effect<void, CommandError> {
  return Effect.tryPromise({
    try: async () => {
      const proc = Bun.spawn([cmd, ...args], { cwd: cwd ?? process.cwd() });
      await proc.exited;
      if (proc.exitCode !== 0) {
        const stderr = await new Response(proc.stderr).text();
        throw new CommandError({
          command: `${cmd} ${args.join(" ")}`,
          message: stderr
        });
      }
    },
    catch: (e) => new CommandError({
      command: `${cmd} ${args.join(" ")}`,
      message: e instanceof Error ? e.message : String(e)
    })
  }).pipe(Effect.asVoid);
}

export const ProcessRunnerLive = Layer.succeed(ProcessRunnerTag)(
  make((cmd: string, args: ReadonlyArray<string>, options?: { cwd?: string }) =>
    spawn(cmd, args, options?.cwd)
  )
);
