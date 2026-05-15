import { Command, Flag } from "effect/unstable/cli";
import { Console, Effect } from "effect";

export const newCommand = Command.make(
  "new",
  {
    projectName: Flag.string("project-name")
  },
  (config) =>
    Effect.gen(function* () {
      yield* Console.log(`Scaffolding project: ${config.projectName}`);
      yield* Console.log("TODO: implement scaffold pipeline");
    })
).pipe(
  Command.withDescription("Create a new project"),
  Command.withShortDescription("Create a new project")
);
