"use client";

import { useEffect, useId, useState } from "react";
import { clamp } from "@/lib/format";

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
  labelAside?: React.ReactNode;
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  hint,
  labelAside,
}: Props) {
  const id = useId();
  const [text, setText] = useState(String(value));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setText(String(value));
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const parsed = Number(text.replace(/[, ]/g, ""));
    const next = clamp(Number.isFinite(parsed) ? parsed : value, min, max);
    onChange(next);
    setText(String(next));
  };

  return (
    <div className="py-1">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.82rem] font-medium text-graphite">
          {label}
        </label>
        {labelAside}
      </div>

      <div className="mt-1 flex items-baseline gap-1 border-b border-transparent font-mono text-ink transition-colors focus-within:border-ink hover:border-rule-strong">
        {prefix && <span className="text-graphite">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          aria-label={`${label}, type an exact value`}
          className="w-full bg-transparent py-1 text-[1.35rem] leading-tight tracking-tight outline-none tnum"
          value={editing ? text : formatWithSep(value)}
          onFocus={() => {
            setEditing(true);
            setText(String(value));
          }}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
        {suffix && <span className="text-graphite">{suffix}</span>}
      </div>

      <input
        type="range"
        className="mt-1.5"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={`${prefix ?? ""}${formatWithSep(value)}${suffix ? ` ${suffix}` : ""}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />

      <div className="mt-0.5 flex items-center justify-between gap-2 font-mono text-[0.7rem] text-graphite tnum">
        <span>
          {prefix}
          {formatWithSep(min)}
          {suffix ? ` ${suffix}` : ""}
        </span>
        {hint ? (
          <span className="text-right normal-case">{hint}</span>
        ) : (
          <span>
            {prefix}
            {formatWithSep(max)}
            {suffix ? ` ${suffix}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function formatWithSep(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
