// ./tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./src/content/**/*.{md,mdx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { 
        sans: ["var(--font-bellota)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"] 
      },
      colors: {
        // OpenAI-inspired palette
        bg: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--color-accent)",
        "text-mid": "var(--text-mid)",
        "border-light": "var(--border-light)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        
        // Semantic colors
        primary: "#10a37f", // OpenAI green
        secondary: "#64748b",
        muted: "#f1f5f9",
        "muted-dark": "#1e293b",
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)', 
        'lg': 'var(--shadow-lg)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;