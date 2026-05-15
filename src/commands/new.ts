import { Argument, Command, Flag, Prompt } from "effect/unstable/cli";
import { Effect } from "effect";
import { scaffold, type FrontendChoice } from "../scaffold/pipeline.js";

const frontendChoices: { title: string; value: FrontendChoice }[] = [
  { title: "none (backend-only)", value: "none" },
  { title: "web (Tanstack Start + Tailwind)", value: "web" },
  { title: "mobile (Expo + Tamagui)", value: "mobile" }
];

export const newCommand = Command.make(
  "new",
  {
    rawName: Argument.string("project-name").pipe(
      Argument.withDescription("Project name (or '.' for current directory)")
    ),
    frontend: Flag.choiceWithValue("frontend", [
      ["none", "none" as const],
      ["web", "web" as const],
      ["mobile", "mobile" as const]
    ]).pipe(Flag.withDescription("Frontend template to include"), Flag.optional)
  },
  (config) =>
    Effect.gen(function* () {
      const frontend: FrontendChoice =
        config.frontend._tag === "Some"
          ? config.frontend.value
          : yield* Prompt.select({
              message: "Choose a frontend template:",
              choices: frontendChoices
            });

      const targetDir = config.rawName === "." ? "." : config.rawName;

      yield* scaffold({
        rawName: config.rawName,
        targetDir,
        frontend
      });
    })
).pipe(
  Command.withDescription("Create a new project"),
  Command.withShortDescription("Create a new project")
);
