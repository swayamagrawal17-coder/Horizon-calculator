"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const RevealMotion = dynamic(
  () => import("./RevealMotion").then((m) => m.RevealMotion),
  { ssr: false },
);

/**
 * The one authored moment: a results panel settles into place the first
 * time it scrolls into view, as if a figure were being entered on the
 * page — not a generic per-section reveal repeated down the site.
 *
 * Content renders immediately, unanimated; framer-motion loads in its own
 * chunk and swaps in once mounted (mirrors ThemeToggle/SolarSwitch).
 */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={className}>{children}</div>;
  return <RevealMotion className={className}>{children}</RevealMotion>;
}
