"use client";

import { useId } from "react";
import { useNumericInput, formatWithSep } from "@/hooks/useNumericInput";

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
  const { editing, text, setText, startEditing, commit } = useNumericInput({
    value,
    onChange,
    min,
    max,
  });

  return (
    <div className="py-1">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.82rem] font-medium text-graphite">
          {label}
        </label>
        {labelAside}
      </div>

      <div className="mt-1 flex items-baseline gap-1 border-b border-dashed border-rule-strong text-ink transition-colors focus-within:border-solid focus-within:border-mine hover:border-solid hover:border-mine">
        {prefix && <span className="text-graphite">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          aria-label={`${label}, type an exact value`}
          className="w-full bg-transparent py-1 text-[1.35rem] font-semibold leading-tight tracking-tight outline-none tnum"
          value={editing ? text : formatWithSep(value)}
          onFocus={startEditing}
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

      <div className="mt-0.5 flex items-center justify-between gap-2 text-[0.75rem] text-graphite tnum">
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
