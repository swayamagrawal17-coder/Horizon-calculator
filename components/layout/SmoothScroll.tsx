"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// lenis/react is client-only and skipped under reduced motion — load it in
// its own chunk rather than the root layout's shared, on-every-page bundle.
const ReactLenis = dynamic(
  () => import("lenis/react").then((m) => ({ default: m.ReactLenis })),
  { ssr: false },
);

/**
 * Global inertial scroll. Skipped entirely under prefers-reduced-motion —
 * lerped scrolling is itself the kind of spatial movement that preference
 * asks us to drop in favor of the browser's native, immediate scroll.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(!query.matches);
    const onChange = () => setEnabled(!query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis root options={{ duration: 1.05, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
