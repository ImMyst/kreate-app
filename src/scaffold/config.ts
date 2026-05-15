import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";

export type FrontendChoice = "none" | "web" | "mobile";

export interface ScaffoldConfig {
  readonly projectName: string;
  readonly scopeName: string;
  readonly frontend: FrontendChoice;
}

// ── Templates ──────────────────────────────────────────────

const tplPackageJson = `{
  "name": "{{projectName}}",
  "private": true,
  "type": "module",
  "workspaces": {
    "packages": [
      "packages/*"{{#hasApps}},
      "apps/*"{{/hasApps}}
    ],
    "catalog": {
      "effect": "^4.0.0-beta.66",
      "@effect/vitest": "4.0.0-beta.66",
      "@effect/language-service": "^0.86.1"
    }
  },
  "scripts": {
    "dev": "turbo dev",
    "typecheck": "turbo typecheck",
    "lint": "turbo lint",
    "format": "oxfmt . --write",
    "format:check": "oxfmt . --check",
    "test": "vitest run",
    "test:watch": "vitest",
    "precommit": "effect-language-service patch && bun run typecheck && bun run lint && bun run format && bun run test",
    "prepare": "bun run precommit"
  },
  "devDependencies": {
    "@effect/language-service": "catalog:",
    "@effect/vitest": "catalog:",
    "@types/bun": "latest",
    "oxfmt": "latest",
    "oxlint": "latest",
    "turbo": "latest",
    "typescript": "^6.0.3",
    "vitest": "latest"
  },
  "packageManager": "bun@1.3.14"
}
`;

const tplGitignoreBase = `node_modules/
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
.repos/
coverage/
*.lcov
tmp/
temp/
`;

const tplGitignoreWeb = `.vinxi/
.nitro/
.tanstack/
.output/
dist-ssr/
*.local
`;

const tplGitignoreMobile = `.expo/
.expo-shared/
dist/
web-build/
ios/
android/
`;

const tplTsconfigBase = `{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "plugins": [
      {
        "name": "@effect/language-service",
        "namespaceImportPackages": ["@effect/platform-node", "effect"],
        "diagnosticSeverity": {
          "importFromBarrel": "error",
          "anyUnknownInErrorContext": "error",
          "unsafeEffectTypeAssertion": "error",
          "instanceOfSchema": "error",
          "deterministicKeys": "error",
          "strictEffectProvide": "off",
          "missingEffectServiceDependency": "error",
          "leakingRequirements": "error",
          "globalErrorInEffectCatch": "error",
          "globalErrorInEffectFailure": "error",
          "unknownInEffectCatch": "error",
          "strictBooleanExpressions": "off",
          "preferSchemaOverJson": "error",
          "schemaSyncInEffect": "error",
          "cryptoRandomUUID": "error",
          "cryptoRandomUUIDInEffect": "error",
          "nodeBuiltinImport": "error",
          "globalDate": "error",
          "globalDateInEffect": "error",
          "globalConsole": "error",
          "globalConsoleInEffect": "error",
          "globalRandom": "error",
          "globalRandomInEffect": "error",
          "globalTimers": "error",
          "globalTimersInEffect": "error"
        }
      }
    ]
  }
}
`;

const tplTurboConfig = `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "format": {},
    "test": {
      "dependsOn": ["^typecheck", "^lint"]
    }
  }
}
`;

const tplOxlintConfig = `{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "plugins": ["unicorn", "import", "typescript"],
  "rules": {
    "no-var": "error",
    "eqeqeq": "error"
  }
}
`;

const tplOxfmtConfig = `{
  "indentWidth": 2,
  "lineWidth": 120,
  "singleQuote": false,
  "trailingComma": "all"
}
`;

const tplVitestConfig = `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/src/**/*.test.ts", "apps/*/src/**/*.test.ts"],
  },
});
`;

const tplVscodeSettings = `{
  "oxc.fmt.configPath": ".oxfmtrc.json",
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true,

  "js/ts.tsdk.path": "./node_modules/typescript/lib",
  "js/ts.tsdk.promptToUseWorkspaceVersion": true,

  "js/ts.preferences.autoImportFileExcludePatterns": [".repos/**"],

  "files.exclude": {
    ".repos/**": true
  },

  "files.watcherExclude": {
    ".repos/**": true
  },

  "search.exclude": {
    ".repos/**": true
  }
}
`;

const tplCiWorkflow = `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  format:
    name: Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: package.json
      - run: bun install --frozen-lockfile
      - run: bun run format:check

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: package.json
      - run: bun install --frozen-lockfile
      - run: bun run lint

  typecheck:
    name: Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: package.json
      - run: bun install --frozen-lockfile
      - run: bun run typecheck

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: package.json
      - run: bun install --frozen-lockfile
      - run: bun run test
`;

const tplDomainPackageJson = `{
  "name": "{{scopeName}}/domain",
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "oxlint .",
    "format": "oxfmt . --write",
    "format:check": "oxfmt . --check",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "effect": "catalog:"
  },
  "devDependencies": {
    "@effect/vitest": "catalog:",
    "vitest": "latest"
  }
}
`;

const tplDomainTsconfig = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`;

const tplDomainVitestConfig = `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
`;

const tplDomainService = `import { Effect, Context } from "effect";

export interface User {
  readonly id: string;
  readonly name: string;
}

export class UserService extends Context.Service<UserService, {
  readonly findById: (id: string) => Effect.Effect<User | null>;
}>()("@domain/UserService") {}
`;

const tplDomainIndex = `export * from "./UserService.js";
`;

const tplDomainTest = `import { describe, expect, layer } from "@effect/vitest";
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

// ── Token replacement ──────────────────────────────────────

export function replaceTokens(content: string, config: ScaffoldConfig): string {
  return content
    .replaceAll("{{projectName}}", config.projectName)
    .replaceAll("{{scopeName}}", config.scopeName);
}

export function processPackageJson(config: ScaffoldConfig): string {
  const hasApps = config.frontend !== "none";
  const content = replaceTokens(tplPackageJson, config);
  if (hasApps) {
    return content.replace("{{#hasApps}},", ",").replace('"apps/*"{{/hasApps}}', '"apps/*"');
  }
  return content.replace("{{#hasApps}},\n", "").replace('"apps/*"{{/hasApps}}\n', "");
}

export function processGitignore(config: ScaffoldConfig): string {
  let content = tplGitignoreBase;
  if (config.frontend === "web") content += tplGitignoreWeb;
  if (config.frontend === "mobile") content += tplGitignoreMobile;
  return content;
}

// ── Write functions ────────────────────────────────────────

export function writeRootConfig(
  fs: FileSystem.FileSystem,
  path: Path.Path,
  targetDir: string,
  config: ScaffoldConfig
): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    const join = (...parts: string[]) => path.resolve(targetDir, ...parts);

    yield* fs.writeFileString(join("package.json"), processPackageJson(config));
    yield* fs.writeFileString(join("tsconfig.base.json"), tplTsconfigBase);
    yield* fs.writeFileString(join("turbo.json"), tplTurboConfig);
    yield* fs.writeFileString(join(".oxlintrc.json"), tplOxlintConfig);
    yield* fs.writeFileString(join(".oxfmtrc.json"), tplOxfmtConfig);
    yield* fs.writeFileString(join("vitest.config.ts"), tplVitestConfig);
    yield* fs.writeFileString(join(".gitignore"), processGitignore(config));

    yield* fs.makeDirectory(join(".vscode"), { recursive: true });
    yield* fs.writeFileString(join(".vscode", "settings.json"), tplVscodeSettings);

    yield* fs.makeDirectory(join(".github", "workflows"), { recursive: true });
    yield* fs.writeFileString(join(".github", "workflows", "ci.yml"), tplCiWorkflow);
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
      replaceTokens(tplDomainPackageJson, config)
    );
    yield* fs.writeFileString(join("packages", "domain", "tsconfig.json"), tplDomainTsconfig);
    yield* fs.writeFileString(
      join("packages", "domain", "vitest.config.ts"),
      tplDomainVitestConfig
    );
    yield* fs.writeFileString(
      join("packages", "domain", "src", "UserService.ts"),
      tplDomainService
    );
    yield* fs.writeFileString(join("packages", "domain", "src", "index.ts"), tplDomainIndex);
    yield* fs.writeFileString(
      join("packages", "domain", "src", "UserService.test.ts"),
      tplDomainTest
    );
  });
}
