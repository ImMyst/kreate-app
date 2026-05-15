import { describe, expect, it } from "@effect/vitest";
import {
  getGitignore,
  getPackageJson,
  getTsconfigBase,
  getDomainTsconfig,
  getTurboConfig,
  getOxlintConfig,
  getOxfmtConfig,
  getVitestConfig,
  getVscodeSettings,
  getDomainPackageJson,
  getDomainService,
  getDomainIndex,
  getDomainTest,
  getDomainVitestConfig,
  getCiWorkflow,
  getPreCommitHook
} from "./config.js";

describe("getGitignore", () => {
  it("includes base entries for none", () => {
    const content = getGitignore("none");
    expect(content).toContain("node_modules/");
    expect(content).toContain("bun.lockb");
    expect(content).toContain(".repos/");
    expect(content).toContain(".turbo/**");
  });

  it("adds web entries for web frontend", () => {
    const content = getGitignore("web");
    expect(content).toContain(".vinxi/");
    expect(content).toContain(".nitro/");
    expect(content).toContain(".tanstack/");
    expect(content).toContain(".output/");
  });

  it("adds mobile entries for mobile frontend", () => {
    const content = getGitignore("mobile");
    expect(content).toContain(".expo/");
    expect(content).toContain(".expo-shared/");
    expect(content).toContain("ios/");
    expect(content).toContain("android/");
  });
});

describe("getPackageJson", () => {
  it("creates valid JSON with correct name", () => {
    const content = getPackageJson("my-app", "@my-app", "none");
    const parsed = JSON.parse(content);
    expect(parsed.name).toBe("my-app");
    expect(parsed.private).toBe(true);
    expect(parsed.type).toBe("module");
  });

  it("includes only packages/* workspace for none", () => {
    const content = getPackageJson("my-app", "@my-app", "none");
    const parsed = JSON.parse(content);
    expect(parsed.workspaces).toEqual(["packages/*"]);
  });

  it("includes apps/* workspace for web", () => {
    const content = getPackageJson("my-app", "@my-app", "web");
    const parsed = JSON.parse(content);
    expect(parsed.workspaces).toContain("apps/*");
    expect(parsed.workspaces).toContain("packages/*");
  });

  it("includes apps/* workspace for mobile", () => {
    const content = getPackageJson("my-app", "@my-app", "mobile");
    const parsed = JSON.parse(content);
    expect(parsed.workspaces).toContain("apps/*");
  });

  it("has correct scripts", () => {
    const content = getPackageJson("my-app", "@my-app", "none");
    const parsed = JSON.parse(content);
    expect(parsed.scripts.dev).toBe("turbo dev");
    expect(parsed.scripts.typecheck).toBe("turbo typecheck");
    expect(parsed.scripts.test).toBe("vitest run");
  });

  it("has correct packageManager", () => {
    const content = getPackageJson("my-app", "@my-app", "none");
    const parsed = JSON.parse(content);
    expect(parsed.packageManager).toBe("bun@1.3.14");
  });
});

describe("getTsconfigBase", () => {
  it("creates valid JSON with correct options", () => {
    const content = getTsconfigBase();
    const parsed = JSON.parse(content);
    expect(parsed.compilerOptions.strict).toBe(true);
    expect(parsed.compilerOptions.moduleResolution).toBe("bundler");
    expect(parsed.compilerOptions.noEmit).toBe(true);
  });

  it("includes effect language service plugin", () => {
    const content = getTsconfigBase();
    const parsed = JSON.parse(content);
    expect(parsed.compilerOptions.plugins).toContainEqual({
      name: "@effect/language-service"
    });
  });
});

describe("getDomainTsconfig", () => {
  it("extends base config", () => {
    const content = getDomainTsconfig();
    const parsed = JSON.parse(content);
    expect(parsed.extends).toBe("../../tsconfig.base.json");
  });

  it("sets correct outDir and rootDir", () => {
    const content = getDomainTsconfig();
    const parsed = JSON.parse(content);
    expect(parsed.compilerOptions.outDir).toBe("dist");
    expect(parsed.compilerOptions.rootDir).toBe("src");
  });
});

describe("getTurboConfig", () => {
  it("creates valid JSON with correct schema", () => {
    const content = getTurboConfig();
    const parsed = JSON.parse(content);
    expect(parsed.$schema).toBe("https://turbo.build/schema.json");
  });

  it("has correct task definitions", () => {
    const content = getTurboConfig();
    const parsed = JSON.parse(content);
    expect(parsed.tasks.dev.cache).toBe(false);
    expect(parsed.tasks.dev.persistent).toBe(true);
    expect(parsed.tasks.typecheck.dependsOn).toContain("^typecheck");
    expect(parsed.tasks.test.dependsOn).toContain("^typecheck");
    expect(parsed.tasks.test.dependsOn).toContain("^lint");
  });
});

describe("getOxlintConfig", () => {
  it("creates valid JSON with correct plugins", () => {
    const content = getOxlintConfig();
    const parsed = JSON.parse(content);
    expect(parsed.plugins).toContain("unicorn");
    expect(parsed.plugins).toContain("import");
    expect(parsed.plugins).toContain("typescript");
  });

  it("has correct rules", () => {
    const content = getOxlintConfig();
    const parsed = JSON.parse(content);
    expect(parsed.rules["no-var"]).toBe("error");
    expect(parsed.rules.eqeqeq).toBe("error");
  });
});

describe("getOxfmtConfig", () => {
  it("creates valid JSON with correct options", () => {
    const content = getOxfmtConfig();
    const parsed = JSON.parse(content);
    expect(parsed.indentWidth).toBe(2);
    expect(parsed.lineWidth).toBe(120);
    expect(parsed.singleQuote).toBe(false);
    expect(parsed.trailingComma).toBe("all");
  });
});

describe("getVitestConfig", () => {
  it("includes packages and apps test patterns", () => {
    const content = getVitestConfig();
    expect(content).toContain("packages/*/src/**/*.test.ts");
    expect(content).toContain("apps/*/src/**/*.test.ts");
  });
});

describe("getVscodeSettings", () => {
  it("excludes .repos from search and watcher", () => {
    const content = getVscodeSettings();
    const parsed = JSON.parse(content);
    expect(parsed["search.exclude"]["**/.repos/**"]).toBe(true);
    expect(parsed["files.watcherExclude"]["**/.repos/**"]).toBe(true);
    expect(parsed["explorer.exclude"]["**/.repos/**"]).toBe(true);
  });

  it("sets oxfmt as default formatter", () => {
    const content = getVscodeSettings();
    const parsed = JSON.parse(content);
    expect(parsed["editor.defaultFormatter"]).toBe("oxc.oxfmt-vscode");
    expect(parsed["editor.formatOnSave"]).toBe(true);
  });
});

describe("getDomainPackageJson", () => {
  it("creates valid JSON with correct name", () => {
    const content = getDomainPackageJson("@my-app");
    const parsed = JSON.parse(content);
    expect(parsed.name).toBe("@my-app/domain");
    expect(parsed.type).toBe("module");
  });

  it("has effect as dependency", () => {
    const content = getDomainPackageJson("@my-app");
    const parsed = JSON.parse(content);
    expect(parsed.dependencies.effect).toBe("4.0.0-beta.66");
  });

  it("has correct devDependencies", () => {
    const content = getDomainPackageJson("@my-app");
    const parsed = JSON.parse(content);
    expect(parsed.devDependencies["@effect/vitest"]).toBe("4.0.0-beta.66");
  });
});

describe("getDomainService", () => {
  it("contains Context.Service pattern", () => {
    const content = getDomainService();
    expect(content).toContain("Context.Service");
    expect(content).toContain("@domain/UserService");
  });

  it("exports User interface", () => {
    const content = getDomainService();
    expect(content).toContain("export interface User");
  });

  it("exports UserService class", () => {
    const content = getDomainService();
    expect(content).toContain("export class UserService");
  });
});

describe("getDomainIndex", () => {
  it("re-exports UserService", () => {
    const content = getDomainIndex();
    expect(content).toContain('export * from "./UserService.js"');
  });
});

describe("getDomainTest", () => {
  it("imports from @effect/vitest", () => {
    const content = getDomainTest();
    expect(content).toContain("@effect/vitest");
  });

  it("imports UserService", () => {
    const content = getDomainTest();
    expect(content).toContain('import { UserService } from "./UserService.js"');
  });

  it("uses layer pattern", () => {
    const content = getDomainTest();
    expect(content).toContain("layer(TestUserService)");
  });

  it("has two test cases", () => {
    const content = getDomainTest();
    expect(content).toContain("finds a user by id");
    expect(content).toContain("returns null for unknown user");
  });
});

describe("getDomainVitestConfig", () => {
  it("includes src test pattern", () => {
    const content = getDomainVitestConfig();
    expect(content).toContain("src/**/*.test.ts");
  });
});

describe("getCiWorkflow", () => {
  it("contains CI workflow structure", () => {
    const content = getCiWorkflow();
    expect(content).toContain("name: CI");
    expect(content).toContain("actions/checkout@v4");
    expect(content).toContain("oven-sh/setup-bun@v2");
  });

  it("runs all checks", () => {
    const content = getCiWorkflow();
    expect(content).toContain("bun run typecheck");
    expect(content).toContain("bun run lint");
    expect(content).toContain("bun run format:check");
    expect(content).toContain("bun run test");
  });
});

describe("getPreCommitHook", () => {
  it("has shebang line", () => {
    const content = getPreCommitHook();
    expect(content).toContain("#!/bin/sh");
  });

  it("runs lint and format:check", () => {
    const content = getPreCommitHook();
    expect(content).toContain("bun lint");
    expect(content).toContain("bun format:check");
  });
});
