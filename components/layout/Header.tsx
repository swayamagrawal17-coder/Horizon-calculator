"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const tabs = [
  { href: "/emi", label: "EMI", short: "EMI" },
  { href: "/future-value", label: "Future value", short: "Future" },
  { href: "/present-value", label: "Present value", short: "Present" },
  { href: "/compare", label: "Compare", short: "Compare" },
  { href: "/income-tax", label: "Income tax", short: "Tax" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="rule-b sticky top-0 z-30 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-work items-stretch gap-4 px-4 sm:gap-6 sm:px-8">
        <Link
          href="/"
          aria-label="Horizon — home"
          className="focusable flex shrink-0 items-center gap-2 py-4 text-lg font-semibold"
        >
          <svg
            aria-hidden
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M6 15A6 6 0 0 1 18 15Z" className="fill-accent" />
            <path
              d="M2.5 15H21.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="hidden sm:inline">Horizon</span>
        </Link>

        <nav className="no-scrollbar flex flex-1 items-stretch gap-3 overflow-x-auto sm:gap-5">
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
                <span className="min-[400px]:hidden">{tab.short}</span>
                <span className="hidden min-[400px]:inline">{tab.label}</span>
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-mine" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
