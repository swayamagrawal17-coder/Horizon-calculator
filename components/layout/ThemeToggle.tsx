"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      suppressHydrationWarning
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} paper` : "Switch theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="focusable font-mono text-xs text-graphite transition-colors hover:text-ink"
    >
      <span suppressHydrationWarning>
        {mounted ? (isDark ? "[ light ]" : "[ dark ]") : "[ · ]"}
      </span>
    </button>
  );
}
