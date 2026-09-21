"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

// framer-motion loads in its own chunk, off the shared root-layout bundle
// every page pays for — mirrors ThemeToggle/SolarSwitch and Reveal.
const NavUnderline = dynamic(
  () => import("./HeaderMotion").then((m) => m.NavUnderline),
  { ssr: false, loading: () => <span className="absolute inset-x-0 -bottom-px h-0.5 bg-mine" /> },
);
const MobileNav = dynamic(() => import("./HeaderMotion").then((m) => m.MobileNav), { ssr: false });

const tabs = [
  { href: "/emi", label: "EMI" },
  { href: "/future-value", label: "Future value" },
  { href: "/present-value", label: "Present value" },
  { href: "/compare", label: "Compare" },
  { href: "/income-tax", label: "Income tax" },
  { href: "/learn", label: "Learn" },
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
                    {active && <NavUnderline />}
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
              className="focusable flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rule-strong text-ink transition-[border-color,transform] duration-150 hover:border-mine active:scale-90 sm:hidden"
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
      <MobileNav
        open={open}
        tabs={tabs}
        activeHref={(href) => pathname.startsWith(href)}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
