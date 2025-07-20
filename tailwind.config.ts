import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./src/content/**/*.{md,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg:      "var(--color-bg)",
        surface: "var(--color-surface)",
        text:    {
          high: "var(--color-text-high)",
          mid:  "var(--color-text-mid)"
        },
        accent:  "var(--color-accent)"
      },
      borderRadius: {
        md: "var(--radius-md)"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
} satisfies Config;
