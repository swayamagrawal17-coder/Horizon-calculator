"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** The animated half of HorizonMark — split into its own chunk (see
 * HorizonMark.tsx) so framer-motion isn't part of the hub's initial parse. */
export function HorizonMarkMotion() {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const sunY = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const horizonY = useTransform(scrollYProgress, [0, 1], [0, -12]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.07, 0.02]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-80 overflow-hidden sm:block"
    >
      <motion.svg
        viewBox="0 0 200 100"
        className="absolute -top-6 right-0 h-64 w-64 opacity-[0.07]"
        style={shouldReduceMotion ? undefined : { opacity }}
      >
        <motion.path
          d="M50 70A50 50 0 0 1 150 70Z"
          className="fill-accent"
          style={shouldReduceMotion ? undefined : { y: sunY }}
        />
        <motion.path
          d="M10 70H190"
          stroke="currentColor"
          strokeWidth="2"
          className="text-ink"
          style={shouldReduceMotion ? undefined : { y: horizonY }}
        />
      </motion.svg>
    </div>
  );
}
