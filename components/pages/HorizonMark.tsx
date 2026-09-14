"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HorizonMarkMotion = dynamic(
  () => import("./HorizonMarkMotion").then((m) => m.HorizonMarkMotion),
  { ssr: false },
);

/**
 * The one authored moment on the hub: the brand's half-sun-over-horizon
 * mark, scaled up and set behind the header, drifts at its own rate as
 * you scroll past — the literal "horizon" the app is named for, not a
 * generic decorative parallax layer. Purely decorative, so it simply
 * doesn't render until its (framer-motion) chunk has loaded.
 */
export function HorizonMark() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return <HorizonMarkMotion />;
}
