import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 font-figure text-3xl leading-tight tracking-tight sm:text-[2.6rem]">
        This page doesn&apos;t exist
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-2">
        The page you&apos;re looking for isn&apos;t here. It may have moved,
        or the link might be off.
      </p>
      <Link
        href="/"
        className="focusable mt-6 inline-flex min-h-[40px] items-center rounded-sm bg-ink px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper hover:bg-accent"
      >
        Back to the EMI calculator
      </Link>
    </div>
  );
}
