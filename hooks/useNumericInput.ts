"use client";

import { useEffect, useState } from "react";
import { clamp } from "@/lib/format";

interface Options {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

/** Shared click-to-type behavior for SliderField and CompactField: shows a
 * formatted number at rest, switches to a raw editable string on focus, and
 * commits a clamped number on blur/Enter. */
export function useNumericInput({ value, onChange, min, max }: Options) {
  const [text, setText] = useState(String(value));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setText(String(value));
  }, [value, editing]);

  const startEditing = () => {
    setEditing(true);
    setText(String(value));
  };

  const commit = () => {
    setEditing(false);
    const parsed = Number(text.replace(/[, ]/g, ""));
    const next = clamp(Number.isFinite(parsed) ? parsed : value, min, max);
    onChange(next);
    setText(String(next));
  };

  return { editing, text, setText, startEditing, commit };
}

export function formatWithSep(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
