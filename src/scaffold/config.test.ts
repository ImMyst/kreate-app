import { describe, expect, it } from "@effect/vitest";
import {
  processPackageJson,
  processGitignore,
  replaceTokens,
  type ScaffoldConfig
} from "./config.js";

const sampleConfig: ScaffoldConfig = {
  projectName: "my-app",
  scopeName: "@my-app",
  frontend: "none"
};

describe("replaceTokens", () => {
  it("replaces projectName token", () => {
    const result = replaceTokens("name: {{projectName}}", sampleConfig);
    expect(result).toBe("name: my-app");
  });

  it("replaces scopeName token", () => {
    const result = replaceTokens("name: {{scopeName}}/domain", sampleConfig);
    expect(result).toBe("name: @my-app/domain");
  });

  it("replaces multiple tokens in same string", () => {
    const result = replaceTokens("{{projectName}} under {{scopeName}}", sampleConfig);
    expect(result).toBe("my-app under @my-app");
  });
});

describe("processPackageJson", () => {
  it("uses project name", () => {
    const result = processPackageJson(sampleConfig);
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe("my-app");
    expect(parsed.private).toBe(true);
    expect(parsed.type).toBe("module");
  });

  it("includes only packages/* workspace for none", () => {
    const result = processPackageJson(sampleConfig);
    const parsed = JSON.parse(result);
    expect(parsed.workspaces.packages).toEqual(["packages/*"]);
    expect(parsed.workspaces.catalog).toBeDefined();
    expect(parsed.workspaces.catalog.effect).toBe("^4.0.0-beta.74");
  });

  it("includes apps/* workspace for web", () => {
    const config = { ...sampleConfig, frontend: "web" as const };
    const result = processPackageJson(config);
    const parsed = JSON.parse(result);
    expect(parsed.workspaces.packages).toContain("apps/*");
    expect(parsed.workspaces.packages).toContain("packages/*");
  });

  it("includes apps/* workspace for mobile", () => {
    const config = { ...sampleConfig, frontend: "mobile" as const };
    const result = processPackageJson(config);
    const parsed = JSON.parse(result);
    expect(parsed.workspaces.packages).toContain("apps/*");
  });

  it("has correct scripts", () => {
    const result = processPackageJson(sampleConfig);
    const parsed = JSON.parse(result);
    expect(parsed.scripts.dev).toBe("turbo dev");
    expect(parsed.scripts.typecheck).toBe("turbo typecheck");
    expect(parsed.scripts.test).toBe("vitest run");
  });

  it("has correct packageManager", () => {
    const result = processPackageJson(sampleConfig);
    const parsed = JSON.parse(result);
    expect(parsed.packageManager).toBe("bun@1.3.14");
  });
});

describe("processGitignore", () => {
  it("includes base entries for none", () => {
    const content = processGitignore(sampleConfig);
    expect(content).toContain("node_modules/");
    expect(content).toContain("bun.lockb");
    expect(content).toContain(".repos/");
    expect(content).toContain(".turbo/**");
  });

  it("adds web entries for web frontend", () => {
    const content = processGitignore({ ...sampleConfig, frontend: "web" });
    expect(content).toContain(".vinxi/");
    expect(content).toContain(".nitro/");
    expect(content).toContain(".tanstack/");
    expect(content).toContain(".output/");
  });

  it("adds mobile entries for mobile frontend", () => {
    const content = processGitignore({ ...sampleConfig, frontend: "mobile" });
    expect(content).toContain(".expo/");
    expect(content).toContain(".expo-shared/");
    expect(content).toContain("ios/");
    expect(content).toContain("android/");
  });
});
