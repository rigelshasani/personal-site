import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./src/content/**/*.{md,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: { 
        sans: ["var(--font-bellota)", "ui-sans-serif", "system-ui"] 
      },
      colors: {
        bg: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--color-accent)",
        "text-mid": "var(--text-mid)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;