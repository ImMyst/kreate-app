import { Data } from "effect";

export class InvalidNameError extends Data.TaggedError("InvalidNameError")<{
  readonly name: string;
  readonly reason: string;
}> {}

export class DirectoryNotEmptyError extends Data.TaggedError("DirectoryNotEmptyError")<{
  readonly path: string;
}> {}
