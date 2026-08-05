import type { TailwindConfig } from "@react-email/components";

// Mirrors the light-mode palette in web/src/index.css.
// Email clients don't support CSS variables or dark mode reliably,
// so templates are built against a single, fixed light palette.
export const emailTailwindConfig: TailwindConfig = {
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#0a0a0a",
        muted: "#f5f5f5",
        "muted-foreground": "#71717a",
        border: "#e4e4e7",
        primary: "#bef264",
        "primary-foreground": "#0a0a0a",
      },
      fontFamily: {
        sans: ["Inter", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
};
