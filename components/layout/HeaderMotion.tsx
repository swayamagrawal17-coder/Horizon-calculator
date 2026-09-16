"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface NavTab {
  href: string;
  label: string;
}

/** The animated half of Header (see Header.tsx) — split into its own
 * chunk so framer-motion isn't part of the shared root-layout bundle. */

/** Desktop tab bar: the active-tab underline slides between tabs on
 * navigation instead of jump-cutting, since Header persists across route
 * changes in the app router. */
export function NavUnderline() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.span
      layoutId="nav-underline"
      className="absolute inset-x-0 -bottom-px h-0.5 bg-mine"
      transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
    />
  );
}

/** Phone menu: backdrop fade plus a settling panel with a short staggered
 * entrance for its links — makes opening/closing read as one continuous
 * move instead of a jump-cut. */
export function MobileNav({
  open,
  tabs,
  activeHref,
  onClose,
}: {
  open: boolean;
  tabs: NavTab[];
  activeHref: (href: string) => boolean;
  onClose: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && [
        <motion.button
          key="backdrop"
          aria-hidden
          tabIndex={-1}
          onClick={onClose}
          className="fixed inset-0 z-20 bg-ink/10 sm:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
        />,
        <motion.nav
          key="panel"
          id="mobile-nav"
          aria-label="Primary"
          className="absolute inset-x-4 top-full z-30 mt-2 space-y-1 rounded-md border border-rule bg-paper-2 p-2 shadow-sm sm:hidden"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {tabs.map((tab, i) => {
            const active = activeHref(tab.href);
            return (
              <motion.div
                key={tab.href}
                initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.18,
                  delay: shouldReduceMotion ? 0 : i * 0.03,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onClose}
                  className={`focusable flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium transition-colors ${
                    active ? "bg-mine/10 text-mine" : "text-ink hover:bg-paper"
                  }`}
                >
                  {tab.label}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>,
      ]}
    </AnimatePresence>
  );
}
