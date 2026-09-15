"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const tabs = [
  { href: "/emi", label: "EMI" },
  { href: "/future-value", label: "Future value" },
  { href: "/present-value", label: "Present value" },
  { href: "/compare", label: "Compare" },
  { href: "/income-tax", label: "Income tax" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on navigation, and on Escape while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="sticky top-0 z-30">
      <header className="rule-b bg-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-work items-stretch gap-4 px-4 sm:gap-6 sm:px-8">
          <Link
            href="/"
            aria-label="Horizon — home"
            className="focusable flex shrink-0 items-center gap-2 py-4 text-lg font-semibold"
          >
            <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 15A6 6 0 0 1 18 15Z" className="fill-accent" />
              <path
                d="M2.5 15H21.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>Horizon</span>
          </Link>

          {/* Tablet and up: horizontal tab bar */}
          <div className="relative hidden min-w-0 flex-1 items-stretch sm:flex">
            <nav className="no-scrollbar flex flex-1 items-stretch gap-5 overflow-x-auto">
              {tabs.map((tab) => {
                const active = pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={`focusable relative flex items-center whitespace-nowrap text-sm transition-colors ${
                      active ? "text-ink" : "text-graphite hover:text-ink"
                    }`}
                  >
                    {tab.label}
                    {active && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 bg-mine" />
                    )}
                  </Link>
                );
              })}
            </nav>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-paper to-transparent"
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
              className="focusable flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rule-strong text-ink transition-colors hover:border-mine sm:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                {open ? (
                  <path
                    d="M4 4L14 14M14 4L4 14"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M2 5H16M2 9H16M2 13H16"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Phone: menu opened from the hamburger button. Rendered outside
          <header> — its backdrop-blur would otherwise become the containing
          block for a `fixed` descendant, shrinking the backdrop to the
          header's own height instead of the full viewport. */}
      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 bg-ink/10 sm:hidden"
          />
          <nav
            id="mobile-nav"
            aria-label="Primary"
            className="absolute inset-x-4 top-full z-30 mt-2 space-y-1 rounded-md border border-rule bg-paper-2 p-2 shadow-sm sm:hidden"
          >
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`focusable flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium transition-colors ${
                    active ? "bg-paper text-mine" : "text-ink hover:bg-paper"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}
