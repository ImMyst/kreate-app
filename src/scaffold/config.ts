import { Effect, FileSystem, Path } from "effect";

export type FrontendChoice = "none" | "web" | "mobile";

const baseGitignore = `node_modules/
.npm
bun.lockb
dist/
build/
.turbo/**
*.tsbuildinfo
tsconfig.tsbuildinfo
*.swp
*.swo
*~
.DS_Store
Thumbs.db
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env
.env.local
.env.*.local
.husky/_
.repos/
coverage/
*.lcov
tmp/
temp/
`;

const webGitignoreAdditions = `.vinxi/
.nitro/
.tanstack/
.output/
dist-ssr/
*.local
`;

const mobileGitignoreAdditions = `.expo/
.expo-shared/
dist/
web-build/
ios/
android/
`;

function getGitignore(frontend: FrontendChoice): string {
  let content = baseGitignore;
  if (frontend === "web") content += webGitignoreAdditions;
  if (frontend === "mobile") content += mobileGitignoreAdditions;
  return content;
}

function getPackageJson(projectName: string, scopeName: string, frontend: FrontendChoice) {
  const workspaces = ["packages/*"];
  if (frontend !== "none") workspaces.push("apps/*");

  const scripts: Record<string, string> = {
    dev: "turbo dev",
    typecheck: "turbo typecheck",
    lint: "turbo lint",
    format: "oxfmt . --write",
    "format:check": "oxfmt . --check",
    test: "vitest run",
    "test:watch": "vitest"
  };

  return (
    JSON.stringify(
      {
        name: projectName,
        private: true,
        type: "module",
        workspaces,
        scripts,
        devDependencies: {
          "@effect/language-service": "^0.86.1",
          "@effect/vitest": "4.0.0-beta.66",
          "@types/bun": "latest",
          oxfmt: "^0.49.0",
          oxlint: "latest",
          turbo: "latest",
          typescript: "^6.0.3",
          vitest: "latest"
        },
        packageManager: "bun@1.3.14"
      },
      null,
      2
    ) + "\n"
  );
}

function getTsconfigBase() {
  return (
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          moduleResolution: "bundler",
          module: "ESNext",
          target: "ESNext",
          skipLibCheck: true,
          esModuleInterop: true,
          verbatimModuleSyntax: true,
          noUncheckedIndexedAccess: true,
          exactOptionalPropertyTypes: true,
          noEmit: true,
          plugins: [{ name: "@effect/language-service" }]
        }
      },
      null,
      2
    ) + "\n"
  );
}

function getDomainTsconfig() {
  return (
    JSON.stringify(
      {
        extends: "../../tsconfig.base.json",
        compilerOptions: {
          outDir: "dist",
          rootDir: "src"
        },
        include: ["src"]
      },
      null,
      2
    ) + "\n"
  );
}

function getTurboConfig() {
  return (
    JSON.stringify(
      {
        $schema: "https://turbo.build/schema.json",
        tasks: {
          dev: {
            cache: false,
            persistent: true
          },
          typecheck: {
            dependsOn: ["^typecheck"]
          },
          lint: {
            dependsOn: ["^lint"]
          },
          format: {},
          test: {
            dependsOn: ["^typecheck", "^lint"]
          }
        }
      },
      null,
      2
    ) + "\n"
  );
}

function getOxlintConfig() {
  return (
    JSON.stringify(
      {
        $schema:
          "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
        plugins: ["unicorn", "import", "typescript"],
        rules: {
          "no-var": "error",
          eqeqeq: "error"
        }
      },
      null,
      2
    ) + "\n"
  );
}

function getOxfmtConfig() {
  return (
    JSON.stringify(
      {
        indentWidth: 2,
        lineWidth: 120,
        singleQuote: false,
        trailingComma: "all"
      },
      null,
      2
    ) + "\n"
  );
}

function getVitestConfig() {
  return `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/src/**/*.test.ts", "apps/*/src/**/*.test.ts"],
  },
});
`;
}

function getVscodeSettings() {
  return (
    JSON.stringify(
      {
        "search.exclude": {
          "**/.repos/**": true
        },
        "files.watcherExclude": {
          "**/.repos/**": true
        },
        "explorer.exclude": {
          "**/.repos/**": true
        },
        "editor.defaultFormatter": "oxc.oxfmt-vscode",
        "editor.formatOnSave": true
      },
      null,
      2
    ) + "\n"
  );
}

function getDomainPackageJson(scopeName: string) {
  return (
    JSON.stringify(
      {
        name: `${scopeName}/domain`,
        type: "module",
        scripts: {
          typecheck: "tsc --noEmit",
          lint: "oxlint .",
          format: "oxfmt . --write",
          "format:check": "oxfmt . --check",
          test: "vitest run",
          "test:watch": "vitest"
        },
        dependencies: {
          effect: "4.0.0-beta.66"
        },
        devDependencies: {
          "@effect/vitest": "4.0.0-beta.66",
          vitest: "latest"
        }
      },
      null,
      2
    ) + "\n"
  );
}

function getDomainService() {
  return `import { Effect, Context } from "effect";

export interface User {
  readonly id: string;
  readonly name: string;
}

export class UserService extends Context.Service<UserService, {
  readonly findById: (id: string) => Effect.Effect<User | null>;
}>()("@domain/UserService") {}
`;
}

function getDomainIndex() {
  return `export * from "./UserService.js";
`;
}

function getDomainTest() {
  return `import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { UserService } from "./UserService.js";

const TestUserService = Layer.succeed(
  UserService,
  {
    findById: (id) =>
      id === "1"
        ? Effect.succeed({ id: "1", name: "Alice" })
        : Effect.succeed(null),
  }
);

describe("UserService", () => {
  layer(TestUserService)((it) => {
    it.effect("finds a user by id", () =>
      Effect.gen(function* () {
        const service = yield* UserService;
        const user = yield* service.findById("1");
        expect(user).not.toBeNull();
        expect(user!.name).toBe("Alice");
      }));

    it.effect("returns null for unknown user", () =>
      Effect.gen(function* () {
        const service = yield* UserService;
        const user = yield* service.findById("999");
        expect(user).toBeNull();
      }));
  });
});
`;
}

function getDomainVitestConfig() {
  return `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
`;
}

function getCiWorkflow() {
  return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run typecheck
      - run: bun run lint
      - run: bun run format:check
      - run: bun run test
`;
}

function getPreCommitHook() {
  return `#!/bin/sh
bun lint && bun format:check
`;
}

export interface ScaffoldConfig {
  readonly projectName: string;
  readonly scopeName: string;
  readonly frontend: FrontendChoice;
}

export function writeRootConfig(
  fs: FileSystem.FileSystem,
  path: Path.Path,
  targetDir: string,
  config: ScaffoldConfig
): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    const join = (...parts: string[]) => path.resolve(targetDir, ...parts);

    yield* fs.writeFileString(
      join("package.json"),
      getPackageJson(config.projectName, config.scopeName, config.frontend)
    );
    yield* fs.writeFileString(join("tsconfig.base.json"), getTsconfigBase());
    yield* fs.writeFileString(join("turbo.json"), getTurboConfig());
    yield* fs.writeFileString(join(".oxlintrc.json"), getOxlintConfig());
    yield* fs.writeFileString(join(".oxfmtrc.json"), getOxfmtConfig());
    yield* fs.writeFileString(join("vitest.config.ts"), getVitestConfig());
    yield* fs.writeFileString(join(".gitignore"), getGitignore(config.frontend));

    yield* fs.makeDirectory(join(".vscode"), { recursive: true });
    yield* fs.writeFileString(join(".vscode", "settings.json"), getVscodeSettings());

    yield* fs.makeDirectory(join(".github", "workflows"), { recursive: true });
    yield* fs.writeFileString(join(".github", "workflows", "ci.yml"), getCiWorkflow());

    yield* fs.makeDirectory(join(".husky"), { recursive: true });
    yield* fs.writeFileString(join(".husky", "pre-commit"), getPreCommitHook());
    yield* fs.chmod(join(".husky", "pre-commit"), 0o755);
  });
}

export function writeDomainPackage(
  fs: FileSystem.FileSystem,
  path: Path.Path,
  targetDir: string,
  config: ScaffoldConfig
): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    const join = (...parts: string[]) => path.resolve(targetDir, ...parts);
    const srcDir = join("packages", "domain", "src");

    yield* fs.makeDirectory(srcDir, { recursive: true });

    yield* fs.writeFileString(
      join("packages", "domain", "package.json"),
      getDomainPackageJson(config.scopeName)
    );
    yield* fs.writeFileString(join("packages", "domain", "tsconfig.json"), getDomainTsconfig());
    yield* fs.writeFileString(
      join("packages", "domain", "vitest.config.ts"),
      getDomainVitestConfig()
    );
    yield* fs.writeFileString(
      join("packages", "domain", "src", "UserService.ts"),
      getDomainService()
    );
    yield* fs.writeFileString(join("packages", "domain", "src", "index.ts"), getDomainIndex());
    yield* fs.writeFileString(
      join("packages", "domain", "src", "UserService.test.ts"),
      getDomainTest()
    );
  });
}
