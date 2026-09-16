"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** The animated half of SegmentedControl (see primitives.tsx) — split into
 * its own chunk so framer-motion isn't part of every calculator page's
 * initial parse. A sliding highlight makes the selection change legible
 * as movement between options, not just a color swap. */
export function SegmentedControlMotion<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: string;
  onChange: (v: T) => void;
  label: string;
}) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const move = (fromIndex: number, delta: number) => {
    const nextIndex = (fromIndex + delta + options.length) % options.length;
    onChange(options[nextIndex].value);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex gap-0.5 rounded-full border border-rule bg-paper p-1"
    >
      {options.map((opt, index) => {
        const checked = value === opt.value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(index, 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(index, -1);
              }
            }}
            className={`focusable relative min-h-[32px] rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              checked ? "text-mine" : "text-graphite hover:text-ink"
            }`}
          >
            {checked && (
              <motion.span
                layoutId={`${label}-pill`}
                className="absolute inset-0 rounded-full bg-mine/10 shadow-sm"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 500, damping: 34 }
                }
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
