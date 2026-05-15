import { Command } from "effect/unstable/cli";
import { Effect } from "effect";
import { BunServices } from "@effect/platform-bun";
import { newCommand } from "./commands/new.js";
import { reposCommand } from "./commands/repos.js";

const root = Command.make("kreate-app").pipe(
  Command.withSubcommands([newCommand, reposCommand]),
  Command.withDescription("Scaffold a new Effect 4 project ready to develop")
);

const program = Command.run(root, {
  version: "0.1.0"
}).pipe(Effect.provide(BunServices.layer));

Effect.runFork(program);
