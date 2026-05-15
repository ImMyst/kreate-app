import { Command } from "effect/unstable/cli";
import { Effect } from "effect";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { newCommand } from "./commands/new.js";

const root = Command.make("kreate-app").pipe(
  Command.withSubcommands([newCommand]),
  Command.withDescription("Scaffold a new Effect 4 project ready to develop")
);

const program = Command.run(root, {
  version: "0.1.0"
}).pipe(Effect.provide(NodeServices.layer));

Effect.runFork(program);
