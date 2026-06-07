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
