import type { Config } from "tailwindcss";

const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: rgb("--paper"),
        "paper-2": rgb("--paper-2"),
        ink: rgb("--ink"),
        "ink-2": rgb("--ink-2"),
        graphite: rgb("--graphite"),
        rule: rgb("--rule"),
        "rule-strong": rgb("--rule-strong"),
        accent: rgb("--accent"),
        "accent-2": rgb("--accent-2"),
        mine: rgb("--mine"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        figure: ["var(--font-figure)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: {
        none: "0",
        sm: "1px",
        DEFAULT: "2px",
        md: "3px",
      },
      maxWidth: {
        work: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
