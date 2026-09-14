"use client";

import { useId } from "react";
import { useNumericInput, formatWithSep } from "@/hooks/useNumericInput";

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}

/** A single-line ₹-prefixed number field — no slider, for one-off annual figures. */
export function CompactField({
  label,
  value,
  onChange,
  min = 0,
  max = 100_000_000,
  prefix,
  suffix,
  hint,
}: Props) {
  const id = useId();
  const { editing, text, setText, startEditing, commit } = useNumericInput({
    value,
    onChange,
    min,
    max,
  });

  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <label htmlFor={id} className="text-[0.82rem] text-graphite">
        {label}
        {hint && <span className="ml-1.5 text-[0.75rem] normal-case text-graphite/70">{hint}</span>}
      </label>
      <div className="flex shrink-0 items-baseline gap-1 border-b border-dashed border-rule-strong text-ink transition-colors focus-within:border-solid focus-within:border-mine hover:border-solid hover:border-mine">
        {prefix && <span className="text-graphite">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          aria-label={`${label}, type an exact value`}
          className="w-24 bg-transparent py-0.5 text-right text-sm outline-none tnum"
          value={editing ? text : formatWithSep(value)}
          onFocus={startEditing}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
        {suffix && <span className="text-graphite">{suffix}</span>}
      </div>
    </div>
  );
}
