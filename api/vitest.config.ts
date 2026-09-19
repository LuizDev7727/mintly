import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Alias '@' to the 'src' directory
    },
  },
  test: {
    reporters: "verbose",
    setupFiles: ["./src/tests/setup.ts"],
    // Every test file boots the app, which fetches its secrets from Infisical.
    // Fewer parallel files on CI means fewer requests in the same instant.
    maxWorkers: process.env.CI ? 2 : undefined,
    // coverage: {
    //   enabled: true,
    //   provider: 'v8',
    //   reporter: ['text', 'text-summary', 'html'],
    //   all: true,
    //   include: ['src/**/*.ts'],
    //   exclude: ['**/*.test.ts', 'src/tests/**'],
    // },
  },
});
