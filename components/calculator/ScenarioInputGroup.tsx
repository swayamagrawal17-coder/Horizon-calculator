"use client";

import { useId, useState } from "react";
import { SliderField } from "@/components/calculator/SliderField";
import { FrequencySelect } from "@/components/calculator/FrequencySelect";
import { SegmentedControl, Zone } from "@/components/ui/primitives";
import type { Mode, ScenarioValues } from "@/components/pages/ComparePage";

export function ScenarioInputGroup({
  index,
  mode,
  values,
  onAmount,
  onPmt,
  onRate,
  onYears,
  onFreq,
  onTiming,
  onLabel,
  onRemove,
  canRemove,
}: {
  index: number;
  mode: Mode;
  values: ScenarioValues;
  onAmount: (v: number) => void;
  onPmt: (v: number) => void;
  onRate: (v: number) => void;
  onYears: (v: number) => void;
  onFreq: (v: number) => void;
  onTiming: (v: "begin" | "end") => void;
  onLabel: (v: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const labelId = useId();
  const [showMore, setShowMore] = useState(false);
  const perLabel = { 1: "yearly", 2: "half-yearly", 4: "quarterly", 12: "monthly" }[
    values.freq
  ] ?? "monthly";

  return (
    <Zone
      eyebrow={values.label || `Scenario ${index}`}
      className={index > 1 ? "border-t border-rule pt-6" : ""}
      aside={
        canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="focusable -m-1 inline-flex min-h-[40px] items-center p-1 text-xs text-graphite underline decoration-dotted underline-offset-4 hover:text-mine hover:decoration-solid"
          >
            Remove
          </button>
        )
      }
    >
      <div className="space-y-4">
        {mode === "emi" && (
          <>
            <SliderField
              label="Loan amount"
              value={values.amount}
              onChange={onAmount}
              min={0}
              max={50_000_000}
              step={10_000}
              prefix="₹"
            />
            <SliderField
              label="Interest rate, per year"
              value={values.ratePct}
              onChange={onRate}
              min={1}
              max={30}
              step={0.05}
              suffix="%"
            />
            <SliderField
              label="Loan length"
              value={values.years}
              onChange={(v) => onYears(Math.round(v))}
              min={1}
              max={30}
              step={1}
              suffix="yr"
            />
          </>
        )}

        {mode === "fv" && (
          <>
            <SliderField
              label="Amount today"
              value={values.amount}
              onChange={onAmount}
              min={0}
              max={50_000_000}
              step={10_000}
              prefix="₹"
            />
            <SliderField
              label="Added each period"
              value={values.pmt}
              onChange={onPmt}
              min={0}
              max={2_000_000}
              step={1_000}
              prefix="₹"
              hint={`${perLabel} · 0 for lump sum only`}
            />
            <SliderField
              label="Expected return, per year"
              value={values.ratePct}
              onChange={onRate}
              min={0}
              max={30}
              step={0.5}
              suffix="%"
            />
            <SliderField
              label="Time"
              value={values.years}
              onChange={(v) => onYears(Math.round(v))}
              min={1}
              max={40}
              step={1}
              suffix="yr"
            />
          </>
        )}

        {mode === "pv" && (
          <>
            <SliderField
              label="Amount due later"
              value={values.amount}
              onChange={onAmount}
              min={0}
              max={100_000_000}
              step={50_000}
              prefix="₹"
            />
            <SliderField
              label="Recurring future payment"
              value={values.pmt}
              onChange={onPmt}
              min={0}
              max={2_000_000}
              step={1_000}
              prefix="₹"
              hint={`${perLabel} · 0 for a single sum`}
            />
            <SliderField
              label="Discount rate, per year"
              value={values.ratePct}
              onChange={onRate}
              min={0}
              max={30}
              step={0.5}
              suffix="%"
            />
            <SliderField
              label="Time until due"
              value={values.years}
              onChange={(v) => onYears(Math.round(v))}
              min={1}
              max={40}
              step={1}
              suffix="yr"
            />
          </>
        )}

        <div className="rule-t pt-3">
          <button
            type="button"
            onClick={() => setShowMore((s) => !s)}
            aria-expanded={showMore}
            className="focusable -m-1 inline-flex min-h-[40px] items-center p-1 text-xs text-mine underline decoration-dotted underline-offset-4 hover:decoration-solid"
          >
            {showMore ? "Fewer options" : "More options"}
          </button>

          {showMore && (
            <div className="mt-3 space-y-4">
              <div>
                <label htmlFor={labelId} className="text-[0.82rem] font-medium text-graphite">
                  Label (optional)
                </label>
                <input
                  id={labelId}
                  type="text"
                  value={values.label}
                  onChange={(e) => onLabel(e.target.value)}
                  placeholder={`Scenario ${index}`}
                  className="focusable mt-1 w-full border-b border-dashed border-rule-strong bg-transparent py-1 text-sm text-ink outline-none transition-colors placeholder:text-graphite focus:border-solid focus:border-mine hover:border-solid hover:border-mine"
                />
              </div>

              {(mode === "fv" || mode === "pv") && (
                <>
                  <FrequencySelect label="Compounding" value={values.freq} onChange={onFreq} />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[0.82rem] font-medium text-graphite">
                      {mode === "fv" ? "Contribution timing" : "Payment timing"}
                    </span>
                    <SegmentedControl
                      label={mode === "fv" ? "Contribution timing" : "Payment timing"}
                      value={values.timing}
                      onChange={onTiming}
                      options={[
                        { value: "end", label: "End" },
                        { value: "begin", label: "Start" },
                      ]}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Zone>
  );
}
