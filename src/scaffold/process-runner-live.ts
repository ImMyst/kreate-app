import { Effect, Layer } from "effect";
import { ProcessRunnerTag, make } from "./process-runner.js";

function spawn(cmd: string, args: ReadonlyArray<string>, cwd?: string): Effect.Effect<void, Error> {
  return Effect.tryPromise({
    try: async () => {
      const proc = Bun.spawn([cmd, ...args], { cwd: cwd ?? process.cwd() });
      await proc.exited;
      if (proc.exitCode !== 0) {
        const stderr = await new Response(proc.stderr).text();
        throw new Error(stderr);
      }
    },
    catch: (e) => new Error(`Command failed: ${cmd} ${args.join(" ")}\n${e}`)
  }).pipe(Effect.asVoid);
}

export const ProcessRunnerLive = Layer.succeed(ProcessRunnerTag)(
  make((cmd: string, args: ReadonlyArray<string>, options?: { cwd?: string }) =>
    spawn(cmd, args, options?.cwd)
  )
);
