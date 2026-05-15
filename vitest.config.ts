import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "bun-builtins",
      enforce: "pre",
      resolveId(id) {
        if (id.startsWith("bun:")) {
          return { id, external: true };
        }
      }
    }
  ],
  ssr: {
    external: ["bun:sqlite"]
  },
  test: {
    globals: true,
    environment: "node",
    server: {
      deps: {
        external: [/^bun:/]
      }
    },
    include: ["src/**/*.test.ts"]
  }
});
