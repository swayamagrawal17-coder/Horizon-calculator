"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

// framer-motion is a meaningfully large dependency for one icon animation —
// load it in its own chunk, off the initial script parse for every page,
// rather than bundling it into the shared layout chunk.
const SolarSwitch = dynamic(
  () => import("./SolarSwitch").then((m) => m.SolarSwitch),
  { ssr: false, loading: () => <SolarSwitchStatic /> },
);

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
      className="focusable flex h-9 w-9 items-center justify-center rounded-full border border-rule-strong text-ink transition-colors hover:border-mine"
    >
      {mounted ? <SolarSwitch isDark={isDark} /> : <SolarSwitchStatic />}
    </button>
  );
}

/** Shown before hydration and while the animated version loads. */
function SolarSwitchStatic() {
  return (
    <svg width="18" height="18" viewBox="0 0 25 25" fill="none" aria-hidden>
      <circle cx="12.4058" cy="12.7625" r="5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
